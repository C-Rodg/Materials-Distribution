import axios from "axios";

import { PWS_OBJ } from "./pwsConfig";
import { HANNAH_GUID } from "../config/eventGuid";

export const uploadToPws = async registrant => {
	const data = buildSOAPBody();
	axios({
		url: PWS_OBJ.url,
		method: "POST",
		headers: {
			"Content-Type": "text/xml; charset=utf-8",
			SOAPAction: PWS_OBJ.action
		},
		withCredentials: true,
		data
	});
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
