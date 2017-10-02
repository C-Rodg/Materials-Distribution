import axios from "axios";

import { PWS_OBJ } from "./pwsConfig";
import { HANNAH_GUID } from "../config/eventGuid";

import { generateError } from "./scanning";
import {
	findRecord,
	saveVisit,
	markUndeleted,
	markDeleted
} from "./registrant";
import { getClientObject } from "./authorization";

export const uploadToPWS = async registrant => {
	const registrantXml = registrantToXML(registrant);
	const soapBody = buildSOAPBody(registrantXml);
	const pwsResponse = await axios({
		url: PWS_OBJ.url,
		method: "POST",
		headers: {
			"Content-Type": "text/xml; charset=utf-8",
			SOAPAction: PWS_OBJ.action
		},
		withCredentials: true,
		data: soapBody
	});
	if (
		pwsResponse.status === 200 &&
		pwsResponse.data &&
		pwsResponse.data.indexOf("&lt;Success&gt;true&lt;/Success&gt;")
	) {
		const recordResponse = await findRecord(`ScanData=${registrant.ScanData}`);
		if (recordResponse.data && recordResponse.data.length > 0) {
			const client = getClientObject();
			const d = new Date();
			const visit = {
				ScanData: registrant.Scan,
				CapturedBy: client.ClientName,
				CaptureStation: `<save><t>${d.toISOString}</t>${registrantXml}</save>`
			};
			await saveVisit(visit);
			const guid = recordResponse.data[0].LeadGuid;
			if (recordResponse.data[0].DeleteDateTime !== null) {
				await markUndeleted(guid);
			} else {
				await markDeleted(guid);
				await markUndeleted(guid);
			}
			return { success: true };
		} else {
			return generateError("Unable to save new visit..");
		}
	} else {
		return generateError("Failed to upload registrant..");
	}
};

const buildSOAPBody = updatesXML => {
	const header = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <soap:Header>
                <AuthenticationSoapHeader xmlns="https://portal.validar.com/">
                    <Username>${PWS_OBJ.username}</Username>
                    <Password>${PWS_OBJ.password}</Password>
                </AuthenticationSoapHeader>
            </soap:Header>
            <soap:Body>
                <PutRegistrationData xmlns="https://portal.validar.com/">
                    <eventGuid>${HANNAH_GUID}</eventGuid>
                    <data><![CDATA[
                        <updates>
                    `;

	const footer = `</updates>]]>
                </data>
            </PutRegistrationData>
        </soap:Body>
    </soap:Envelope>`;

	return `${header}${updatesXML}${footer}`;
};

const registrantToXML = registrant => {
	let xmlStr = `<update><registrantId>${registrant.qrRegId}</registrantId>`;
	registrant.items.forEach(item => {
		if (!item.disabled) {
			if (item.type === "TF" && item.hasPickedUp) {
				xmlStr += `<${item.pwsTag}>YES</${item.pwsTag}>`;
			} else if (item.type === "SWITCH" && item.selected) {
				xmlStr += `<${item.pwsTag}>${item.selected}</${item.pwsTag}>`;
			}
		}
	});
	xmlStr += "</update>";
	return xmlStr;
};
