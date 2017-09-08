import React, { Component } from "react";
import "../styles/material-item.scss";

class MaterialItem extends Component {
	// Item row clicked
	onItemClick = () => {
		if (!this.props.disabled) {
			this.props.valueChange(!this.props.checked);
		}
	};

	render() {
		return (
			<div
				className={[
					"material-item",
					this.props.checked ? "complete" : "",
					this.props.disabled ? "disabled" : ""
				].join(" ")}
				onClick={this.onItemClick}
			>
				<label>{this.props.title}</label>
				<div className="box">{this.props.checked ? "X" : "O"}</div>
			</div>
		);
	}
}

export default MaterialItem;
