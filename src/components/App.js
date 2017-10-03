import React, { Component } from "react";

import Header from "./Header";
import WaitingContent from "./WaitingContent";
import RegistrantContent from "./RegistrantContent";
import Toast from "./Toast";

import {
	startUpApplication,
	getClientAndLeadSource
} from "../services/authorization";

import { sendScanCommand, parse } from "../services/scanning";
import { uploadToPWS } from "../services/pws";

import { soundScan, soundDeny, soundAccept } from "../services/sounds";

import {
	translate,
	convertTranslationToRegistrant
} from "../services/registrant";

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			registrant: null,
			isLoading: false,
			isConfirming: false,
			isConfirmed: false,
			errorMsg: "",
			errorCount: 0,
			formTouched: false
		};
	}

	componentDidMount() {
		window.OnLineaConnect = this.handleLineaConnect;
		window.OnDataRead = this.handleOnDataRead;

		startUpApplication()
			.then(data => {
				// Successfully started application
				sendScanCommand("enableButtonScan");
			})
			.catch(err => {
				alert("We ran into an issue trying to boot up the application...");
			});
	}

	// EVENT - Handle OnDataRead function from a scan
	handleOnDataRead = data => {
		// If not on scan page..
		if (this.state.registrant) {
			this.displayError("Please first go back to scan a new registrant..");
			soundDeny();
			return false;
		}
		// If we're not online
		if (!window.navigator.onLine) {
			this.displayError("Device appears to be offline..");
			soundDeny();
			return false;
		}

		// Play scan sound
		soundScan();

		// Parse badge data, translate, reload record, parse and set registrant
		let scanData = "";
		this.setState({ isLoading: true }, () => {
			parse(data)
				.then(parseData => {
					scanData = parseData.ScanData;
					return translate(parseData);
				})
				.then(translateData => {
					return convertTranslationToRegistrant(translateData);
				})
				.then(translatedReg => {
					translatedReg.ScanData = scanData;
					this.setState({
						registrant: translatedReg,
						isConfirming: false
					});
				})
				.catch(parseError => {
					soundDeny();
					this.displayError(parseError.message);
					this.setState({ isLoading: false });
				});
		});
	};

	// EVENT - Update registrant object with new values
	handleUpdateRegistrantObject = (pwsTag, value) => {
		const items = this.state.registrant.items.map(item => {
			if (item.pwsTag === pwsTag && item.type === "TF") {
				return Object.assign({}, item, { hasPickedUp: value });
			} else if (item.pwsTag === pwsTag && item.type === "SWITCH") {
				return Object.assign({}, item, { selected: value });
			}
			return item;
		});

		this.setState(prevState => {
			const registrant = Object.assign({}, prevState.registrant, { items });
			return { registrant, formTouched: true };
		});
	};

	// EVENT - save registrant pickup
	handleSaveRegistrant = registrant => {
		if (!this.state.formTouched) {
			return false;
		}
		if (!window.navigator.onLine) {
			this.displayError("Device appears to be offline..");
			soundDeny();
			return false;
		}
		this.setState({ isConfirming: true, isConfirmed: false }, () => {
			uploadToPWS(registrant)
				.then(uploadResponse => {
					if (uploadResponse && uploadResponse.success) {
						soundAccept();
						this.resetRegistrant("Successfully uploaded registrant!");
					} else {
						soundDeny();
						this.setState({ isConfirming: false, isConfirmed: false }, () => {
							this.displayError("Failed to upload registrant..");
						});
					}
				})
				.catch(err => {
					soundDeny();
					this.setState({ isConfirming: false, isConfirmed: false }, () => {
						this.displayError(err.message);
					});
				});
		});
	};

	// HELPER - function for reseting registrant
	resetRegistrant = msg => {
		this.setState(
			{
				registrant: null,
				isConfirmed: false,
				isConfirming: false,
				isLoading: false,
				formTouched: false
			},
			() => {
				if (msg) {
					this.displayError(msg);
				}
			}
		);
	};

	// HELPER - Display Error to user
	displayError = msg => {
		this.setState(prevState => {
			return {
				errorMsg: msg,
				errorCount: prevState.errorCount + 1
			};
		});
	};

	// LINEA - Handle Linea device connected and enable scanning
	handleLineaConnect = () => {
		sendScanCommand("enableButtonScan");
		getClientAndLeadSource().then(() => {});
	};

	// EVENT - Scan button pressed
	handleStartScan = ev => {
		ev.currentTarget.classList.add("scan-clicked");
		sendScanCommand("startScan");
		return false;
	};

	// EVENT - Scan button released
	handleStopScan = ev => {
		ev.currentTarget.classList.remove("scan-clicked");
		sendScanCommand("stopScan");
		//return false;
	};

	// EVENT - Back button clicked
	handleGoBack = () => {
		soundDeny();
		var confirmLeave = window.confirm(
			"Are you sure you want to leave this record?  This data associated with this record will not be saved."
		);
		if (confirmLeave) {
			this.setState({
				registrant: null,
				formTouched: false,
				isLoading: false
			});
		}
	};

	render() {
		return (
			<div className="app">
				<Toast msg={this.state.errorMsg} counter={this.state.errorCount} />
				<Header
					onGoBack={this.handleGoBack}
					registrant={this.state.registrant}
				/>
				<main className="main">
					{this.state.registrant ? (
						<RegistrantContent
							registrant={this.state.registrant}
							onSaveRegistrant={this.handleSaveRegistrant}
							updateRegistrantObject={this.handleUpdateRegistrantObject}
							isConfirming={this.state.isConfirming}
							isConfirmed={this.state.isConfirmed}
							formTouched={this.state.formTouched}
						/>
					) : (
						<WaitingContent
							onStartScan={this.handleStartScan}
							onStopScan={this.handleStopScan}
							isLoading={this.state.isLoading}
						/>
					)}
				</main>
			</div>
		);
	}
}

export default App;
