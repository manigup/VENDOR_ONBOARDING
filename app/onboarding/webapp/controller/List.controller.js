sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageBox, Filter, BusyIndicator, JSONModel) {
        "use strict";

        return BaseController.extend("sp.fiori.onboarding.controller.List", {

            onInit: function () {
                this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
                ["createFromDateId", "createToDateId"].forEach(oDatepcker => {
                    this.byId(oDatepcker).attachBrowserEvent("keypress", evt => evt.preventDefault());
                });
            },

            onRouteMatched: function (evt) {
                if (evt.getParameter("name") !== "list") {
                    return;
                }
                this.getView().setModel(new JSONModel([]), "DataModel");
                this.getData();
            },

            getData: function () {
                BusyIndicator.show();
                setTimeout(() => {
                    // var requestData = this.getView().getModel("request").getData();
                    // this.getView().getModel().read("/EmpRoleSet", {
                    //     success: (data) => {
                    //         var access;
                    //         for (var i = 0; i < data.results.length; i++) {
                    //             access = data.results[i].Access.toUpperCase();
                    //             if (access === "BUYER") {
                    //                 requestData.buyer = true;
                    //             } else if (access === "FINANCE") {
                    //                 requestData.finance = true;
                    //             } else if (access === "LEGAL") {
                    //                 requestData.legal = true;
                    //             } else if (access === "VALIDITY RESET") {
                    //                 requestData.reset = true;
                    //             }
                    //         }
                    //         this.getView().getModel("request").refresh(true);
                    //     },
                    //     error: () => BusyIndicator.hide()
                    // });
                    this.getView().getModel().read("/VenOnboard", {
                        success: (data) => {
                            data.results.map(item => {
                                item.StatusText = formatter.formatStatus(item.Status);
                                item.WavStatusText = formatter.formatStatus(item.WavStatus);
                                parseInt(item.Score);
                                return item;
                            });
                            this.getView().getModel("DataModel").setData(data.results);
                            this.getView().getModel("DataModel").setSizeLimit(data.results.length);
                            this.getView().getModel("DataModel").refresh(true);
                            BusyIndicator.hide();
                        },
                        error: () => BusyIndicator.hide()
                    });
                }, 1000);
            },

            onSearch: function (evt) {
                var sValue = evt.getParameter("query");
                if (evt.getParameter("refreshButtonPressed")) {
                    this.getData();
                } else if (sValue) {
                    this.byId("createFromDateId").setValue("");
                    this.byId("createToDateId").setValue("");
                    this.byId("vendorList").getBinding("items").filter([new Filter([
                        new Filter("Vendor", sap.ui.model.FilterOperator.Contains, sValue), // Supplier Code
                        new Filter("VenName", sap.ui.model.FilterOperator.Contains, sValue), // Supplier Name
                        new Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue), // Business Partner
                        new Filter("ApprovalPending", sap.ui.model.FilterOperator.Contains, sValue), // Approval Pending
                        new Filter("StatusText", sap.ui.model.FilterOperator.Contains, sValue) // Status
                    ])]);
                } else {
                    this.byId("vendorList").getBinding("items").filter([]);
                }
            },

            onCreationDateFilter: function () {
                var fromValue = this.byId("createFromDateId").getValue(),
                    toValue = this.byId("createToDateId").getValue();
                if (fromValue && toValue) {
                    this.byId("vendorList").getBinding("items").filter([new Filter([
                        new Filter("CreatedOn", sap.ui.model.FilterOperator.BT, fromValue, toValue)
                    ])]);
                } else if (fromValue) {
                    this.byId("vendorList").getBinding("items").filter([new Filter([
                        new Filter("CreatedOn", sap.ui.model.FilterOperator.EQ, fromValue)
                    ])]);
                } else if (toValue) {
                    this.byId("vendorList").getBinding("items").filter([new Filter([
                        new Filter("CreatedOn", sap.ui.model.FilterOperator.LE, toValue)
                    ])]);
                } else {
                    this.byId("vendorList").getBinding("items").filter([]);
                }
                this.byId("search").setValue("");
            },

            onCreatePress: function () {
                var dialog = sap.ui.xmlfragment("sp.fiori.onboarding.fragment.Create", this);
                this.getView().addDependent(dialog);
                sap.ui.getCore().byId("createDialog").setModel(new JSONModel({}), "CreateModel");
                dialog.open();
            },

            onCreateSubmit: function (evt) {
                if (this.validateFields()) {
                    BusyIndicator.show();
                    const payload = sap.ui.getCore().byId("createDialog").getModel("CreateModel").getData();
                    payload.Vendor = this.generateVendorNo();
                    setTimeout(() => {
                        this.getView().getModel().create("/VenOnboard", payload, {
                            success: (sData) => {
                                BusyIndicator.hide();
                                MessageBox.success("Vendor Creation Request " + sData.Vendor + " created successfully", {
                                    onClose: () => {
                                        sap.ui.getCore().byId("createDialog").destroy();
                                        this.getData();
                                    }
                                });
                            },
                            error: () => BusyIndicator.hide()
                        });
                    }, 1000);
                } else {
                    MessageBox.error("Please correct all the error's to proceed");
                }
            }
        });
    });
