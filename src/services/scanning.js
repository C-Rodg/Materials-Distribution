import axios from "axios";
import { LeadSourceGuid } from "./leadSourceGuid";

const lineaURL = "http://localhost/linea/";

import { getClientObject } from "./authorization";
import {
	findRecord,
	saveNewRecord,
	saveVisit,
	markDeleted,
	markUndeleted
} from "./registrant";

// Send command to linea services
export const sendScanCommand = cmd => {
	return axios.get(`${lineaURL}${cmd}`).then(() => {});
};

export const parse = async source => {
	let symbology = source[0].Symbology,
		scannedData = decode_utf8(source[0].Data); // Assuming linea sled

	let checkSymbology = symbology;
	if (checkSymbology != null) {
		checkSymbology = checkSymbology.replace(/\s+/g, "").toUpperCase();
	}

	if (checkSymbology === "QRCODE") {
		return parseBarcode(scannedData);
	} else if (checkSymbology === "CODE3OF9" || checkSymbology === "CODE39") {
		return parseBarcode(scannedData);
	} else if (checkSymbology === "PDF417") {
		return generateError(`${checkSymbology} is not supported.`);
	} else if (checkSymbology === "CODE128") {
		return generateError(`${checkSymbology} is not supported.`);
	} else if (checkSymbology === "AZTEK") {
		return generateError(`${checkSymbology} is not supported.`);
	} else {
		return generateError(`${checkSymbology} is not supported.`);
	}
};

const parseBarcode = async scannedData => {
	let scannedId = scannedData,
		scannedFields = null,
		badgeId = null,
		badgeFirst = null,
		badgeLast = null,
		badgeCompany = null;
	if (scannedData != null && scannedData.substring(0, 4) === "VQC:") {
		scannedData = scannedData.substring(4);
		scannedFields = scannedData.split(";");
		if (scannedFields != null) {
			scannedFields.forEach(fieldGroup => {
				let field = fieldGroup.split(":");
				if (field != null && field.length > 0) {
					if (field[0] === "ID") {
						badgeId = field[1];
					} else if (field[0] === "FN") {
						badgeFirst = field[1];
					} else if (field[0] === "LN") {
						badgeLast = field[1];
					} else if (field[0] === "CO") {
						badgeCompany = field[1];
					}
				}
			});
		}
	} else if (
		scannedData != null &&
		(scannedData.match(/;/g) || []).length >= 2
	) {
		// Other QR codes, assume badgeId[0]
		scannedFields = scannedData.split(";");
		if (scannedFields !== null) {
			badgeId = scannedFields[0];
			badgeFirst = scannedFields[1];
			badgeLast = scannedFields[2];
			if (scannedFields[3]) {
				badgeCompany = scannedFields[3];
			}
		}
	} else {
		badgeId = scannedData;
		scannedId = scannedData;
	}

	scannedId = scannedId.replace(/^\s+|\s+$/g, "");
	if (scannedId !== "" && scannedId.length < 384) {
		// TODO: PLAY GRANTED SOUND
		const findResponse = await findRecord(`ScanData=${scannedId}`);
		const client = getClientObject();
		const visit = {
			ScanData: scannedId,
			CapturedBy: client.ClientName,
			CaptureStation: ""
		};
		const d = new Date();
		if (findResponse.data && findResponse.data.length > 0) {
			visit.CaptureStation = `<scan>${d.toISOString()}||Returning scan</scan>`;
			await saveVisit(visit);
			const guid = findResponse.data[0].LeadGuid;
			if (findResponse.data[0].DeleteDateTime !== null) {
				await markUndeleted(guid);
			} else {
				await markDeleted(guid);
				await markUndeleted(guid);
			}
			return findResponse.data[0];
		} else {
			visit.CaptureStation = `<scan>${d.toISOString()}||New scan</scan>`;
			const lead = {
				ScanData: scannedId,
				Keys: [
					{ Type: "7A56282B-4855-4585-B10B-E76B111EA1DB", Value: badgeId }
				],
				Responses: []
			};
			const resp = lead.Responses;
			if (scannedData) {
				resp.push({ Tag: "lcUnmapped", Value: scannedData });
			}
			if (badgeId) {
				resp.push({ Tag: "lcBadgeId", Value: badgeId });
			}
			if (badgeFirst) {
				resp.push({ Tag: "lcFirstName", Value: badgeFirst });
			}
			if (badgeLast) {
				resp.push({ Tag: "lcLastName", Value: badgeLast });
			}
			if (badgeCompany) {
				resp.push({ Tag: "lcCompany", Value: badgeCompany });
			}

			lead.Keys.push({
				Type: "F9F457FE-7E6B-406E-9946-5A23C50B4DF5",
				Value: `${client.DeviceType}|${client.ClientName}`
			});

			const saveNewResponse = await saveNewRecord(lead);
			lead.LeadGuid = saveNewResponse.data.LeadGuid;

			await saveVisit(visit);
			return lead;
		}
	}
};

// Decode languages
const decode_utf8 = s => {
	return decodeURIComponent(window.escape(s));
};

// Generate error
export const generateError = message => {
	return new Promise((resolve, reject) => {
		reject({ message });
	});
};
