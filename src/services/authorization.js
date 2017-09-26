import axios from "axios";
import { LeadSourceGuid } from "./leadSourceGuid";

let currentToken = null,
	leadsource = null,
	client = null,
	seat = null;

export const startUpApplication = async () => {
	try {
		await getClientAndLeadSource();
		const tokenResponse = await getAuthToken();
		if (tokenResponse.data && tokenResponse.data.SessionToken) {
			currentToken = tokenResponse.data.SessionToken;
		} else {
			await updateToken();
		}
		await getSeat();
		return { Success: true };
	} catch (e) {
		console.log("ERROR BUBBLED!");
		console.log(e);
	}
};

export const getClientAndLeadSource = () => {
	return Promise.all([getClientInfo(), getLeadSourceInfo()]);
};

// Get Client Info
const getClientInfo = async () => {
	const clientResponse = await axios.get("http://localhost/clientinfo");
	client = clientResponse.data;
	return client;
};

// Get Lead Source Info
const getLeadSourceInfo = async () => {
	const leadResponse = await axios.get(
		`http://localhost/leadsources/${LeadSourceGuid.guid}`
	);
	leadsource = leadResponse.data.LeadSource;
	return leadsource;
};

// -------- AUTH SERVICES --------------- //

// Get Auth Token
const getAuthToken = () => {
	return axios.get(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/sessiontoken`
	);
};

// Update Auth Token
export const updateToken = () => {
	return initiateChallenge()
		.then(computeHash)
		.then(validateChallenge)
		.then(saveToken);
};

// Initiate Challenge
const initiateChallenge = async () => {
	let loginArgs = {
		loginRestUrl: leadsource.LoginUrl,
		authCode: leadsource.AuthCode,
		authGuid: leadsource.AuthGuid
	};
	const initResponse = await axios.post(
		`${loginArgs.loginRestUrl}/InitiateChallenge/${loginArgs.authGuid}`,
		loginArgs
	);
	loginArgs.challenge = initResponse.data;
	return loginArgs;
};

// Compute the Hash
const computeHash = async loginArgs => {
	let request = {
		authcode: loginArgs.authCode,
		nonce: loginArgs.challenge.Nonce
	};
	const hashResponse = await axios.post(
		`http://localhost/digestauthentication/computehash`,
		request
	);
	loginArgs.hash = hashResponse.data.Hash;
	return loginArgs;
};

// Validate Challenge
const validateChallenge = async loginArgs => {
	let urlHash = loginArgs.hash.replace(/\//g, "_");
	urlHash = urlHash.replace(/\+/g, "-");
	const challengeResponse = await axios.post(
		`${loginArgs.loginRestUrl}/ValidateChallenge/${loginArgs.challenge
			.ChallengeGuid}/${encodeURIComponent(urlHash)}`,
		loginArgs
	);
	return challengeResponse.data.SessionToken;
};

// Save the token
const saveToken = token => {
	let sendToken = {
		SessionToken: token
	};
	currentToken = token;

	return axios.put(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/sessiontoken`,
		sendToken
	);
};

// Get Currently Assigned Auth Token
export const getCurrentToken = () => {
	return currentToken;
};

// ------------- SEAT SERVICES -------------- //

// Get Seat from local database or acquire one if necessary
const getSeat = async () => {
	const seatResponse = await axios.get(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/seat`
	);
	if (seatResponse.data && seatResponse.data.SeatGuid) {
		seat = seatResponse.data.SeatGuid;
		return seat;
	}
	const acquireResponse = await acquireSeat();
	if (acquireResponse.data && acquireResponse.data.SeatGuid) {
		seat = acquireResponse.data.SeatGuid;
		await setSeat(acquireResponse.data);
		return seat;
	}
};

// Acquire Seat
const acquireSeat = () => {
	const url = `${leadsource.LeadSourceUrl}/AcquireSeat/${LeadSourceGuid.guid}`;
	const obj = {
		clientGuid: client.ClientGuid,
		application: `${client.Application} ${client.ApplicationVersion}`,
		operatingSystem: `${client.SystemName} ${client.SystemVersion}`,
		description: `${client.DeviceType}:  ${client.ClientName}`
	};
	return axios({
		url,
		headers: {
			Authorization: `ValidarSession token="${getCurrentToken()}"`
		},
		withCredentials: true,
		method: "POST",
		data: obj
	});
};

// Save seat to local
const setSeat = seat => {
	return axios.put(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/seat`,
		seat
	);
};

const releaseSeat = () => {
	if (seat) {
		const url = `${leadsource.LeadSourceUrl}/ReleaseSeat/${LeadSourceGuid.guid}/${seat}`;
		let obj = {
			leadSourceGuid: LeadSourceGuid.guid
		};
		return axios({
			url,
			method: "POST",
			headers: {
				Authorization: `ValidarSession token="${getCurrentToken()}"`
			},
			withCredentials: true,
			data: obj
		});
	}
};
