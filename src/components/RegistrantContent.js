import React from "react";

import "../styles/registrant-content.scss";

import MaterialItem from "./MaterialItem";

const RegistrantContent = ({
	registrant,
	onSaveRegistrant,
	updateRegistrantObject
}) => {
	return (
		<div className="registrant-content">
			<div className="registrant-info">
				<div className="card">
					<div className="title">
						{[registrant.firstName, registrant.lastName].join(" ")}
					</div>
					<div className="material-items">
						{registrant.items && registrant.items.length > 0 ? (
							registrant.items.map(item => {
								return (
									<MaterialItem
										key={item.tag}
										checked={item.hasPickedUp}
										disabled={item.disabled}
										title={item.name}
										tag={item.tag}
										valueChange={updateRegistrantObject}
									/>
								);
							})
						) : (
							<div className="no-items">No items found...</div>
						)}
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
