import React, { Component } from "react";

import Header from "./Header";
import WaitingContent from "./WaitingContent";
import RegistrantContent from "./RegistrantContent";
import Toast from "./Toast";

import { startUpApplication } from "../services/authorization";

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
				console.log("ALL FINISHED!");
				console.log(data);
			})
			.catch(err => {
				console.log("ALL finished WITH ERROR");
				console.log(err);
			});
	}

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
		alert("UNSAVED CHANGES!");
		this.setState({
			registrant: null,
			isLoading: false
		});
	};

	// Scan button pressed
	handleStartScan = () => {
		console.log("STARTING SCAN");
		const items = [
			{
				name: "American Express - Wednesday",
				tag: "qrAmerWed",
				hasPickedUp: true,
				disabled: false
			},
			{
				name: "American Express - Thursday",
				tag: "qrAmerThurs",
				hasPickedUp: false,
				disabled: false
			},
			{
				name: "T-Shirt (Medium)",
				tag: "qrTee",
				hasPickedUp: false,
				disabled: true
			},
			{ name: "iPad", tag: "qrIpad", hasPickedUp: true, disabled: true }
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

	// Update registrant object with new values
	handleUpdateRegistrantObject = (tag, value) => {
		const items = this.state.registrant.items.map(item => {
			if (item.tag === tag) {
				return Object.assign({}, item, { hasPickedUp: value });
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

	// Scan button released
	handleStopScan = () => {
		// TODO: STOP SCAN
		console.log("STOPPING SCAN");
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
