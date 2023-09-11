jQuery.sap.declare("formatter");
formatter = {
    onNavBack: function () {
        var oHistory = sap.ui.core.routing.History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();
        if (sPreviousHash !== undefined) {
            window.history.go(-1);
        } else {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("list");
        }
    },
    formatDate: function (oDate) {
        if (oDate && oDate !== "00000000") {
            return sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "MMM dd, yyyy"
            }).format(new Date(oDate.substring(4, 6) + "/" + oDate.substring(6, 8) + "/" + oDate.substring(0, 4)));
        } else {
            return "";
        }
    },
    formatTime: function (oTime) {
        if (oTime) {
            return oTime.substring(0, 2) + ":" + oTime.substring(2, 4) + ":" + oTime.substring(4, 6);
        } else {
            return "";
        }
    },
    formatStatus: function (status) {
        var text = "";
        if (status) {
            switch (status) {
                case "PAP":
                    text = "Partially Approved";
                    break;
                case "SFA":
                    text = "Sent for Approval";
                    break;
                case "SBS":
                    text = "Submited by Supplier";
                    break;
                case "SBB":
                    text = "Submitted by Buyer";
                    break;
                case "SBF":
                    text = "Submitted by Finance";
                    break;
                case "SCC":
                    text = "Supplier Code Created";
                    break;
                case "BRE-ROUTE":
                    text = "Re-Routed to Buyer";
                    break;
                case "SRE-ROUTE":
                    text = "Re-Routed to Supplier";
                    break;
                case "FRE-ROUTE":
                    text = "Re-Routed to Finance";
                    break;
                case "CREATED":
                    text = "Request Initiated";
                    break;
                case "APPROVED":
                    text = "Approved";
                    break;
                case "REJECTED":
                    text = "Rejected";
                    break;
            }
        }
        return text;
    },
    statusState: function (status) {
        var state = "None";
        if (status) {
            switch (status) {
                case "SBS":
                case "SBB":
                case "SBF":
                case "INITIATED":
                case "SAQ_SENT":
                    state = "Information";
                    break;
                case "PAP":
                case "SFA":
                case "SAQ_APROVE":
                case "BRE-ROUTE":
                case "SRE-ROUTE":
                case "FRE-ROUTE":
                    state = "Warning";
                    break;
                case "REJECTED":
                    state = "Error";
                    break;
                case "SCC":
                    state = "Success";
                    break;
                default: state = "None";
                    break;
            }
        }
        return state;
    },
    formatVendorSubType: function (type) {
        var text = "";
        if (type) {
            switch (type) {
                case "DM":
                    text = "Domestic";
                    break;
                case "IP":
                    text = "Import";
                    break;
                case "EM":
                    text = "Employee Vendor";
                    break;
            }
        }
        return text;
    },
    levelState: function (level, lifnr) {
        var state = "None";
        if (level) {
            if (parseInt(level) === 0) {
                state = "None";
            } else if (parseInt(level) > 0 && !lifnr) {
                state = "Warning";
            } else {
                state = "Success";
            }
        }
        return state;
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
    addVendorColor: function (vendor, resetValidity) {
        resetValidity === "X" ? this.addStyleClass("resetValidity") : this.removeStyleClass("resetValidity");
        return vendor;
    }
};