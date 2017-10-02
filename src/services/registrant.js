import axios from "axios";
import { LeadSourceGuid } from "./leadSourceGuid";

import {
	getSeat,
	getClientObject,
	getLeadSourceObject,
	getCurrentToken,
	updateToken
} from "./authorization";

import { BASE_FIELDS, PICKUP_ITEMS } from "../config/pickupItems";

// Base Registrant
function Registrant() {
	this.qrFirstName = "";
	this.qrLastName = "";
	this.qrRegId = "";
	this.qrHasAttended = false;
	this.items = [];
}

// Checkbox Pickup Item
function TrueFalseItem(obj) {
	this.hasPickedUp = false;
	this.disabled = true;

	this.type = "TF";
	this.name = obj.name;
	this.lcTag = obj.lcTag;
	this.pwsTag = obj.pwsTag;
	this.allowTag = obj.allowTag;
	this.missingIsDisabled = obj.missingIsDisabled;
	this.valueToEnable = obj.valueToEnable;
	this.appendInputToName = obj.appendInputToName;
}

// Switch Pickup Item
function SwitchItem(obj) {
	this.type = "SWITCH";
	this.lcTag = obj.lcTag;
	this.pwsTag = obj.pwsTag;
	this.allowTag = obj.allowTag;
	this.valOne = obj.valOne;
	this.valTwo = obj.valTwo;
	this.selected = "";
	this.disabled = true;
	this.hasPickedUp = false;
	this.valueToEnable = obj.valueToEnable;
}

// Helper to extract values from DataItems of Translation
const getTranslationDataItem = (dataItems, id) => {
	let searchingId = id.toUpperCase();
	const idx = dataItems.findIndex(item => {
		return item.Id.toUpperCase() === searchingId;
	});
	if (idx > -1) {
		return dataItems[idx].Value;
	}
	return "";
};

// Helper to convert chaotic translation data to simplified object
export const convertTranslationToRegistrant = translation => {
	return new Promise((resolve, reject) => {
		if (translation.DataItems) {
			const registrant = new Registrant();

			// Create base items
			registrant.items = PICKUP_ITEMS.map(configItem => {
				if (configItem.type === "TF") {
					return new TrueFalseItem(configItem);
				} else if (configItem.type === "SWITCH") {
					return new SwitchItem(configItem);
				}
			});

			const transDI = translation.DataItems;
			// Assign base fields
			BASE_FIELDS.forEach(field => {
				registrant[field] = getTranslationDataItem(transDI, field);
			});
			for (let i = 0, j = registrant.items.length; i < j; i++) {
				const item = registrant.items[i];
				// BEWARE OF REGEX BUG: ALTERNATING TEST VALUES.. use only one .test() per regex
				const regExValue = new RegExp(item.valueToEnable, "ig");
				if (item.type === "TF") {
					const val = getTranslationDataItem(transDI, item.allowTag);
					// If value is missing and missing is disabled is false, allow field
					if (!val && !item.missingIsDisabled) {
						item.disabled = false;
					} else if (regExValue.test(val)) {
						// Test if field should be allowed
						item.disabled = false;
					}
					// Test if item has already been picked up
					const pickupVal = getTranslationDataItem(transDI, item.pwsTag);
					if (pickupVal) {
						item.hasPickedUp = true;
						item.disabled = true;
					}

					// Test if you need to append input to name
					if (item.appendInputToName && val) {
						item.name += val;
					}
				} else if (item.type === "SWITCH") {
					// Test if person is allowed to pickup item
					const val = getTranslationDataItem(transDI, item.allowTag);
					if (!val && !item.missingIsDisabled) {
						item.disabled = false;
					} else if (regExValue.test(val)) {
						item.disabled = false;
					}
					// Test if person has already picked up item
					const pickupVal = getTranslationDataItem(transDI, item.pwsTag);
					if (pickupVal) {
						item.hasPickedUp = true;
						item.selected = pickupVal;
						item.disabled = true;
					}
				}
			}

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

// Call external service to get translation
export const translate = async record => {
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
