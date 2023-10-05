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
        if (oDate) {
            return oDate.toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" });
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
                case "SFA":
                    text = "Sent for Approval";
                    break;
                case "PAP":
                    text = "Partially Approved";
                    break;
                case "SBS":
                    text = "Submited by Supplier";
                    break;
                case "SBC":
                    text = "Submited by Supply Chain";
                    break;
                case "SBF":
                    text = "Submited by Finance";
                    break;
                case "SCA":
                    text = "Approved by Supply Chain";
                    break;
                case "ABF":
                    text = "Approved by Finance";
                    break;
                case "SCR":
                    text = "Rejected by Supply Chain";
                    break;
                case "RBF":
                    text = "Rejected by Finance";
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
                case "SAQ_SENT":
                    text = "SAQ Sent to Supplier";
                    break;
                case "SAQ_SUBMIT":
                    text = "SAQ Submitted by Supplier";
                    break;
                case "SAQ_ROUTES":
                    text = "SAQ Submitted by Supplier";
                    break;
                case "SAQ_DRAFT":
                    text = "SAQ Draft Submitted";
                    break;
                case "SAQ_ROUTEB":
                    text = "SAQ Re ROUTE by BUYER";
                    break;
                case "SAQ_APROVE":
                    text = "SPE Approval Pending";
                    break;
                case "CREATED":
                    text = "Created";
                    break;
                case "INITIATED":
                    text = "Initiated";
                    break;
                case "APPROVED":
                    text = "Approved";
                    break;
                case "REJECTED":
                    text = "Rejected";
                    break;
                case "REROUTE":
                    text = "Re Routed";
                    break;
                case "SAD":
                    text = "Saved as Draft";
                    break;
            }
        }
        return text;
    },
    statusState: function (status) {
        var state = "None";
        if (status) {
            switch (status) {
                case "CREATED":
                case "INITIATED":
                case "SAD":    
                case "SBS":
                case "SBC":
                case "SBF":
                case "SAQ_SENT":
                    state = "Information";
                    break;
                case "PAP":
                case "SAQ_APROVE":
                case "SRE-ROUTE":
                    state = "Warning";
                    break;
                case "SCR":
                case "RBF":
                    state = "Error";
                    break;
                default: state = "Success";
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
    },
    moreInfoBtnVisible: function (status, Access) {
        if ((status === "SBS" && Access === "SCM") || (status === "SBC" && Access === "Finance") || (status === "RBF" && Access === "SCM") || (status === "SBF" && Access === "SCM") || (status === "SCA" && Access === "Finance")) {
            return true;
        } else {
            return false;
        }
    },
    fillformBtnVisible: function (status) {
        if (status === "INITIATED" || status === "SAD" || status === "SRE-ROUTE" || status === "SCR" ) {
            return true;
        } else {
            return false;
        }
    },
    approveBtnVisible: function (approve, btn, status) {
        if ((approve === "1" && btn === "supply" && status === "SBF") || (approve === "1" && btn === "finance" && status === "SCA")) {
            return true;
        } else {
            return false;
        }
    }

};