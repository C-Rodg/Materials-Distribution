import React from "react";
import "../styles/waiting-content.scss";

const WaitingContent = ({ onStartScan, onStopScan }) => {
	return (
		<div className="waiting-content">
			<div className="waiting-info">
				<div className="waiting-loading-container">
					<div className="waiting-icon">
						<i className="material-icons">hourglass_empty</i>
					</div>
					<div className="waiting-text">Waiting for Scan...</div>
					<svg className="circular-loader" viewBox="25 25 50 50">
						<circle
							className="loader-path"
							cx="50"
							cy="50"
							r="24"
							fill="none"
							stroke="#FFFFFF"
							strokeWidth="1"
						/>
					</svg>
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
