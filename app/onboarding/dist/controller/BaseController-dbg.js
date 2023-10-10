sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/ValidateException",
    "sap/m/StandardListItem",
    "sap/ui/model/SimpleType"
], function (Controller, ValidateException, StandardListItem, SimpleType) {
    "use strict";

    return Controller.extend("sp.fiori.vendoronboarding.controller.BaseController", {

        // method for accessing the router in every controller of the application
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        // vendor f4 help
        onF4HelpRequest: function (evt) {
            this.f4Source = evt.getSource();
            this.oTemplate = new StandardListItem({
                title: "{Supplier}",
                description: "{SupplierName}"
            });
            this.f4Help("Select Vendor", "/SupplierHelpSet");
        },

        // method to open f4 help
        f4Help: function (title, req) {
            var F4 = sap.ui.xmlfragment("sp.fiori.vendoronboarding.fragment.F4Help", this);
            this.getView().addDependent(F4);
            sap.ui.getCore().byId("F4Help").setTitle(title);
            sap.ui.getCore().byId("F4Help").bindAggregation("items", {
                path: req,
                filters: [new sap.ui.model.Filter("Bukrs", "EQ", sessionStorage.getItem("compCode") || "1000")],
                template: this.oTemplate
            });
            F4.open();
        },

        // method for f4 help search
        onF4HelpSearch: function (evt) {
            var sValue = evt.getParameter("value");
            var path = evt.getSource().getBinding("items").getPath();
            var oPath = path.includes("?search") ? path.split("?search")[0] : path.split("&search")[0];
            sap.ui.getCore().byId("F4Help").bindAggregation("items", {
                path: oPath,
                filters: [new sap.ui.model.Filter("Bukrs", "EQ", sessionStorage.getItem("compCode") || "1000")],
                parameters: { custom: { search: sValue } },
                template: this.oTemplate
            });
        },

        // event handler for f4 Help Confirm
        onF4HelpConfirm: function (evt) {
            evt.getSource().destroy();
            this.f4Source.setValue(evt.getParameter("selectedItem").getTitle());
            sap.ui.getCore().byId("venName").setValue(evt.getParameter("selectedItem").getDescription());
        },

        // event handler for f4 Help cancel
        onF4HelpClose: function (evt) {
            evt.getSource().destroy();
        },

        onDialogCancel: function (evt) {
            evt.getSource().getParent().destroy();
        },

        onDialogEscapeHandler: function (oPromise) {
            oPromise.reject();
        },

        onPopOverAfterClose: function (evt) {
            evt.getSource().destroy();
        },

        onPopOverClosePress: function (evt) {
            evt.getSource().getParent().getParent().destroy();
        },

        customEMailType: SimpleType.extend("email", {
            formatValue: function (oValue) {
                return oValue;
            },
            parseValue: function (oValue) {
                return oValue;
            },
            validateValue: function (oValue) {
                var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                if (!oValue.match(rexMail)) {
                    throw new ValidateException("'" + oValue + "' is not a valid e-mail address");
                }
            }
        }),

        validateFields: function () {
            this.validateResults = [];
            sap.ui.getCore().byId("createDialog").getControlsByFieldGroupId("required").forEach(oControl => {
                console.log(oControl.getMetadata().getElementName());
                switch (oControl.getMetadata().getElementName()) {
                    case "sap.m.Select":
                        this.showError(oControl, "selectedKey", oControl.getSelectedKey());
                        break;
                    case "sap.m.Input":
                    case "sap.m.TextArea":
                        this.showError(oControl, "value", oControl.getValue());
                        break;
                }
            });
            if (this.validateResults.every(state => state === true)) return true;
            else return false;
        },

        showError: function (control, binding, val) {
            if (control.getVisible()) {
                try {
                    var oBinding = control.getBinding(binding);
                    oBinding.getType().validateValue(val);
                    control.setValueState("None");
                    this.validateResults.push(true);
                } catch (oException) {
                    control.setValueState("Error");
                    control.setValueStateText(oException.message);
                    this.validateResults.push(false);
                }
            } else {
                control.setValueState("None");
            }
        },

        generateVendorNo: function () {
            let vendor = "7800000000";
            const data = this.getView().getModel("DataModel").getData();
            if (data.length > 0) {
                vendor = (parseInt(data[data.length - 1].Vendor) + 1).toString();
            }
            return vendor;
        },
        changeDate: function (date, days, operation) {
            var dateOffset = (24 * 60 * 60 * 1000) * days;
            var myDate = new Date();

            myDate.setTime(date.getTime() + dateOffset);
            return myDate;
        }
    });
});