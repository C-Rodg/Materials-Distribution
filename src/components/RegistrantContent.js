import React from "react";

import "../styles/registrant-content.scss";

import MaterialItem from "./MaterialItem";

const RegistrantContent = ({
	registrant,
	onSaveRegistrant,
	updateRegistrantObject,
	isConfirming,
	isConfirmed
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
			<div
				className={[
					"confirm-reg",
					isConfirming ? "loading" : "",
					isConfirmed ? "confirmed" : ""
				].join(" ")}
			>
				<button
					className="action-btn"
					onClick={() => onSaveRegistrant(registrant)}
				>
					{isConfirmed ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="56"
							height="56"
							viewBox="0 0 52 52"
							className="svg-success"
						>
							<path d="M14.1 27.2l7.1 7.2 16.7-16.8" />
						</svg>
					) : (
						"Confirm"
					)}
				</button>
			</div>
		</div>
	);
};

export default RegistrantContent;
