import React from "react";

import "../styles/registrant-content.scss";

import MaterialItem from "./MaterialItem";

const RegistrantContent = ({ registrant, onSaveRegistrant }) => {
	return (
		<div className="registrant-content">
			<div className="registrant-info">
				<div className="card">
					<div className="title">James Dixon-Smith</div>
					<div className="material-items">
						<MaterialItem
							valueChange={testCallback}
							checked={true}
							disabled={false}
							title={"American Express - Wednesday"}
						/>
						<MaterialItem
							valueChange={testCallback}
							checked={false}
							disabled={false}
							title={"American Express - Thursday"}
						/>
						<MaterialItem
							valueChange={testCallback}
							checked={false}
							disabled={true}
							title={"T-Shirt (Medium)"}
						/>
						<MaterialItem
							valueChange={testCallback}
							checked={true}
							disabled={true}
							title={"iPad"}
						/>
					</div>
				</div>
			</div>
			<div className="confirm-reg">
				<button className="action-btn" onClick={() => onSaveRegistrant()}>
					Confirm
				</button>
			</div>
		</div>
	);
};

const testCallback = args => {
	console.log(args);
};

export default RegistrantContent;
