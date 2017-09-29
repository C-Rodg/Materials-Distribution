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
	this.items = [];
}
const baseFields = ["qrFirstName", "qrLastName", "qrRegId", "qrHasAttended"];
const allowedGiftTrueFalseFields = ["qrGiftAmexWed", "qrGiftAmexThurs"];
const allowedGiftValueFields = ["qrGiftShirt"];
const alreadyGotFields = [
	"qrPickedUpAmexWed",
	"qrPickedUpAmexThurs",
	"qrPickedUpShirt",
	"qrPickedUpGiftB"
];
const configItems = [
	{
		type: "TF",
		name: "American Express - Wednesday",
		lcTag: "lcPickedUpAmexWed",
		pwsTag: "qrPickedUpAmexWed",
		allowTag: "qrGiftAmexWed"
	},
	{
		type: "TF",
		name: "American Express - Thursday",
		lcTag: "lcPickedUpAmexThurs",
		pwsTag: "qrPickedUpAmexThurs",
		allowTag: "qrGiftAmexThurs"
	},
	{
		type: "TF",
		name: "T-Shirt ",
		lcTag: "lcPickedUpShirt",
		pwsTag: "qrPickedUpShirt",
		allowTag: "qrGiftShirt"
	},
	{
		type: "SWITCH",
		lcTag: "lcPickedUpGiftB",
		pwsTag: "qrPickedUpGiftB",
		allowTag: "qrPickedUpGiftB",
		valOne: "Oversized Truck",
		valTwo: "Hat"
	}
];

function TrueFalseItem(obj) {
	this.type = "TF";
	this.name = obj.name;
	this.lcTag = obj.lcTag;
	this.pwsTag = obj.pwsTag;
	this.allowTag = obj.allowTag;
	this.hasPickedUp = false;
	this.disabled = true;
}

function SwitchItem(obj) {
	this.type = "SWITCH";
	this.lcTag = obj.lcTag;
	this.pwsTag = obj.pwsTag;
	this.allowTag = obj.allowTag;
	this.valOne = obj.valOne;
	this.valTwo = obj.valTwo;
	this.selected = "";
	this.disabled = false;
	this.hasPickedUp = false;
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

			// Create base items
			registrant.items = configItems.map(configItem => {
				if (configItem.type === "TF") {
					return new TrueFalseItem(configItem);
				} else if (configItem.type === "SWITCH") {
					return new SwitchItem(configItem);
				}
			});

			// SWITCH TO LOOPING THROUGH DECLARATIONS...
			// GETTING VALUE FROM DATAITEM...
			// SETTING REGISTRANT VALUE...
			// START HERE
			translation.Declarations.forEach(decItem => {
				if (baseFields.indexOf(item.Id) > -1) {
				}
			});

			translation.DataItems.forEach(item => {
				if (baseFields.indexOf(item.Id) > -1) {
					// Mark Base Registrant props
					registrant[item.Id] = item.Value;
				} else if (allowedGiftTrueFalseFields.indexOf(item.Id) > -1) {
					// Mark not 'disabled' prop for yes/no items
					if (item.Value.toUpperCase() === "YES") {
						const idx = registrant.items.findIndex(
							regItem => regItem.allowTag === item.Id
						);
						registrant.items[idx].disabled = false;
					}
				} else if (allowedGiftValueFields.indexOf(item.Id) > -1) {
					// Mark not 'disabled' and change name for value items
					if (item.Value) {
						const idx = registrant.items.findIndex(
							regItem => regItem.allowTag === item.Id
						);
						registrant.items[idx].disabled = false;
						registrant.items[idx].name += `${item.Value}`;
					}
				} else if (alreadyGotFields.indexOf(item.Id) > -1) {
					// Mark 'hasPickedUp'
					if (item.Value) {
						const idx = registrant.items.findIndex(
							regItem => regItem.pwsTag === item.Id
						);
						if (registrant.items[idx].type === "TF") {
							registrant.items[idx].hasPickedUp = true;
						} else if (registrant.items[idx].type === "SWITCH") {
							registrant.items[idx].selected = item.Value;
							registrant.items[idx].disabled = true;
						}
					}
				}
			});
			// TESTING - resolve for now
			resolve(registrant);
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
