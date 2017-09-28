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
			errorCount: 0
		};
	}

	componentDidMount() {
		startUpApplication()
			.then(data => {
				// Successfully started application
			})
			.catch(err => {
				alert("We ran into an issue trying to boot up the application...");
			});

		window.OnLineaConnect = this.handleLineaConnect;
		window.OnDataRead = this.handleOnDataRead;
		sendScanCommand("enableButtonScan");
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
		parse(data)
			.then(parseData => {
				scanData = parseData.ScanData;
				return translate(parseData);
			})
			.then(translateData => {
				console.log(translateData);
				return convertTranslationToRegistrant(translateData);
			})
			.then(registrant => {
				console.log(registrant);
			})
			.catch(parseError => {
				//console.log(parseError.message);
				this.displayError(parseError.message);
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
		// TODO: ALERT OF UNSAVED CHANGES
		var confirm = confirm(
			"Are you sure you want to leave this record?  This records data will not be saved."
		);
		if (confirm) {
			this.setState({
				registrant: null,
				isLoading: false
			});
		}
	};

	// Scan button pressed
	handleStartScan = ev => {
		ev.currentTarget.classList.add("scan-clicked");
		sendScanCommand("startScan");
		return false;
		const items = [
			{
				type: "TF",
				name: "American Express - Wednesday",
				tag: "qrPickedUpAmexWed",
				hasPickedUp: true,
				disabled: false
			},
			{
				type: "TF",
				name: "American Express - Thursday",
				tag: "qrPickedUpAmexThurs",
				hasPickedUp: false,
				disabled: false
			},
			{
				type: "TF",
				name: "T-Shirt (Medium)",
				tag: "qrPickedUpShirt",
				hasPickedUp: false,
				disabled: true
			},
			{
				type: "TF",
				name: "iPad",
				tag: "qrIpad",
				hasPickedUp: true,
				disabled: true
			},
			{
				type: "SWITCH",
				tag: "qrPickedUpGiftB",
				valOne: "Oversized Truck",
				valTwo: "Hat",
				selected: "",
				disabled: false
			}
		];
		this.setState({ isLoading: true });
		setTimeout(() => {
			// this.setState(prevState => {
			// 	return {
			// 		errorMsg: "There was an issue loading this registrant...",
			// 		errorCount: prevState.errorCount + 1,
			// 		isLoading: false
			// 	};
			// });
			// return false;
			this.setState({
				registrant: {
					firstName: "James",
					lastName: "Dixon-Smith",
					items
				},
				isConfirming: false
			});
		}, 1500);
		//this.setState({ registrant: {} });
		// TODO: START SCAN
	};

	// Scan button released
	handleStopScan = ev => {
		ev.currentTarget.classList.remove("scan-clicked");
		sendScanCommand("stopScan");
	};

	// Update registrant object with new values
	handleUpdateRegistrantObject = (tag, value) => {
		const items = this.state.registrant.items.map(item => {
			if (item.tag === tag && item.type === "TF") {
				return Object.assign({}, item, { hasPickedUp: value });
			} else if (item.tag === tag && item.type === "SWITCH") {
				return Object.assign({}, item, { selected: value });
			}
			return item;
		});
		this.setState({
			registrant: {
				firstName: this.state.registrant.firstName,
				lastName: this.state.registrant.lastName,
				items
			}
		});
	};

	// Save registrant pickup
	handleSaveRegistrant = registrant => {
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
					isLoading: false
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
