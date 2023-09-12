jQuery.sap.declare("formatter");
formatter = {
	formatDate: function (oDate) {
		if (oDate && oDate !== "00000000") {
			return sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MMM dd, yyyy"
			}).format(new Date(oDate.substring(4, 6) + "/" + oDate.substring(6, 8) + "/" + oDate.substring(0, 4)));
		} else {
			return "";
		}
	},
	visibleFieldsDom: function (type) {
		if (type === "DM") {
			return true;
		}
		return false;
	},
	visibleFieldsInt: function (type) {
		if (type === "IP") {
			return true;
		}
		return false;
	}
}