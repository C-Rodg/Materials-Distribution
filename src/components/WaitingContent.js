import React from "react";
import "../styles/waiting-content.scss";

const WaitingContent = ({ onStartScan, onStopScan }) => {
	return (
		<div className="waiting-content">
			<div className="waiting-info">
				<div className="waiting-text-container">
					<div className="waiting-icon">
						<i className="material-icons">hourglass_empty</i>
					</div>
					<div className="waiting-text">Waiting for Scan...</div>
				</div>
			</div>
			<div className="start-scan">
				<button
					className="action-btn"
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
