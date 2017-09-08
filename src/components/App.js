import React, { Component } from "react";

import Header from "./Header";
import WaitingContent from "./WaitingContent";
import RegistrantContent from "./RegistrantContent";

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			registrant: null,
			isLoading: false
		};
	}

	componentDidMount() {
		// Attach window.OnDataRead, etc...
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
		this.setState({
			registrant: null,
			isLoading: false
		});
	};

	// Scan button pressed
	handleStartScan = () => {
		console.log("STARTING SCAN");
		this.setState({ isLoading: true });
		setTimeout(() => {
			this.setState({ registrant: {} });
		}, 1500);
		//this.setState({ registrant: {} });
	};

	// Scan button released
	handleStopScan = () => {
		console.log("STOPPING SCAN");
	};

	// Save registrant pickup
	handleSaveRegistrant = () => {
		console.log("savingggg");
	};

	render() {
		return (
			<div className="app">
				<Header
					onGoBack={this.handleGoBack}
					registrant={this.state.registrant}
				/>
				<main className="main">
					{this.state.registrant ? (
						<RegistrantContent
							registrant={this.state.registrant}
							onSaveRegistrant={this.handleSaveRegistrant}
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
