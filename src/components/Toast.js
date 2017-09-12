import React, { Component } from "react";
import "../styles/toast.scss";

class Toast extends Component {
	constructor(props) {
		super(props);

		this.state = {
			displaying: false
		};
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.counter !== nextProps.counter) {
			this.setState({ displaying: true }, () => {
				setTimeout(() => {
					this.setState({ displaying: false });
				}, 3100);
			});
		}
	}

	render() {
		return (
			<div className={["toast", this.state.displaying ? "in" : ""].join(" ")}>
				<div className="toast-item">{this.props.msg}</div>
			</div>
		);
	}
}

export default Toast;
