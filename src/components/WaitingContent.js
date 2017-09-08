import React from "react";
import "../styles/waiting-content.scss";

const WaitingContent = ({ onStartScan, onStopScan, isLoading }) => {
	return (
		<div className="waiting-content">
			<div className="waiting-info">
				<div className="waiting-loading-container">
					<div
						className={["waiting-icon", isLoading ? "icon-hide" : ""].join(" ")}
					>
						<i className="material-icons">hourglass_empty</i>
					</div>
					<div className="waiting-text">
						{!isLoading ? "Waiting for Scan..." : "Loading Registrant..."}
					</div>
					<span className="loading-effect" />
				</div>
			</div>
			<div className="start-scan">
				<button
					className={["action-btn", isLoading ? "fade-out" : ""].join(" ")}
					onTouchStart={() => onStartScan()}
					onTouchEnd={() => onStopScan()}
				>
					Start Scan
				</button>
			</div>
		</div>
	);
};

export default WaitingContent;
