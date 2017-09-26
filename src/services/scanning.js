import axios from "axios";
import { LeadSourceGuid } from "./leadSourceGuid";

const lineaURL = "http://localhost/linea/";

// Send command to linea services
export const sendScanCommand = cmd => {
	return axios.get(`${lineaURL}${cmd}`).then(() => {});
};
