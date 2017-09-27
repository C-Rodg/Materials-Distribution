import axios from "axios";
import { LeadSourceGuid } from "./leadSourceGuid";

const lineaURL = "http://localhost/linea/";

// Send command to linea services
export const sendScanCommand = cmd => {
	return axios.get(`${lineaURL}${cmd}`).then(() => {});
};

export const parse = source => {
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

const parseBarcode = scannedData => {
	let scannedId = scannedData,
		scannedFields = null,
		badgeId = null,
		badgeFirst = null,
		badgeLast = null,
		badgeCompany = null;

	if (scannedData != nulll && scannedData.substring(0, 4) === "VQC:") {
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
		// Handle saving of record or...
	}
};

// Decode languages
const decode_utf8 = s => {
	return decodeURIComponent(window.escape(s));
};

// Generate error
const generateError = msg => {
	return { error: true, msg };
};
