import axios from "axios";
import { LeadSourceGuid } from "./leadSourceGuid";

import {
	getSeat,
	getClientObject,
	getLeadSourceObject,
	getCurrentToken,
	updateToken
} from "./authorization";

// Base Registrant
function Registrant() {
	this.qrFirstName = "";
	this.qrLastName = "";
	this.qrRegId = "";
	this.qrHasAttended = false;

	this.qrGiftAmexWed = "";
	this.qrGiftAmexThurs = "";
	this.qrGiftShirt = "";

	this.qrPickedUpAmexWed = "";
	this.qrPickedUpAmexThurs = "";
	this.qrPickedUpShirt = "";
	this.qrPickedUpGiftB = "";
}

// Call external service to get translation
export const translate = async record => {
	//try {
	const seat = await getSeat();
	const url = `${getLeadSourceObject()
		.LeadSourceUrl}/Translate/${LeadSourceGuid.guid}/${seat}`;
	const req = {
		Source: record.ScanData,
		RequestingApplication: record.LeadGuid,
		RequestingClientGuid: getClientObject().ClientGuid
	};
	let translateResponse = await axios({
		url,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `ValidarSession token="${getCurrentToken()}"`
		},
		withCredentials: true,
		data: req,
		validateStatus: function(status) {
			return status >= 200 && status < 500;
		}
	});
	// Successful request
	if (translateResponse.status === 200) {
		translateResponse.data.Status = translateResponse.data.TranslationStatus;
		delete translateResponse.data.TranslationStatus;
		await updateTranslation(record.LeadGuid, translateResponse.data);
		return translateResponse.data;
	} else if (translateResponse.data && translateResponse.data.Fault) {
		// Handle Validar Error
		// Try again if invalid session
		if (translateResponse.data.Fault.Type === "InvalidSessionFault") {
			await updateToken();
			translateResponse = await axios({
				url,
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `ValidarSession token="${getCurrentToken()}"`
				},
				withCredentials: true,
				data: req
			});
			translateResponse.data.Status = translateResponse.data.TranslationStatus;
			delete translateResponse.data.TranslationStatus;
			await updateTranslation(record.LeadGuid, translateResponse.data);
			return translateResponse.data;
		} else {
			// Throw for any other validar errors
			throw new Error(translateResponse.data.Fault.Type);
		}
	} else {
		// Unknown error
		throw new Error("Unknown fault from translation service...");
	}
};

// Helper to convert chaotic translation data to simplified object
export const convertTranslationToRegistrant = translation => {
	return new Promise((resolve, reject) => {
		if (translation.DataItems && translation.DataItems.length > 0) {
			const registrant = new Registrant();
			translation.DataItems.forEach(item => {
				if (registrant.hasOwnProperty(item.Id)) {
					registrant[item.Id] = item.Value;
				}
			});
			if (!registrant["qrRegId"]) {
				reject({ message: "No registrant ID associated with this record..." });
			}
			if (!registrant["qrHasAttended"]) {
				reject({ message: "Registrant has not yet checked in..." });
			}
			resolve(registrant);
		} else {
			reject({ message: "Invalid translation object" });
		}
	});
};

// Update local version of translation
const updateTranslation = (leadGuid, translation) => {
	return axios.put(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/leads/${leadGuid}/translation`,
		translation
	);
};

// Find record(s)
export const findRecord = query => {
	return axios.get(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/leads?${query}`
	);
};

// Save new record
export const saveNewRecord = record => {
	return axios.put(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/leads`,
		record
	);
};

// Save a visit
export const saveVisit = lead => {
	return axios.put(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/visits`,
		lead
	);
};

// Mark record as deleted
export const markDeleted = guid => {
	return axios.put(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/leads/${guid}/deleted`,
		{}
	);
};

// Mark record as undeleted
export const markUndeleted = guid => {
	return axios.put(
		`http://localhost/leadsources/${LeadSourceGuid.guid}/leads/${guid}/undeleted`,
		{}
	);
};
