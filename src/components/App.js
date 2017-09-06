import React, { Component } from "react";

import Header from "./Header";
import WaitingContent from "./WaitingContent";
import RegistrantContent from "./RegistrantContent";

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			registrant: {},
			isLoading: false
		};
	}

	// Back button clicked
	handleGoBack = () => {
		this.setState({
			registrant: null
		});
	};

	// Scan button pressed
	handleStartScan = () => {
		console.log("STARTING SCAN");
	};

	// Scan button released
	handleStopScan = () => {
		console.log("STOPPING SCAN");
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
						<RegistrantContent />
					) : (
						<WaitingContent
							onStartScan={this.handleStartScan}
							onStopScan={this.handleStopScan}
						/>
					)}
				</main>
			</div>
		);
	}
}

export default App;
