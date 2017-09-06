import React, { Component } from "react";

import Header from "./Header";

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

	render() {
		return (
			<div className="app">
				<Header
					onGoBack={this.handleGoBack}
					registrant={this.state.registrant}
				/>
				<main className="main">Content here...</main>
			</div>
		);
	}
}

export default App;
