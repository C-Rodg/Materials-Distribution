import React, { Component } from "react";

import Header from "./Header";
import WaitingContent from "./WaitingContent";
import RegistrantContent from "./RegistrantContent";
import Toast from "./Toast";

import {
	startUpApplication,
	getClientAndLeadSource
} from "../services/authorization";

import { sendScanCommand } from "../services/scanning";

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
		// TODO: Attach window.OnDataRead, etc...
		startUpApplication()
			.then(data => {
				alert("started up application");
			})
			.catch(err => {
				alert("We ran into an issue trying to boot up the application...");
			});

		sendScanCommand("enableButtonScan");

		window.OnLineaConnect = this.handleLineaConnect;
		window.OnDataRead = this.handleOnDataRead;
	}

	// Handle OnDataRead function from a scan
	handleOnDataRead = data => {
		//this.setState({ isLoading: true });
		//alert(JSON.stringify(data));
		//{Data: 'badgestuff...', Symbology: 'QR Code', Source: 'Linea-Barcode'}
	};

	// Handle Linea device connected and enable scanning
	handleLineaConnect = () => {
		sendScanCommand("enableButtonScan");

		getClientAndLeadSource()
			.then(() => {
				alert("COMPLETE CONNECT");
			})
			.catch(err => {
				alert(JSON.stringify(err, null, 2));
			});
	};

	testMethod = () => {
		// startUpApplication()
		// 	.then(data => {
		// 		console.log("ALL FINISHED!");
		// 		console.log(data || "0");
		// 	})
		// 	.catch(err => {
		// 		console.log("ALL finished WITH ERROR");
		// 		console.log(err);
		// 	});
	};

	// Scan Read
	onScanRead = data => {
		this.setState({ isLoading: true });
		// Parse out data..
		// Load translation..
		// Set state.registrant...
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
					<div
						className="test-button"
						style={{ padding: "15px", position: "absolute", left: 0, right: 0 }}
						onClick={this.testMethod}
					>
						TEST STARTUP
					</div>

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
