sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageBox, MessageToast, Filter, BusyIndicator, JSONModel) {

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
                // this.getView().setModel(new JSONModel([]), "DataModel");
                this.getData();
            },

            getData: function () {
                BusyIndicator.show();
                setTimeout(() => {
                    //  var requestData = this.getView().getModel("request").getData();

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
                            var reqData = { supplychain: false, finance: false };
                            var accessdata = this.getView().getModel("AccessDetails").getData();
                            var res = this.getView().getModel("UserApiDetails").getData();
                            //var res = {};
                            //res.email = "rajeshsehgal@impauto.com";
                            reqData.supplychain = accessdata.find(item => item.email === res.email && item.Access === "SCM") ? true : false;
                            reqData.finance = accessdata.find(item => item.email === res.email && item.Access === "Finance") ? true : false;
                            reqData.supplychain = true;
                            this.getView().getModel("request").setData(reqData);
                            this.getView().getModel("request").refresh(true);
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
                        new Filter("VendorName", sap.ui.model.FilterOperator.Contains, sValue), // Supplier Name
                        new Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue), // Business Partner
                        new Filter("VenApprovalPending", sap.ui.model.FilterOperator.Contains, sValue), // Approval Pending
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
                        new Filter("createdAt", sap.ui.model.FilterOperator.BT, fromValue, toValue)
                    ])]);
                } else if (fromValue) {
                    this.byId("vendorList").getBinding("items").filter([new Filter([
                        new Filter("createdAt", sap.ui.model.FilterOperator.EQ, fromValue)
                    ])]);
                } else if (toValue) {
                    this.byId("vendorList").getBinding("items").filter([new Filter([
                        new Filter("createdAt", sap.ui.model.FilterOperator.LE, toValue)
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
                    const payload = sap.ui.getCore().byId("createDialog").getModel("CreateModel").getData();
                    payload.Vendor = this.generateVendorNo();
                    payload.VenFrom = new Date();
                    payload.VenValidTo = this.changeDate(payload.VenFrom, 7, "add");
                    setTimeout(() => {
                        this.getView().getModel().create("/VenOnboard", payload, {
                            success: (sData) => {
                                BusyIndicator.hide();
                                MessageBox.success("Vendor creation request " + sData.Vendor + " created successfully. \n\n Also, Supplier form generated please fill to procced.", {
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
            },

            onFormPress: function () {
                const href = window.location.href;
                let url;
                if (href.includes("impautosuppdev")) {

                    url = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a1aa5e6e-4fe2-49a5-b95a-5cd7a2b05a51.onboarding.spfiorisupplierform-0.0.1/index.html?id=" + this.vendorId;

                } else {
                    url = "/supplierform/webapp/index.html?id=" + this.vendorId;
                }
                window.open(url);
            },

            onMoreInfoPress: function (evt) {
                evt.getSource().getParent().getParent().destroy();
                this.getRouter().navTo("Form", { VendorId: this.vendorId });
            },

            onVendorPress: function (evt) {
                var data = evt.getSource().getBindingContext("DataModel").getObject();
                var requestData = this.getView().getModel("request").getData();
                this.vendor = data.Vendor;
                this.vendorId = data.VendorId;
                if (requestData.supplychain === true) {
                    data.Access = "SCM";
                } else if (requestData.finance === true) {
                    data.Access = "Finance";
                }
                var popOver = sap.ui.xmlfragment("sp.fiori.onboarding.fragment.VendorDetails", this);
                sap.ui.getCore().byId("displayPopover").setModel(new JSONModel(data), "VenModel");
                this.getView().addDependent(popOver);
                popOver.openBy(evt.getSource());
            },

            onAttachmentPress: function (evt) {
                BusyIndicator.show();
                var source = evt.getSource();
                this.vendorId = source.getBindingContext("DataModel").getProperty("VendorId");
                setTimeout(() => {
                    this.getView().getModel().read("/Attachments", {
                        filters: [new Filter("VendorId", "EQ", this.vendorId)],
                        success: (data) => {
                            data.results.map(item => item.Url = this.getView().getModel().sServiceUrl + "/Attachments(VendorId='" + item.VendorId + "',ObjectId='" + item.ObjectId + "')/$value");
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
                    value: this.vendorId + "/" + evt.getParameters().fileName
                }));
            },

            getAttachments: function () {
                BusyIndicator.show();
                setTimeout(() => {
                    this.getView().getModel().read("/Attachments", {
                        filters: [new Filter("VendorId", "EQ", this.vendorId)],
                        success: (data) => {
                            data.results.map(item => item.Url = this.getView().getModel().sServiceUrl + "/Attachments(VendorId='" + item.VendorId + "',ObjectId='" + item.ObjectId + "')/$value");
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
                                this.getView().getModel().remove("/Attachments(VendorId='" + obj.VendorId + "',ObjectId='" + obj.ObjectId + "')", {
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
            },
            onApprPress: function (evt) {
                var vendata = this.getView().getModel("DataModel").getData();
                var sPath= evt.getSource().getBindingContext("DataModel").sPath.split("/")[1];
                this.vendorId = vendata[sPath].VendorId;
                var payload = {};
                for (var i = 0; i < vendata.length; i++) {
                    if (vendata[i].VendorId === this.vendorId) {
                        payload.Vendor = vendata[i].Vendor;
                        payload.VendorId = vendata[i].VendorId;
                        payload.VendorName = vendata[i].VendorName;
                        payload.VendorType = vendata[i].VendorType;
                        payload.Department = vendata[i].Department;
                        payload.Telephone = vendata[i].Telephone;
                        payload.City = vendata[i].City;
                        payload.VendorMail = vendata[i].VendorMail;
                        payload.VenValidTo = vendata[i].VenValidTo;
                        payload.VenFrom = vendata[i].VenFrom;
                        payload.VenTimeLeft = vendata[i].VenTimeLeft;
                        var venStatus = vendata[i].Status;
                        break;
                    }
                }
                var stat = "";
                var level = "";
                var pending = "";
                var appr = "0";
                if (venStatus === "SBF" || venStatus === "RBF") {
                    stat = "SCA";
                    appr = "1"
                    level = "2";
                    pending = "Finance"
                } else if (venStatus === "SCA") {
                    stat = "ABF";
                }
                payload.Status = stat;
                payload.VenLevel = level;
                payload.VenApprovalPending = pending;
                payload.VenApprove = appr;
                this.getView().getModel().update("/VenOnboard(Vendor='" + payload.Vendor + "',VendorId=" + this.vendorId + ")", payload, {
                    success: () => {

                        MessageBox.success("Form approved successfully", {
                            onClose: () => this.getData()
                        });
                    },
                    error: (error) => {
                        BusyIndicator.hide();
                        console.log(error);
                    }
                });
            },
            onRejPress: function (evt) {
                var vendata = this.getView().getModel("DataModel").getData();
                var sPath= evt.getSource().getBindingContext("DataModel").sPath.split("/")[1];
                this.vendorId = vendata[sPath].VendorId;
                var payload = {};
                for (var i = 0; i < vendata.length; i++) {
                    if (vendata[i].VendorId === this.vendorId) {
                        payload.Vendor = vendata[i].Vendor;
                        payload.VendorId = vendata[i].VendorId;
                        payload.VendorName = vendata[i].VendorName;
                        payload.VendorType = vendata[i].VendorType;
                        payload.Department = vendata[i].Department;
                        payload.Telephone = vendata[i].Telephone;
                        payload.City = vendata[i].City;
                        payload.VendorMail = vendata[i].VendorMail;
                        payload.VenValidTo = vendata[i].VenValidTo;
                        payload.VenFrom = vendata[i].VenFrom;
                        payload.VenTimeLeft = vendata[i].VenTimeLeft;
                        var venStatus = vendata[i].Status;
                        break;
                    }
                }
                var stat = "";
                var level = "";
                var pending = "";
                var appr = "0";
                if (venStatus === "SBF") {
                    stat = "SCR";
                } else if (venStatus === "SCA") {
                    stat = "RBF";
                    appr = ""
                    level = "1";
                    pending = "Supply Chain";
                }
                payload.Status = stat;
                payload.VenLevel = level;
                payload.VenApprovalPending = pending;
                payload.VenApprove = appr;
                this.getView().getModel().update("/VenOnboard(Vendor='" + payload.Vendor + "',VendorId=" + this.vendorId + ")", payload, {
                    success: () => {

                        MessageBox.error("Form rejected successfully", {
                            onClose: () => this.getData()
                        });
                    },
                    error: (error) => {
                        BusyIndicator.hide();
                        console.log(error);
                    }
                });
            }
        });
    });
