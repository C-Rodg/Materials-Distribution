import React, { Component } from "react";
import "../styles/material-switch.scss";

class MaterialSwitch extends Component {
	constructor(props) {
		super(props);

		this.state = { shake: false };
	}

	onItemClick = val => {
		if (!this.props.disabled) {
			if (this.props.selected === val) {
				this.props.valueChange(this.props.pwsTag, "");
			} else {
				this.props.valueChange(this.props.pwsTag, val);
			}
		} else {
			this.setState({ shake: true }, () => {
				setTimeout(() => {
					this.setState({ shake: false });
				}, 1300);
			});
		}
	};

	render() {
		return (
			<div className="material-switch">
				<div className="material-switch-instructions">
					{!this.props.disabled ? (
						"Please select one of the following:"
					) : (
						"Already picked up!"
					)}
				</div>
				<div
					className={[
						"material-switch-container",
						this.state.shake ? "shake" : ""
					].join(" ")}
				>
					<div
						className={[
							"material-switch-item",
							this.props.selected === this.props.valOne ? "selected" : ""
						].join(" ")}
						onClick={() => this.onItemClick(this.props.valOne)}
					>
						{this.props.valOne}
					</div>
					<div
						className={[
							"material-switch-item",
							this.props.selected === this.props.valTwo ? "selected" : ""
						].join(" ")}
						onClick={() => this.onItemClick(this.props.valTwo)}
					>
						{this.props.valTwo}
					</div>
				</div>
			</div>
		);
	}
}

export default MaterialSwitch;
