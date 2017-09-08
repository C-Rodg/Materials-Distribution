import React, { Component } from "react";
import "../styles/material-item.scss";

class MaterialItem extends Component {
    constructor(props) {
        super(props);

        this.state = { shake: false };
    }
	// Item row clicked
	onItemClick = () => {
		if (!this.props.disabled) {
			this.props.valueChange(!this.props.checked);
		} else {
            this.setState({shake: true}, () => {
                setTimeout(() => {
                    this.setState({shake: false});
                }, 1300);
            })
        }
	};

	render() {
		return (
			<div
				className={[
					"material-item",
					this.props.checked ? "complete" : "",
					this.props.disabled ? "disabled" : "",
                    this.state.shake ? 'shake' : ''
				].join(" ")}
				onClick={this.onItemClick}
			>
				<label>{this.props.title}</label>
				<div className="box">
                    <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg"><path d="M3.25 12.7465L9.3335 18.75 22 6.25" strokeWidth="4" stroke="#ffffff" fill="none" fillRule="evenodd" strokeDasharray="150" strokeDashoffset="150"/></svg>
                </div>
			</div>
		);
	}
}

export default MaterialItem;