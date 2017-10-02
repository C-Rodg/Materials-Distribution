export const BASE_FIELDS = [
	"qrFirstName",
	"qrLastName",
	"qrRegId",
	"qrHasAttended"
];

export const PICKUP_ITEMS = [
	{
		type: "TF",
		name: "American Express - Wednesday",
		lcTag: "lcPickedUpAmexWed",
		pwsTag: "qrPickedUpAmexWed",
		allowTag: "qrGiftAmexWed",
		missingIsDisabled: true,
		valueToEnable: "YES",
		appendInputToName: false
	},
	{
		type: "TF",
		name: "American Express - Thursday",
		lcTag: "lcPickedUpAmexThurs",
		pwsTag: "qrPickedUpAmexThurs",
		allowTag: "qrGiftAmexThurs",
		missingIsDisabled: true,
		valueToEnable: "YES",
		appendInputToName: false
	},
	{
		type: "TF",
		name: "T-Shirt ",
		lcTag: "lcPickedUpShirt",
		pwsTag: "qrPickedUpShirt",
		allowTag: "qrGiftShirt",
		missingIsDisabled: true,
		valueToEnable: ".+",
		appendInputToName: true
	},
	{
		type: "SWITCH",
		lcTag: "lcPickedUpGiftB",
		pwsTag: "qrPickedUpGiftB",
		allowTag: "",
		valOne: "Oversized Truck",
		valTwo: "Hat",
		missingIsDisabled: false,
		valueToEnable: ".*"
	}
];
