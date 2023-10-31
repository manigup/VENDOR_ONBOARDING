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
	},
	ratingState: function (rating) {
        var state = "None";
        if (rating >= "0" && rating <= "2") {
            state = "Success";
        }else if (rating >= "2.1" && rating <= "3") {
            state = "Warning";
        }else if (rating > "3") {
            state = "Error";
        }
        return state;
    }
}