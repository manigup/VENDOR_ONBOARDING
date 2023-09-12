sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
<<<<<<< HEAD
    "sap/m/MessageToast",
=======
    "sap/m/Link",
>>>>>>> 2b2a6353c4c7ca9c576870625950a257d28698d5
    "sap/ui/model/Filter",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
<<<<<<< HEAD
    function (BaseController, MessageBox, MessageToast, Filter, BusyIndicator, JSONModel) {
=======
    function (BaseController, MessageBox, Link, Filter, BusyIndicator, JSONModel) {
>>>>>>> 2b2a6353c4c7ca9c576870625950a257d28698d5
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

            onCreateSubmit: function () {
                if (this.validateFields()) {
                    BusyIndicator.show();
                    var oLink = new sap.m.Link({ text: 'Supplier Form', press: [this.handleLinkPress, this]});
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
                                        MessageBox.success(oLink);
                                    }
                                });
                                
                            },
                            error: () => BusyIndicator.hide()
                        });
                    }, 1000);
                } else {
                    MessageBox.error("Please correct all the error's to proceed");
                }
            },

            handleLinkPress: function (evt) {
                var sServiceUrl =  "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a1aa5e6e-4fe2-49a5-b95a-5cd7a2b05a51.onboarding.spfiorisupplierform-0.0.1/index.html" ;
				window.open(sServiceUrl);
            },

            onVendorPress: function (evt) {
                var data = evt.getSource().getBindingContext("DataModel").getObject();
                this.vendor = data.Vendor;
                var popOver = sap.ui.xmlfragment("sp.fiori.onboarding.fragment.VendorDetails", this);
                sap.ui.getCore().byId("displayPopover").setModel(new JSONModel(data), "VenModel");
                this.getView().addDependent(popOver);
                popOver.openBy(evt.getSource());
            },

            onAttachmentPress: function (evt) {
                BusyIndicator.show();
                var source = evt.getSource();
                this.vendor = source.getBindingContext("DataModel").getProperty("Vendor");
                setTimeout(() => {
                    this.getView().getModel().read("/Attachments", {
                        filters: [new Filter("Vendor", "EQ", this.vendor)],
                        success: (data) => {
                            data.results.map(item => item.Url = this.getView().getModel().sServiceUrl + "/Attachments(Vendor='" + item.Vendor + "',ObjectId='" + item.ObjectId + "')/$value");
                            var popOver = sap.ui.xmlfragment("sp.fiori.onboarding.fragment.Attachment", this);
                            sap.ui.getCore().byId("attachPopover").setModel(new JSONModel(data), "AttachModel");
                            this.getView().addDependent(popOver);
                            popOver.openBy(source);
                            sap.ui.getCore().byId("attachment").setUploadUrl(this.getView().getModel().sServiceUrl + "/Attachments");
                            BusyIndicator.hide();
                        },
                        error: () => BusyIndicator.hide()
                    });
                }, 1000);
            },

            onBeforeUploadStartsAttach: function (evt) {
                BusyIndicator.show();
                evt.getParameters().addHeaderParameter(new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: this.vendor + "/" + evt.getParameters().fileName
                }));
            },

            getAttachments: function () {
                BusyIndicator.show();
                setTimeout(() => {
                    this.getView().getModel().read("/Attachments", {
                        filters: [new Filter("Vendor", "EQ", this.vendor)],
                        success: (data) => {
                            data.results.map(item => item.Url = this.getView().getModel().sServiceUrl + "/Attachments(Vendor='" + item.Vendor + "',ObjectId='" + item.ObjectId + "')/$value");
                            sap.ui.getCore().byId("attachPopover").setModel(new JSONModel(data), "AttachModel");
                            BusyIndicator.hide();
                        },
                        error: () => BusyIndicator.hide()
                    });
                }, 1000);
            },

            onAttachmentUploadComplete: function (evt) {
                if (evt.getParameter("files")[0].status == 201) {
                    MessageToast.show("File " + evt.getParameter("files")[0].fileName + " Attached successfully");
                    this.getAttachments();
                } else {
                    MessageBox.error(JSON.parse(evt.getParameter("files")[0].responseRaw).error.message.value);
                    BusyIndicator.show();
                }
            },

            onAttachmentDeletePress: function (evt) {
                var obj = evt.getSource().getBindingContext("AttachModel").getObject();
                MessageBox.confirm("Are you sure ?", {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: action => {
                        if (action === "YES") {
                            BusyIndicator.show();
                            setTimeout(() => {
                                this.getView().getModel().remove("/Attachments(Vendor='" + obj.Vendor + "',ObjectId='" + obj.ObjectId + "')", {
                                    success: () => {
                                        BusyIndicator.hide();
                                        MessageBox.success(obj.Filename + " deleted successfully", {
                                            onClose: () => this.getAttachments()
                                        });
                                    },
                                    error: () => BusyIndicator.hide()
                                });
                            }, 1000);
                        }
                    }
                });
            }
        });
    });
