import { Howl } from "howler";

import { SCAN, DENY, ACCEPT } from "../sounds";

function SoundService() {
	this.accept = new Howl({
		src: [ACCEPT],
		autoplay: false,
		loop: false,
		volume: 0.6
	});
	this.scan = new Howl({
		src: [SCAN],
		autoplay: false,
		loop: false,
		volume: 0.6
	});
	this.deny = new Howl({
		src: [DENY],
		autoplay: false,
		loop: false,
		volume: 0.7
	});
}

const sounds = new SoundService();

export const soundScan = () => {
	sounds.scan.play();
};

export const soundAccept = () => {
	sounds.accept.play();
};

export const soundDeny = () => {
	sounds.deny.play();
};
