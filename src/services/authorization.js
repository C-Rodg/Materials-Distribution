import axios from "axios";
import { LeadSourceGuid } from "./leadSourceGuid";

let currentToken = null,
	leadsource = null,
	client = null,
	seat = null;

export const startUpApplication = async () => {
	try {
		console.log("Get client and lead source");
		await Promise.all([getClientInfo(), getLeadSourceInfo()]);
		console.log("Getting Token");
		const tokenResponse = await getAuthToken();
		if (tokenResponse.data && tokenResponse.data.SessionToken) {
			currentToken = tokenResponse.data.SessionToken;
		} else {
			console.log("Updating token");
			await updateToken();
		}
		await getSeat();
		console.log("----------------");
		console.log(seat);
		console.log(client);
		console.log(leadsource);
		console.log(currentToken);
		console.log("----------------");
	} catch (e) {
		console.log("ERROR BUBBLED!");
		console.log(e);
	}
};

// Get Client Info
const getClientInfo = async () => {
	const clientResponse = await axios.get("http://localhost/clientinfo");
	client = clientResponse.data;
	console.log(client);
	return client;
};

// Get Lead Source Info
const getLeadSourceInfo = async () => {
	const leadResponse = await axios.get(
		`http://localhost/leadsources/${LeadSourceGuid.guid}`
	);
	leadsource = leadResponse.data.LeadSource;
	console.log(leadsource);
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
	console.log("startingin initiate");
	let loginArgs = {
		loginRestUrl: leadsource.LoginUrl,
		authCode: leadsource.AuthCode,
		authGuid: leadsource.AuthGuid
	};
	const inititateResponse = await axios.post(
		`${loginArgs.loginRestUrl}/InitiateChallenge/${loginArgs.authGuid}`,
		loginArgs
	);
	loginArgs.challenge = initiateResponse.data;
	console.log(loginArgs);
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
	console.log(loginArgs);
	return loginArgs;
};

// Validate Challenge
const validateChallenge = async loginArgs => {
	let urlHash = loginArgs.hash.replace(/\//g, "_");
	urlHash = urlHash.replace(/\+/g, "-");
	const challengeResponse = await axios.post(
		`${loginARgs.loginRestUrl}/ValidateChallenge/${loginArgs.challenge
			.ChallengeGuide}/${encodeURIComponent(urlHash)}`,
		loginArgs
	);
	console.log(challengeResponse.data.SessionToken);
	return challengeResponse.data.SessionToken;
};

// Save the token
const saveToken = loginArgs => {
	let currentToken = {
		SessionToken: loginArgs.SessionToken
	};
	currentToken = loginArgs.SessionToken;

	return this.http.put(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/sessiontoken`,
		currentToken
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
		method: "post",
		data: obj,
		headers: {
			Authorization: `ValidarSession token="${getCurrentToken()}"`
		}
	});
};

const releaseSeat = () => {
	if (seat) {
		const url = `${leadsource.LeadSourceUrl}/ReleaseSeat/${LeadSourceGuid.guid}/${seat}`;
		let obj = {
			leadSourceGuid: LeadSourceGuid.guid
		};
		return axios({
			url,
			data: obj,
			headers: {
				Authorization: `ValidarSession token="${getCurrentToken()}"`
			}
		});
	}
};
