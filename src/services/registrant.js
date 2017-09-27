import axios from "axios";
import { LeadSourceGuid } from "./leadSourceGuid";

import {
	getSeat,
	getLeadSourceURL,
	getClientGuid,
	getCurrentToken
} from "./authorization";

// Call external service to get translation
export const translate = async record => {
	let trans = null;
	const seat = await getSeat();
	let url = `${getLeadSourceURL()}/Translate/${LeadSourceGuid.guid}/${seat}`;
	let req = {
		Source: record.ScanData,
		RequestingApplication: record.LeadGuid,
		RequestingClientGuid: getClientGuid()
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
