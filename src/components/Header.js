import React from "react";
import "../styles/header.scss";

const Header = ({ registrant, onGoBack }) => {
	const hasRegistrant = registrant ? true : false;
	return (
		<div className="header">
			<div
				className={[
					"header-item",
					"header-back",
					hasRegistrant ? "" : "hidden"
				].join(" ")}
				onClick={() => onGoBack()}
			>
				<i className="material-icons">arrow_back</i>
			</div>
			<div className="header-item header-title">
				{hasRegistrant ? "Confirm Pickup" : "Materials Distribution"}
			</div>
		</div>
	);
};

export default Header;
