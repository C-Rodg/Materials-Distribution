import axios from "axios";
import { LeadSourceGuid } from "./leadSourceGuid";

import {
	getSeat,
	getClientObject,
	getLeadSourceObject,
	getCurrentToken
} from "./authorization";

// Call external service to get translation
export const translate = async record => {
	let trans = null;
	const seat = await getSeat();
	let url = `${getLeadSourceObject()
		.LeadSourceUrl}/Translate/${LeadSourceGuid.guid}/${seat}`;
	let req = {
		Source: record.ScanData,
		RequestingApplication: record.LeadGuid,
		RequestingClientGuid: getClientObject().ClientGuid
	};
	const translateResponse = await axios({
		url,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `ValidarSession token="${getCurrentToken()}"`
		}
	});
	translateResponse.data.Status = translateResponse.data.TranslationStatus;
	delete translateResponse.data.TranslationStatus;
	await updateTranslation(record.LeadGuid, translateResponse.data);
	return translateResponse.data;
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
