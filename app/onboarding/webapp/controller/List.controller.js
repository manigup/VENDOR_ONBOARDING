sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageBox, MessageToast, Filter, FilterOperator, FilterType, BusyIndicator, JSONModel) {

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
                this.getView().setModel(new JSONModel([]), "FormData");
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
                            var reqData = { purchase: false, quality: false, coo: false, ceo: false, finance: false };
                            var accessdata = this.getView().getModel("AccessDetails").getData();
                            var res = this.getView().getModel("UserApiDetails").getData();
                            //var res = {};
                            //res.email = "rajeshsehgal@impauto.com";
                            reqData.purchase = accessdata.find(item => item.email === res.email && item.Access === "Purchase") ? true : false;
                            reqData.quality = accessdata.find(item => item.email === res.email && item.Access === "Quality") ? true : false;
                            reqData.coo = accessdata.find(item => item.email === res.email && item.Access === "COO") ? true : false;
                            reqData.ceo = accessdata.find(item => item.email === res.email && item.Access === "CEO") ? true : false;
                            reqData.finance = accessdata.find(item => item.email === res.email && item.Access === "Finance") ? true : false;
                            // reqData.finance = true;
                            if (reqData.purchase) {
                                reqData.appbtn = "purchase";
                            } else if (reqData.quality) {
                                reqData.appbtn = "quality";
                            }else if (reqData.coo) {
                                reqData.appbtn = "coo";
                            } else if (reqData.ceo) {
                                reqData.appbtn = "ceo";
                            } else if (reqData.finance) {
                                reqData.appbtn = "finance";
                            }
                            this.getView().getModel("request").setData(reqData);
                            this.getView().getModel("request").refresh(true);
                            this.getView().getModel("DataModel").setData(data.results);
                            this.getView().getModel("DataModel").setSizeLimit(data.results.length);
                            this.getView().getModel("DataModel").refresh(true);
                            // for(var i = 0; i<data.results.length; i++){
                            // this.changevalidity(data.results[i]);
                            // }
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
                    payload.initiatedBy = sessionStorage.getItem('userEmail');
                    setTimeout(() => {
                        this.getView().getModel().create("/VenOnboard", payload, {
                            success: (sData) => {
                                BusyIndicator.hide();
                                console.log("VendorId", sData.VendorId)
                                MessageBox.success("Vendor creation request " + sData.Vendor + " created successfully. \n\n Also, Supplier form generated please fill to procced.", {
                                    onClose: () => {
                                        sap.ui.getCore().byId("createDialog").destroy();
                                        this.getData();
                                    }
                                });
                                this.sendEmailNotification(sData.VendorName, sData.VendorId, sData.VendorMail, sData.VenValidTo);
                            },
                            error: () => BusyIndicator.hide()
                        });
                    }, 1000);
                } else {
                    MessageBox.error("Please correct all the error's to proceed");
                }
            },

            sendEmailNotification: function (vendorName, vendorId, vendorMail, validTo) {
                let emailBody = `||Please find the link below for Vendor Assessment Form. Kindly log-in with the link to fill the form.<br><br>Form is valid till ${validTo}. Request you to fill the form and submit on time.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/ed7b03c3-9a0c-46b0-b0de-b5b00d211677.onboarding.spfiorisupplierform-0.0.1/index.html?id=${vendorId}">CLICK HERE</a>`;
                var oModel = this.getView().getModel();
                var mParameters = {
                    method: "GET",
                    urlParameters: {
                        vendorName: vendorName,
                        subject: "Supplier Form",
                        content: emailBody,
                        toAddress: vendorMail
                    },
                    success: function (oData, response) {
                        console.log("Email sent successfully.");
                    },
                    error: function (oError) {
                        console.log("Failed to send email.");
                    }
                };
                oModel.callFunction("/sendEmail", mParameters);
            },
            onFormPress: function () {
                // let url = "http://localhost:4004/supplierform/webapp/index.html?id=" + this.vendorId

                const href = window.location.href;
                let url;
                if (href.includes("impautosuppdev")) {

                  //  url = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/da8bb600-97b5-4ae9-822d-e6aa134d8e1a.onboarding.spfiorisupplierform-0.0.1/index.html?id=" + this.vendorId;
                    url = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/ed7b03c3-9a0c-46b0-b0de-b5b00d211677.onboarding.spfiorisupplierform-0.0.1/index.html?id=" + this.vendorId;
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
                if (requestData.purchase === true) {
                    data.Access = "Purchase";
                } else if (requestData.quality === true) {
                    data.Access = "Quality";
                } else if (requestData.coo === true) {
                    data.Access = "COO";
                } else if (requestData.ceo === true) {
                    data.Access = "CEO";
                }else if (requestData.finance === true) {
                    data.Access = "Finance";
                }
                var popOver = sap.ui.xmlfragment("sp.fiori.onboarding.fragment.VendorDetails", this);
                sap.ui.getCore().byId("displayPopover").setModel(new JSONModel(data), "VenModel");
                this.getView().addDependent(popOver);
                popOver.openBy(evt.getSource());
            },
            onResetValidityPress: function (evt) {
                BusyIndicator.show();
                var source = evt.getSource();
                // this.id = sap.ui.getCore().byId("displayPopover").getModel("VenModel").getProperty("/Vendor");
                var vendata = this.getView().getModel("DataModel").getData();
                var payload = {};
                for (var i = 0; i < vendata.length; i++) {
                    if (vendata[i].VendorId === this.vendorId) {
                        payload.Vendor = vendata[i].Vendor;
                        payload.VendorId = vendata[i].VendorId;
                        payload.VendorName = vendata[i].VendorName;
                        payload.VendorType = vendata[i].VendorType;
                        payload.Companycode = vendata[i].Companycode;
                        payload.RegistrationType = vendata[i].RegistrationType;
                        payload.Department = vendata[i].Department;
                        payload.Telephone = vendata[i].Telephone;
                        payload.City = vendata[i].City;
                        payload.VendorMail = vendata[i].VendorMail;
                        payload.VenFrom = new Date();;
                        payload.VenValidTo = this.changeDate(payload.VenFrom, 7, "add");
                        payload.VenTimeLeft = "";
                        payload.Status = vendata[i].Status;
                        payload.ResetValidity = "";
                        payload.initiatedBy = vendata[i].initiatedBy;
                        payload.RelatedPart = vendata[i].RelatedPart;
                        break;
                    }
                }
                setTimeout(() => {
                    this.getView().getModel().update("/VenOnboard(Vendor='" + payload.Vendor + "',VendorId=" + this.vendorId + ")", payload, {
                        success: () => {
                            BusyIndicator.hide();
                            MessageBox.success("Form validity extended for next 7 days for vendor " + this.vendor, {
                                onClose: () => {
                                    source.getParent().getParent().destroy();
                                    this.getData();
                                }
                            });
                        },
                        error: (error) => {
                            BusyIndicator.hide();
                            console.log(error);
                        }
                    });
                }, 1000);
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
            changeStatus: function () {
                var vendata = this.getView().getModel("DataModel").getData();
                var formdata = this.getView().getModel("FormData").getData();
                var payload = {};
                for (var i = 0; i < vendata.length; i++) {
                    if (vendata[i].VendorId === this.vendorId) {
                        payload.Vendor = vendata[i].Vendor;
                        payload.VendorId = vendata[i].VendorId;
                        payload.VendorName = vendata[i].VendorName;
                        payload.VendorType = vendata[i].VendorType;
                        payload.Companycode = vendata[i].Companycode;
                        payload.RegistrationType = vendata[i].RegistrationType;
                        payload.Department = vendata[i].Department;
                        payload.Telephone = vendata[i].Telephone;
                        payload.City = vendata[i].City;
                        payload.VendorMail = vendata[i].VendorMail;
                        this.VendorMail = vendata[i].VendorMail;
                        payload.VenValidTo = vendata[i].VenValidTo;
                        payload.VenFrom = vendata[i].VenFrom;
                        payload.VenTimeLeft = vendata[i].VenTimeLeft;
                        payload.initiatedBy = vendata[i].initiatedBy;
                        this.initiatedBy = vendata[i].initiatedBy;
                        var venStatus = vendata[i].Status;
                        payload.ResetValidity = vendata[i].ResetValidity;
                        payload.RelatedPart = vendata[i].RelatedPart;
                        var venRelated = vendata[i].RelatedPart;
                        break;
                    }
                }
                var stat = "";
                var level = "";
                var pending = "";
                var appr = "0";
                if (venStatus === "SBQ") {
                    this.access = "Purchase";
                    this.emailbody = `||Form is approved by the Quality. Approval pending at Purchase `;
                    this.VendorName = "Purchase Team";
                    stat = "ABQ";
                    level = "2";
                    pending = "Purchase"
                    this.msg = "Approved by Quality";
                } else if (venStatus === "SBP") {
                    this.access = "COO";
                    this.emailbody = `||Form is approved by the Purchase. Approval pending at COO `;
                    this.VendorName = "COO Team";
                    stat = "ABP";
                    level = "3";
                    pending = "COO"
                    this.msg = "Approved by Purchase";
                } else if (venStatus === "SBC" && venRelated === "No") {
                    this.access = "Finance";
                    this.emailbody = `||Form is approved by the COO. Approval pending at Finance `;
                    this.VendorName = "Finance Team";
                    stat = "ABC";
                    level = "4";
                    pending = "Finance"
                    this.msg = "Approved by COO";
                } else if (venStatus === "SBC" && venRelated === "Yes") {
                    this.access = "CEO";
                    this.emailbody = `||Form is approved by the COO. Approval pending at CEO `;
                    this.VendorName = "CEO Team";
                    stat = "ABC";
                    level = "4";
                    pending = "CEO"
                    this.msg = "Approved by COO";
                }else if (venStatus === "SBE" && venRelated === "Yes") {
                    this.access = "Finance";
                    this.emailbody = `||Form is approved by the CEO. Approval pending at Finance `;
                    this.VendorName = "Finance Team";
                    stat = "ABE";
                    level = "5";
                    pending = "Finance"
                    this.msg = "Approved by CEO";
                }  else if (venStatus === "SBF") {
                    this.access = "Supplier";
                    this.emailbody = `||Form is approved by the Finance and BP created successfully. `;
                    this.VendorName = payload.VendorName;
                    stat = "ABF";
                    payload.AddressCode = formdata.AddressCode;
                    this.msg = "Approved by Finance and BP " + payload.AddressCode + " created successfully";
                }
                payload.Status = stat;
                payload.VenLevel = level;
                payload.VenApprovalPending = pending;
                payload.VenApprove = appr;
                this.initiateName = "Initiator";
                this.getView().getModel().update("/VenOnboard(Vendor='" + payload.Vendor + "',VendorId=" + this.vendorId + ")", payload, {
                    success: async () => {
                        BusyIndicator.hide();
                        MessageBox.success(this.msg, {
                            onClose: () => this.getData()
                        });
                        // Send email to initiatedBy
                        this.sendApprovalEmailNotification(this.emailbody, this.initiateName, this.initiatedBy);
                        // Fetch and send emails  
                        if(this.access !== "Supplier"){
                        try {
                            var deptEmails = await this.getEmails(this.access);
                            deptEmails.forEach(email => {
                                this.sendApprovalEmailNotification(this.emailbody, this.VendorName, email);
                            });
                        } catch (error) {
                            console.error("Error fetching emails: ", error);
                        }
                    }else if(this.access === "Supplier"){
                        this.sendApprovalEmailNotification(this.emailbody, this.VendorName, this.VendorMail);
                    }
                    },
                    error: (error) => {
                        BusyIndicator.hide();
                        console.log(error);
                    }
                });
            },
            sendApprovalEmailNotification: function (emailbody, vendorName, vendorMail) {
               // let emailBody = `||Form is submitted by the supplier. Approval pending at Quality `;
                var oModel = this.getView().getModel();
                var mParameters = {
                    method: "GET",
                    urlParameters: {
                        vendorName: vendorName,
                        subject: "Supplier Form",
                        content: emailbody,
                        toAddress: vendorMail
                    },
                    success: function (oData, response) {
                        console.log("Email sent successfully.");
                    },
                    error: function (oError) {
                        console.log("Failed to send email.");
                    }
                };
                oModel.callFunction("/sendEmail", mParameters);
            },

            getEmails: async function(access) {
                var oModel = this.getView().getModel();
                return new Promise((resolve, reject) => {
                    oModel.read("/AccessInfo", {
                        filters: [new sap.ui.model.Filter("Access", sap.ui.model.FilterOperator.EQ, access)],
                        success: function(oData) {
                            var emails = oData.results.map(item => item.email);
                            resolve(emails);
                        },
                        error: function(oError) {
                            reject(oError);
                        }
                    });
                });
            },
            getFormData: function () {
                var vendata = this.getView().getModel("DataModel").getData();
                var formdata = this.getView().getModel("FormData").getData();
                var res = this.getView().getModel("UserApiDetails").getData();
                if (formdata.ExciseDivision === null) {
                    formdata.ExciseDivision = "-";
                }
                if (formdata.ExciseBankAcc === null) {
                    formdata.ExciseBankAcc = "-";
                }
                if (formdata.STRatePerc === null) {
                    formdata.STRatePerc = "0";
                }
                if (formdata.JWRWCost === null) {
                    formdata.JWRWCost = "0";
                }
                if (formdata.ExciseRange === null) {
                    formdata.ExciseRange = "0";
                }
                if (formdata.ExciseBankName === null) {
                    formdata.ExciseBankName = "-";
                }
                if (formdata.STRateSurcharge === null) {
                    formdata.STRateSurcharge = "0";
                }
                if (formdata.LSTNo === null) {
                    formdata.LSTNo = "0";
                }
                if (formdata.GroupCode7 === null) {
                    formdata.GroupCode7 = "/ /";
                }
                if (formdata.Fax === null) {
                    formdata.Fax = "";
                }
                if (formdata.LeadTime === null) {
                    formdata.LeadTime = "";
                }
                if (formdata.Remarks === null) {
                    formdata.Remarks = "";
                }
                if (formdata.Designation === null) {
                    formdata.Designation = "";
                }
                if (formdata.DeliveryMode === null) {
                    formdata.DeliveryMode = "";
                }
                if (formdata.CustomerCat === null) {
                    formdata.CustomerCat = "";
                }
                if (formdata.ExciseDivision === null) {
                    formdata.ExciseDivision = "";
                }
                if (formdata.ExciseBankAcc === null) {
                    formdata.ExciseBankAcc = "";
                }
                if (formdata.Tin === null) {
                    formdata.Tin = "";
                }
                if (formdata.Composite === null) {
                    formdata.Composite = "";
                }
                if (formdata.GstNumber === null) {
                    formdata.GstNumber = "";
                }
                if (formdata.CreditRating === null) {
                    formdata.CreditRating = "";
                }
                if (formdata.CreditRatingAgency === null) {
                    formdata.CreditRatingAgency = "";
                }
                if (formdata.ServiceAccType === null) {
                    formdata.ServiceAccType = "";
                }
                if (formdata.ECCNo === null) {
                    formdata.ECCNo = "";
                }
                if (formdata.CSTDate === null) {
                    formdata.CSTDate = "";
                }
                if (formdata.LSTDate === null) {
                    formdata.LSTDate = "";
                }

                if (formdata.ExciseNo === null) {
                    formdata.ExciseNo = "";
                }
                if (formdata.JWRWCost === null) {
                    formdata.JWRWCost = "";
                }
                if (formdata.CompanyType === null) {
                    formdata.CompanyType = "";
                }
                if (formdata.ISOExpiryDate === null) {
                    formdata.ISOExpiryDate = "";
                }
                if (formdata.AddressType === null) {
                    formdata.AddressType = "";
                }
                if (formdata.ExciseRange === null) {
                    formdata.ExciseRange = "";
                }
                if (formdata.ExciseBankName === null) {
                    formdata.ExciseBankName = "";
                }
                if (formdata.CinNo === null) {
                    formdata.CinNo = "";
                }
                if (formdata.GstRegistered === null) {
                    formdata.GstRegistered = "";
                }
                if (formdata.GSTDate === null) {
                    formdata.GSTDate = "";
                }
                if (formdata.MsmeMainCertificateId === null) {
                    formdata.MsmeMainCertificateId = "";
                }
                if (formdata.ServiceAccCode === null) {
                    formdata.ServiceAccCode = "";
                }
                if (formdata.STRateSurcharge === null) {
                    formdata.STRateSurcharge = "";
                }
                if (formdata.CSTNo === null) {
                    formdata.CSTNo = "";
                }
                if (formdata.LSTNo === null) {
                    formdata.LSTNo = "";
                }
                if (formdata.Pan === null) {
                    formdata.Pan = "";
                }
                if (formdata.ExciseDate === null) {
                    formdata.ExciseDate = "";
                }
                if (formdata.GroupingLocation === null) {
                    formdata.GroupingLocation = "";
                }
                if (formdata.GroupCode5 === null) {
                    formdata.GroupCode5 = "";
                }
                if (formdata.GroupCode4 === null) {
                    formdata.GroupCode4 = "";
                }
                if (formdata.Transporters === null) {
                    formdata.Transporters = "";
                }
                if (formdata.GroupCode8 === null) {
                    formdata.GroupCode8 = "";
                }
                if (formdata.AccountNo === null) {
                    formdata.AccountNo = "";
                }
                if (formdata.IFSCCode === null) {
                    formdata.IFSCCode = "";
                }
                if (formdata.BeneficiaryName === null) {
                    formdata.BeneficiaryName = "";
                }
                if (formdata.BankName === null) {
                    formdata.BankName = "";
                }
                if (formdata.BankAddress === null) {
                    formdata.BankAddress = "";
                }
                var form = {
                    "SupplierType": formdata.SupplierType,
                    "UnitCode": sessionStorage.getItem("unitCode"),
                    "AddressCode": formdata.AddressCode,
                    "AddressDesc": formdata.VendorName,
                    "vendorAddress": formdata.Address1,
                    "AccountCode": formdata.AccountCode,
                    "AccountDesc": formdata.AccountDesc,
                    "FaxNo": formdata.Fax,
                    "ContactPerson": formdata.ContactPersonName,
                    "LeadTime": formdata.LeadTime,
                    "Remark": formdata.Remarks,
                    "IAIvendorCode": "",
                    "Country": formdata.Country_code,
                    "State": formdata.State_name,
                    "City": formdata.City_name,
                    "Location": formdata.Location,
                    "PinNo": formdata.Pincode,
                    "PhoneNumber": formdata.Telephone,
                    "Email": formdata.VendorMail,
                    "ContactPersonDesgn": formdata.ContactPersonDesignation,
                    "DeliveryMode": formdata.DeliveryMode,
                    "CustomerCategory": formdata.CustomerCat,
                    "ExciseDivision": formdata.ExciseDivision,
                    "ExciseBankAccount": formdata.ExciseBankAcc,
                    "StRatePercent": formdata.STRatePerc,
                    "TinNo": formdata.Tin,
                    "Composite": formdata.Composite,
                    "GSTRegistartion": formdata.GstNumber,
                    "CreditRating": formdata.CreditRating,
                    "CreditRatingAgency": formdata.CreditRatingAgency,
                    "ServiceAccounType": formdata.ServiceAccType,
                    "ECCNo": formdata.ECCNo,
                    "CSTDate": formdata.CSTDate,
                    "LSTDate": formdata.LSTDate,
                    "ExciseNo": formdata.ExciseNo,
                    "JswCost": formdata.JWRWCost,
                    "CompanyType": formdata.CompanyType,
                    "ISOExpiryDate": formdata.ISOExpiryDate,
                    "AddressType": formdata.AddressType,
                    "ExciseRange": formdata.ExciseRange,
                    "ExciseBankAccountName": formdata.ExciseBankName,
                    "ExciseDuty": formdata.ExciseDuty,
                    "CinNo": formdata.CinNo,
                    "GstRegistered": formdata.GstRegistered,
                    "GstDate": formdata.GSTDate,
                    "MSMEType": formdata.MsmeMainCertificateId,
                    "ServiceAccountCode": formdata.ServiceAccCode,
                    "STRateSurCharge": formdata.STRateSurcharge,
                    "CSTNo": formdata.CSTNo,
                    "LSTNo": formdata.LSTNo,
                    "PANNo": formdata.Pan,
                    "ExciseDate": formdata.ExciseDate,
                    "MRPPercentage": formdata.MRPPercentage,
                    "SalesPersonCode": "",
                    "DistanceKm": formdata.Distance,
                    "TypeOfSupplier": "",
                    "PartyClassification": formdata.PartyClassification,
                    "GroupingLocation": formdata.GroupingLocation,
                    "GroupCode5": formdata.GroupCode5,
                    "GroupCode7": formdata.GroupCode7,
                    "Tax": formdata.Tax,
                    "GroupCode4": formdata.GroupCode4,
                    "Transporters": formdata.Transporters,
                    "GroupCode8": formdata.GroupCode8,
                    "BankAccountNo": formdata.AccountNo,
                    "IFSCNo": formdata.IFSCCode,
                    "PayeeName": formdata.BeneficiaryName,
                    "BankName": formdata.BankName,
                    "BankAddress": formdata.BankAddress,
                    "ContantInformation": [
                        {
                            "ContactName": formdata.ContactPersonName,
                            "ContactDepartment": formdata.ContactPersonDepartment,
                            "ContactAddress": formdata.ContactPersonDesignation,
                            "ContactPhoneNo": formdata.ContactPersonPhone,
                            "ContactMobiloNo": formdata.ContactPersonMobile,
                            "ContactEmail": formdata.ContactPersonMail,
                            "SNo": "1"
                        },
                        {
                            "ContactName": formdata.ContactPersonName2,
                            "ContactDepartment": formdata.ContactPersonDepartment2,
                            "ContactAddress": formdata.ContactPersonDesignation2,
                            "ContactPhoneNo": formdata.ContactPersonPhone2,
                            "ContactMobiloNo": formdata.ContactPersonMobile2,
                            "ContactEmail": formdata.ContactPersonMail2,
                            "SNo": "2"
                        }
                    ],
                    "DocumentRequired": [
                        {
                            "DocumentCode": formdata.DocCode,
                            "DocumentDescription": formdata.DocDescription
                        }
                    ],
                    "TransMode": "",
                    "CreatedBy": "Manikandan",
                    "CreatedIP": "",
                    "UpdatedBy": ""
                };
                if (sessionStorage.getItem("isunitaddressexists") === true) {
                    form.TransMode = "EDIT";
                    form.UpdatedBy = res.email;
                } else {
                    form.TransMode = "ADD";
                }
                var formdatastr = JSON.stringify(form);
                this.hardcodedURL = "";
                if (window.location.href.includes("launchpad")) {
                    //this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/da8bb600-97b5-4ae9-822d-e6aa134d8e1a.onboarding.spfiorionboarding-0.0.1";
                    this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/ed7b03c3-9a0c-46b0-b0de-b5b00d211677.onboarding.spfiorionboarding-0.0.1";
                }
                var sPath = this.hardcodedURL + `/v2/odata/v4/catalog/submitFormData`;
                $.ajax({
                    type: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: sPath,
                    data: JSON.stringify({
                        data: formdatastr
                    }),
                    context: this,
                    success: function (data, textStatus, jqXHR) {
                        this.changeStatus();
                    }.bind(this),
                    error: function (error) {
                        MessageBox.success("BP creation failed");
                    }
                });
            },
            onApprPress: function (evt) {
                var vendata = this.getView().getModel("DataModel").getData();
                var sPath = evt.getSource().getBindingContext("DataModel").sPath.split("/")[1];
                this.vendorId = vendata[sPath].VendorId;
                var status = vendata[sPath].Status;
                if (status === "SBF") {
                    setTimeout(() => {
                        this.getView().getModel().read("/VendorForm(VendorId='" + this.vendorId + "')", {
                            success: (data) => {
                                this.getView().getModel("FormData").setData(data);
                                // var accessdata = this.getView().getModel("AccessDetails").getData();
                                // this.compcodecheck = accessdata.find(item => item.CompCode === data.Bukrs) ? true : false;
                                // this.compcodecheck = true;
                                BusyIndicator.hide();
                                this.getFormData();
                                // if (this.compcodecheck) {
                                //     this.getFormData();
                                // } else {
                                //     MessageBox.error("User does not belong to company code " + data.Bukrs + " and hence cannot approve");
                                // }
                            },
                            error: () => {
                                BusyIndicator.hide();
                            }
                        });
                    }, 1000);
                } else {
                    setTimeout(() => {
                        this.getView().getModel().read("/VendorForm(VendorId='" + this.vendorId + "')", {
                            success: (data) => {
                                this.getView().getModel("FormData").setData(data);
                                this.changeStatus();
                                // var accessdata = this.getView().getModel("AccessDetails").getData();
                                // this.compcodecheck = accessdata.find(item => item.CompCode === data.Bukrs) ? true : false;
                                // this.compcodecheck = true;
                                // BusyIndicator.hide();
                                // if (this.compcodecheck) {
                                //     this.changeStatus();
                                // } else {
                                //     MessageBox.error("User does not belong to company code " + data.Bukrs + " and hence cannot approve");
                                // }
                            },
                            error: () => {
                                BusyIndicator.hide();
                            }
                        });
                    }, 1000);
                }

                // var payload = {};
                // for (var i = 0; i < vendata.length; i++) {
                //     if (vendata[i].VendorId === this.vendorId) {
                //         payload.Vendor = vendata[i].Vendor;
                //         payload.VendorId = vendata[i].VendorId;
                //         payload.VendorName = vendata[i].VendorName;
                //         payload.VendorType = vendata[i].VendorType;
                //         payload.Department = vendata[i].Department;
                //         payload.Telephone = vendata[i].Telephone;
                //         payload.City = vendata[i].City;
                //         payload.VendorMail = vendata[i].VendorMail;
                //         payload.VenValidTo = vendata[i].VenValidTo;
                //         payload.VenFrom = vendata[i].VenFrom;
                //         payload.VenTimeLeft = vendata[i].VenTimeLeft;
                //         var venStatus = vendata[i].Status;
                //         payload.ResetValidity = vendata[i].ResetValidity;
                //         break;
                //     }
                // }
                // var stat = "";
                // var level = "";
                // var pending = "";
                // var appr = "0";
                // if (venStatus === "SBF") {
                //     stat = "SCA";
                //     appr = "1"
                //     level = "2";
                //     pending = "Finance"
                //     this.msg = "Approved by Supply Chain";
                // } else if (venStatus === "SCA") {
                //     stat = "ABF";
                //     this.msg = "Approved by Finance and BP created successfully";
                //     payload.BusinessPartnerNo = "90789S";
                // }
                // payload.Status = stat;
                // payload.VenLevel = level;
                // payload.VenApprovalPending = pending;
                // payload.VenApprove = appr;
                // this.getView().getModel().update("/VenOnboard(Vendor='" + payload.Vendor + "',VendorId=" + this.vendorId + ")", payload, {
                //     success: () => {
                //         BusyIndicator.hide();
                //         MessageBox.success(this.msg, {
                //             onClose: () => this.getData()
                //         });
                //     },
                //     error: (error) => {
                //         BusyIndicator.hide();
                //         console.log(error);
                //     }
                // });
            },
            onRejPress: function (evt) {
                var vendata = this.getView().getModel("DataModel").getData();
                var sPath = evt.getSource().getBindingContext("DataModel").sPath.split("/")[1];
                this.vendorId = vendata[sPath].VendorId;
                var payload = {};
                for (var i = 0; i < vendata.length; i++) {
                    if (vendata[i].VendorId === this.vendorId) {
                        payload.Vendor = vendata[i].Vendor;
                        payload.VendorId = vendata[i].VendorId;
                        payload.VendorName = vendata[i].VendorName;
                        payload.VendorType = vendata[i].VendorType;
                        payload.Companycode = vendata[i].Companycode;
                        payload.RegistrationType = vendata[i].RegistrationType;
                        payload.Department = vendata[i].Department;
                        payload.Telephone = vendata[i].Telephone;
                        payload.City = vendata[i].City;
                        payload.VendorMail = vendata[i].VendorMail;
                        payload.VenValidTo = vendata[i].VenValidTo;
                        payload.VenFrom = vendata[i].VenFrom;
                        payload.VenTimeLeft = vendata[i].VenTimeLeft;
                        payload.initiatedBy = vendata[i].initiatedBy;
                        var venStatus = vendata[i].Status;
                        payload.ResetValidity = vendata[i].ResetValidity;
                        payload.RelatedPart = vendata[i].RelatedPart;
                        break;
                    }
                }
                var stat = "";
                var level = "";
                var pending = "";
                var appr = "0";
                if (venStatus === "SBQ") {
                    stat = "RBQ";
                    this.msg = "Rejected successfully by Quality";
                } else if (venStatus === "SBP") {
                    stat = "RBP";
                    level = "1";
                    pending = "Quality";
                    this.msg = "Rejected successfully by Purchase Head";
                } else if (venStatus === "SBC") {
                    stat = "RBC";
                    level = "1";
                    pending = "Quality";
                    this.msg = "Rejected successfully by COO";
                }else if (venStatus === "SBE") {
                    stat = "RBE";
                    level = "1";
                    pending = "Quality";
                    this.msg = "Rejected successfully by CEO";
                } else if (venStatus === "SBF") {
                    stat = "RBF";
                    level = "1";
                    pending = "Quality";
                    this.msg = "Rejected successfully by Finance";
                }
                payload.Status = stat;
                payload.VenLevel = level;
                payload.VenApprovalPending = pending;
                payload.VenApprove = appr;
                this.VendorName = payload.VendorName;
                this.VendorMail = payload.VendorMail;
                this.VenValidTo = payload.VenValidTo;
                this.venstatus = stat;
                this.getView().getModel().update("/VenOnboard(Vendor='" + payload.Vendor + "',VendorId=" + this.vendorId + ")", payload, {
                    success: () => {

                        MessageBox.success(this.msg, {
                            onClose: () => this.getData()
                        });
                        if (this.venstatus === "RBQ") { 
                        this.sendEmailNotification(this.VendorName, this.vendorId, this.VendorMail, this.VenValidTo);
                    }
                },
                    error: (error) => {
                        BusyIndicator.hide();
                        console.log(error);
                    }
                });
    },
            // changevalidity: function (venItem) {
            //     var payload = venItem;
            //     var today = new Date();
            //     var expirationDate = new Date(venItem.VenValidTo);

            //     if (today >= expirationDate) {
            //     payload.ResetValidity = "X";
            //     this.getView().getModel().update("/VenOnboard(Vendor='" + payload.Vendor + "',VendorId=" + payload.VendorId + ")", payload, {
            //         success: () => {
            //              return;
            //         },
            //         error: (error) => {
            //             BusyIndicator.hide();
            //             console.log(error);
            //         }
            //     });
            // }else{
            //     return;
            // }

            // }

        });
    });
