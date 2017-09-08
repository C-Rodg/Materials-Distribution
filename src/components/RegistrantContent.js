import React from "react";

import "../styles/registrant-content.scss";

const RegistrantContent = ({ registrant, onSaveRegistrant }) => {
	return (
		<div className="registrant-content">
			<div className="registrant-info">
				<div className="card" />
			</div>
			<div className="confirm-reg">
				<button className="action-btn" onClick={() => onSaveRegistrant()}>
					Confirm
				</button>
			</div>
		</div>
	);
};

export default RegistrantContent;
