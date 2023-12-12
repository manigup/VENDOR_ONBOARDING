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
    dateFormat: function (oDate) {
        if (oDate && oDate !== "00000000") {
            return sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "MMM dd, yyyy"
            }).format(new Date(oDate.substring(4, 6) + "/" + oDate.substring(6, 8) + "/" + oDate.substring(0, 4)));
        } else {
            return "";
        }
    },
    formatDate: function (oDate) {
        if (oDate) {
            const d = oDate.getDate().toString(),
                y = oDate.getFullYear().toString();
            let m = oDate.getMonth();
            m = (m + 1).toString();
            return y + m + d;
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
                case "SBP":
                    text = "Submited by Purchase Head";
                    break;
                case "SBQ":
                    text = "Submited by Quality";
                    break;
                case "SBC":
                    text = "Submited by COO";
                    break;
                case "SBE":
                    text = "Submited by CEO";
                    break;
                case "SBF":
                    text = "Submited by Finance";
                    break;
                case "ABP":
                    text = "Approved by Purchase Head";
                    break;
                case "ABQ":
                    text = "Approved by Quality";
                    break;
                case "ABC":
                    text = "Approved by COO";
                    break;
                case "ABE":
                    text = "Approved by CEO";
                    break;
                case "ABF":
                    text = "Approved by Finance";
                    break;
                case "RBP":
                    text = "Rejected by Purchase Head";
                    break;
                case "RBF":
                    text = "Rejected by Quality";
                    break;
                case "RBF":
                    text = "Rejected by COO";
                    break;
                case "RBE":
                    text = "Rejected by CEO";
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
                case "SBP":
                case "SBQ":
                case "SBC":
                case "SBE":
                case "SBF":
                case "SAQ_SENT":
                    state = "Information";
                    break;
                case "SBS":
                    state = "Indication08";
                    break;
                case "SAD":
                    state = "None";
                    break;
                case "PAP":
                case "SAQ_APROVE":
                case "SRE-ROUTE":
                    state = "Warning";
                    break;
                case "RBP":
                case "RBQ":
                case "RBC":
                case "RBE":
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
    moreInfoBtnVisible: function (related, status, Access) {
        if (related === "No") {
            if ((status === "SBS" && Access === "Quality") || (status === "ABQ" && Access === "Purchase") || (status === "ABP" && Access === "COO") || (status === "ABC" && Access === "Finance") || ((status === "RBP" || status === "RBC" || status === "RBF") && Access === "Quality")) {
                return true;
            } else {
                return false;
            }
        } else if (related === "Yes") {
            if ((status === "SBS" && Access === "Quality") || (status === "ABQ" && Access === "Purchase") || (status === "ABP" && Access === "COO") || (status === "ABC" && Access === "CEO") || (status === "ABE" && Access === "Finance") || ((status === "RBP" || status === "RBC" || status === "RBE" || status === "RBF") && Access === "Quality")) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    fillformBtnVisible: function (status) {
        if (status === "INITIATED" || status === "SAD" || status === "SRE-ROUTE" || status === "RBQ") {
            return true;
        } else {
            return false;
        }
    },
    approveBtnVisible: function (related, approve, btn, status) {
        if (related === "No") {
            if ((approve === "1" && btn === "purchase" && status === "SBP") || (approve === "1" && btn === "quality" && status === "SBQ") || (approve === "1" && btn === "coo" && status === "SBC") || (approve === "1" && btn === "ceo" && status === "SBE") || (approve === "1" && btn === "finance" && status === "SBF")) {
                return true;
            } else {
                return false;
            }
        } else if (related === "Yes") {
            if ((approve === "1" && btn === "purchase" && status === "SBP") || (approve === "1" && btn === "quality" && status === "SBQ") || (approve === "1" && btn === "coo" && status === "SBC") || (approve === "1" && btn === "ceo" && status === "SBE") || (approve === "1" && btn === "finance" && status === "SBF")) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    ratingState: function (rating) {
        var state = "None";
        if (rating >= "0" && rating <= "2") {
            state = "Success";
        } else if (rating >= "2.1" && rating <= "3") {
            state = "Warning";
        } else if (rating > "3") {
            state = "Error";
        }
        return state;
    }

};