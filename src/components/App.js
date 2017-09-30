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
				console.log("scanSendCommand sent..");
			})
			.catch(err => {
				alert("We ran into an issue trying to boot up the application...");
			});
	}

	// Handle OnDataRead function from a scan
	handleOnDataRead = data => {
		//this.setState({ isLoading: true });

		// If not on scan page..
		if (this.state.registrant) {
			this.displayError("Please first go back to scan a new registrant..");
			return false;
		}
		// If we're not online
		if (!window.navigator.onLine) {
			this.displayError("Device appears to be offline..");
			return false;
		}
		// Parse badge data, translate, reload record, parse and set registrant
		let scanData = "";
		this.setState({ isLoading: true }, () => {
			parse(data)
				.then(parseData => {
					scanData = parseData.ScanData;
					return translate(parseData);
				})
				.then(translateData => {
					console.log(translateData);
					return convertTranslationToRegistrant(translateData);
				})
				.then(translatedReg => {
					console.log(translatedReg);
					translatedReg.ScanData = scanData;
					this.setState({
						registrant: translatedReg,
						isConfirming: false
					});
				})
				.catch(parseError => {
					this.displayError(parseError.message);
					this.setState({ isLoading: false });
				});
		});
	};

	// Display Error to user
	displayError = msg => {
		this.setState(prevState => {
			return {
				errorMsg: msg,
				errorCount: prevState.errorCount + 1
			};
		});
	};

	// Handle Linea device connected and enable scanning
	handleLineaConnect = () => {
		sendScanCommand("enableButtonScan");
		getClientAndLeadSource().then(() => {});
	};

	// Back button clicked
	handleGoBack = () => {
		var confirmLeave = window.confirm(
			"Are you sure you want to leave this record?  This data associated with this record will not be saved."
		);
		if (confirmLeave) {
			this.setState(
				{
					registrant: null,
					formTouched: false,
					isLoading: false
				},
				() => {
					console.log(this.state.registrant);
				}
			);
		}
	};

	// Scan button pressed
	handleStartScan = ev => {
		ev.currentTarget.classList.add("scan-clicked");
		sendScanCommand("startScan");
		return false;
	};

	// Scan button released
	handleStopScan = ev => {
		ev.currentTarget.classList.remove("scan-clicked");
		sendScanCommand("stopScan");
		//return false;
	};

	// Update registrant object with new values
	handleUpdateRegistrantObject = (pwsTag, value) => {
		console.log(pwsTag, value);
		const items = this.state.registrant.items.map(item => {
			if (item.pwsTag === pwsTag && item.type === "TF") {
				return Object.assign({}, item, { hasPickedUp: value });
			} else if (item.pwsTag === pwsTag && item.type === "SWITCH") {
				return Object.assign({}, item, { selected: value });
			}
			return item;
		});
		console.log(items);
		this.setState(prevState => {
			const registrant = Object.assign({}, prevState.registrant, { items });
			return { registrant, formTouched: true };
		});
	};

	// Save registrant pickup
	handleSaveRegistrant = registrant => {
		if (!this.state.formTouched) {
			return false;
		}
		// TODO: HANDLE SAVING AND SHOW THANK YOU AND RESET
		console.log("savingggg");
		console.log(registrant);
		this.setState({ isConfirming: true });

		// Fake completion of save
		setTimeout(() => {
			//TESTING ERROR NOTIFICATION
			this.setState(prevState => {
				return {
					errorMsg: "Unable to save this registrant...",
					errorCount: prevState.errorCount + 1,
					isConfirmed: false,
					isConfirming: false
				};
			});
			return false;

			this.setState({
				isConfirming: false,
				isConfirmed: true
			});

			// Reset to main view
			setTimeout(() => {
				this.setState({
					registrant: null,
					isConfirming: false,
					isConfirmed: false,
					isLoading: false,
					formTouched: false
				});
			}, 2000);
		}, 1500);
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
