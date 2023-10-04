sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    'sap/ui/core/BusyIndicator',
    'sap/ui/model/json/JSONModel',
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Input",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, BusyIndicator, JSONModel, Dialog, DialogType, Button, ButtonType, Input, Filter, FilterOperator, SimpleType, ValidateException, MessageToast) {
        "use strict";

        return Controller.extend("sp.fiori.onboarding.controller.Form", {
            onInit: function () {
                sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);

                this.router = sap.ui.core.UIComponent.getRouterFor(this); //Get Router
                this.router.attachRouteMatched(this.handleRouteMatched, this);
                this.createModel = new JSONModel();
                this.getView().setModel(this.createModel, "create");
                // this.isGSTValid = true
                // this.isPANValid = true

                var datePckerFrom = this.byId("MsmeValidFrom");
                datePckerFrom.addEventDelegate({
                    onAfterRendering: () => {
                        datePckerFrom.$().find('INPUT').attr('disabled', true).css('color', '#ccc');
                    }
                }, datePckerFrom);

                this.byId("MsmeValidTo").attachBrowserEvent("keypress", evt => evt.preventDefault());

                this.loadCountries();

            },
            handleRouteMatched: function (oEvent) {
                if (oEvent.getParameter("name") !== "Form") {
                    return;
                }
                //this.id = jQuery.sap.getUriParameters().get("id");
                var requestData = this.getView().getModel("request").getData();
                var vendordata = this.getView().getModel("DataModel").getData();
                this.id = oEvent.getParameter("arguments").VendorId;
                for (var i = 0; i < vendordata.length; i++) {
                    if (vendordata[i].VendorId === this.id) {
                        var vendorStatus = vendordata[i].Status;
                        break;
                    }
                }
                
                BusyIndicator.show();
                setTimeout(() => {
                    this.getView().getModel().read("/VendorForm(VendorId='" + this.id + "')", {
                        success: (data) => {

                            if (vendorStatus === "SBS"  && requestData.supplychain) {
                                requestData.edit = false;
                            } 
                            else if (vendorStatus === "SBC" && requestData.finance) {
                                requestData.edit = false;
                            }else if ( vendorStatus === "RBF" && requestData.supplychain) {
                                requestData.edit = false;
                                requestData.route = true;
                            }
                            else {
                                requestData.edit = ""
                            }
                            this.getView().getModel("request").refresh(true);
                            this.createModel.setData(data);
                            this.createModel.refresh(true);
                            this._setRadioButtons(data);
                            // this.createModel.setData(data);
                            this.createModel.refresh(true);
                            BusyIndicator.hide();
                        },
                        error: () => {
                            BusyIndicator.hide();
                        }
                    });
                }, 1000);
            },
            onEdit: function () {
                this.getView().getModel("request").getData().edit = true;
                this.getView().getModel("request").refresh(true);
            },

            _setRadioButtons: function (data) { //Set Radio Buttons Index
                if (data.VendorType === "IP") {
                    this.byId("venTypeRbId").setSelectedIndex(1);
                } else if (data.VendorType === "EM") {
                    this.byId("venTypeRbId").setSelectedIndex(2);
                }
                if (data.Type === "SERVICE") {
                    this.byId("typeRbId").setSelectedIndex(1);
                }
                if (data.Msme === "NO") {
                    this.byId("msmeRbId").setSelectedIndex(1);
                }
                if (data.GstApplicable === "NO") {
                    this.byId("gstRbId").setSelectedIndex(1);
                }
            },

            onNavBack: function () {
                this.router.navTo("list");
            },

            onVenNameChange: function (oEvent) { //When vendor name is selected auto populate Beneficiary Name
                var data = this.createModel.getData();
                data.BeneficiaryName = oEvent.getSource().getValue();
                this.createModel.refresh(true);
            },

            onRadioButtonSelect: function (oEvent) {
                var data = this.createModel.getData();
                var id = oEvent.getParameter("id").substring(oEvent.getParameter("id").lastIndexOf('-') + 1);
                var index = oEvent.getParameter("selectedIndex");
                switch (id) {
                    case "venTypeRbId":
                        if (index === 1) {
                            data.VendorType = "IMPORT";
                        } else if (index === 2) {
                            data.VendorType = "EMPLOYEE";
                        } else {
                            data.VendorType = "DOMESTIC";
                        }
                        break;
                    case "typeRbId":
                        if (index === 1) {
                            data.Type = "SERVICE";
                        } else {
                            data.Type = "MATERIAL";
                        }
                        break;
                    case "gstRbId":
                        if (index === 1) {
                            data.GstApplicable = "NO";
                            // this.isGSTValid = true;
                        } else {
                            data.GstApplicable = "YES";
                        }
                        break;
                    case "msmeItil":
                        if (index === 0) {
                            data.MsmeItilView = "MSME";
                        } else {
                            data.MsmeItilView = "Non MSME";
                        }
                        break;
                }
                this.createModel.refresh(true);
            },
            _mandatCheck: async function () {

                var data = this.createModel.getData();
                var requestData = this.getView().getModel("request").getData();

                var oView = this.getView(),
                    bValidationError = false;
                var aInputs = [oView.byId("venNameId"), oView.byId("mobileId"), oView.byId("purposeId"),
                oView.byId("address1Id"), oView.byId("accNoId"), oView.byId("bankNameId"), oView.byId("ifscId"),
                oView.byId("branchNameId"), oView.byId("benNameId"), oView.byId("benLocId"),
                oView.byId("address2Id"), oView.byId("pincodeId"), oView.byId("contactPersonId"), oView.byId("contactPersonMobileId")];

                // Inside _mandatCheck function
                if (data.GstApplicable === "YES") {  // Making sure it's "YES" and not null
                    aInputs.push(oView.byId("gstId"));
                    var oDataModel = this.getView().getModel();
                    // Reset to true before verification
                    // this.isGSTValid = true;
                    var gstin = data.GstNumber;

                    // var sPathGST = "/verifyGSTDetails";
                    // var mParametersGST = {
                    //     urlParameters: {
                    //         gstin: gstin
                    //     }
                    // };

                    // Await the GST verification
                    // await new Promise((resolve, reject) => {
                    //     oDataModel.callFunction(sPathGST, {
                    //         ...mParametersGST,
                    //         success: function (oData, response) {
                    //             var result = oData.verifyGSTDetails;
                    //             if (!result.isValid) {
                    //                 this.isGSTValid = false;
                    //             }
                    //             resolve();
                    //         }.bind(this),
                    //         error: function (oError) {
                    //             this.isGSTValid = false;
                    //             resolve();
                    //         }.bind(this)
                    //     });
                    // });
                }

                // oView.byId("stateId")
                // oView.byId("constId")
                var aSelects = [oView.byId("countryId"),
                oView.byId("benAccTypeId")];

                if (data.MsmeItilView === 'MSME') {
                    aInputs.push(oView.byId("MsmeCertificateNo"));
                    aInputs.push(oView.byId("MsmeValidFrom"));
                    aInputs.push(oView.byId("MsmeRegistrationCity"));
                    aSelects.push(oView.byId("MsmeCertificateId"));
                }

                if (data.VendorType === "IP") {
                    aSelects.push(oView.byId("currId"));
                }
                if (data.VendorType === "DM" || data.VendorType === "EM") {
                    aInputs.push(oView.byId("panId"));
                }
                // Check that inputs are not empty.
                // Validation does not happen during data binding as this is only triggered by user actions.
                aInputs.forEach(function (oInput) {
                    bValidationError = this._validateInput(oInput) || bValidationError;
                }, this);

                aSelects.forEach(function (oInput) {
                    bValidationError = this._validateSelect(oInput, bValidationError) || bValidationError;
                }, this);

                bValidationError = this._validateAttachments(bValidationError);

                if (data.MsmeItilView === 'MSME' && !oView.byId("msmeCert").getSelected()) {
                    oView.byId("msmeCert").setValueState("Error");
                    bValidationError = true;
                }
                return bValidationError;
            },

            _validateInput: function (oInput) {
                var bValidationError, oBinding = oInput.getBinding("value");
                try {
                    oBinding.getType().validateValue(oInput.getValue());
                    oInput.setValueState("None");
                    bValidationError = false;
                } catch (oException) {
                    oInput.setValueState("Error");
                    bValidationError = true;
                }
                return bValidationError;
            },



            loadCountries: function () {
                var oComboBox = this.getView().byId("countryId");
                var oDataModel = this.getOwnerComponent().getModel();
                var sPath = "/Country";

                oDataModel.read(sPath, {
                    success: function (oData) {
                        var oJsonModel = new sap.ui.model.json.JSONModel();
                        oJsonModel.setData({ Countries: oData.results });

                        oComboBox.setModel(oJsonModel, "countries");
                        oComboBox.bindItems({
                            path: "countries>/Countries",
                            template: new sap.ui.core.Item({
                                key: "{countries>code}",
                                text: "{countries>name}"
                            })
                        });
                    },
                    error: function (oError) {
                        console.log("Error", oError);
                    }
                });
            },

            countryHelpSelect: function (oEvent) {
                var key = this.getView().byId("countryId").getSelectedKey();
                this.getView().byId("stateId").getBinding("items").filter([new Filter({
                    path: "Land1",
                    operator: FilterOperator.EQ,
                    value1: key
                })]);
            },

            _validateSelect: function (oInput, bValidationError) {
                var sValueState = "None";
                var value = oInput.getSelectedKey();

                try {
                    if (!value) {
                        oBinding.getType().validateValue(oInput.getValue());
                    }
                } catch (oException) {
                    sValueState = "Error";
                    bValidationError = true;
                }

                oInput.setValueState(sValueState);

                return bValidationError;
            },

            _validateAttachments: function (bValidationError) {
                var data = this.createModel.getData();

                if ((data.VendorType === "DM" || data.VendorType === "IP")) {
                    if (this.byId("quotfileUploader").getValue() || data.NewVendorQuotationName) {
                        this.byId("quotfileUploader").setValueState("None");
                    } else {
                        bValidationError = true;
                        this.byId("quotfileUploader").setValueState("Error");
                    }
                }

                if ((data.VendorType === "DM" || data.VendorType === "IP")) {
                    if (this.byId("cocFileUploader").getValue() || data.CocName) {
                        this.byId("cocFileUploader").setValueState("None");
                    } else {
                        bValidationError = true;
                        this.byId("cocFileUploader").setValueState("Error");
                    }
                }

                if (data.VendorType === "IP" || data.VendorType === "EM" || data.MsmeItilView === 'Non MSME' || this.byId("msmefileUploader").getValue() || data.MsmeDeclarationName) {
                    this.byId("msmefileUploader").setValueState("None");
                } else {
                    bValidationError = true;
                    this.byId("msmefileUploader").setValueState("Error");
                }

                if ((data.VendorType === "DM" || data.VendorType === "EM")) {
                    if (this.byId("panfileUploader").getValue() || data.PanName) {
                        this.byId("panfileUploader").setValueState("None");
                    } else {
                        bValidationError = true;
                        this.byId("panfileUploader").setValueState("Error");
                    }
                }

                if (data.GstApplicable === "YES") {
                    if (this.byId("gstfileUploader").getValue() || data.GstFileName) {
                        this.byId("gstfileUploader").setValueState("None");
                    } else {
                        bValidationError = true;
                        this.byId("gstfileUploader").setValueState("Error");
                    }
                }

                if (this.byId("canChqfileUploader").getValue() || data.CancelledCheque) {
                    this.byId("canChqfileUploader").setValueState("None");
                } else {
                    bValidationError = true;
                    this.byId("canChqfileUploader").setValueState("Error");
                }
                return bValidationError;
            },

            onInputChange: function (evt, field) {
                this.createModel.getData()[field] = evt.getParameter("newValue");
                this.createModel.refresh;
            },

            onSubmitPress: async function (oEvent) {
                var that = this;
                // BusyIndicator.show();
                var mandat = await this._mandatCheck(); // Mandatory Check
                if (!mandat) { //this.isGSTValid
                    var createData = this.createModel.getData();
                    // var data = this.getView().getModel("request").getData();
                    this.saveData(createData);
                    // Prepare the function import parameters
                    // var sPath = "/verifyBankAccount";
                    // var mParameters = {
                    //     urlParameters: {
                    //         beneficiaryAccount: createData.AccountNo,
                    //         beneficiaryIFSC: createData.IFSCCode
                    //     },
                    //     success: function (oData, response) {
                    //         var result = oData.verifyBankAccount; // or response.data.verifyBankAccount;
                    //         BusyIndicator.hide();

                    //         if (result.isValid) {
                    //             // Generate OTP and proceed
                    //             that.otp = that.getOTP();
                    //             MessageBox.information("To submit the data, kindly enter the OTP received " + that.otp, {
                    //                 onClose: () => that._enterOTP()
                    //             });
                    //         } else {
                    //             MessageBox.error(result.errorMessage);
                    //         }
                    //     },
                    //     error: function (oError) {
                    //         BusyIndicator.hide();
                    //         MessageBox.error("An error occurred while verifying the bank account.");
                    //     }
                    // };

                    // Execute the function import
                    // oDataModel.callFunction(sPath, mParameters);
                }
                else {
                    // BusyIndicator.hide();
                    if (mandat) {
                        MessageBox.information("Kindly fill all the required details");
                    }
                    // else if (!this.isGSTValid) {
                    //     MessageBox.error("Invalid GST Number");
                    // }
                }

            },

            saveData: function (createData) {
                BusyIndicator.show();
                setTimeout(() => {
                    this.getView().getModel().update("/VendorForm(VendorId='" + this.id + "')", createData, {
                        success: () => {
                            BusyIndicator.hide();
                            this.changeStatus();
                            // MessageBox.success("Form submitted successfully", {
                            //     onClose: () => formatter.onNavBack()
                            // }); 
                        },
                        error: () => {
                            BusyIndicator.hide();
                        }
                    });
                }, 1000);
            },

            onFileUploaderChange: function (evt) {
                var oFileUploader = evt.getSource();
                oFileUploader.setUploadUrl(this.getView().getModel().sServiceUrl + "/Attachments");
                BusyIndicator.show();
                var key = oFileUploader.getCustomData()[0].getKey();
                // oFileUploader.removeAllHeaderParameters();
                oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                    name: "slug",
                    value: this.id + "/" + oFileUploader.getValue() + "/" + key
                }));
                //oFileUploader.upload();

                oFileUploader.checkFileReadable().then(() => {
                    oFileUploader.upload();
                }, () => {
                    MessageBox.information("The file cannot be read. It may have changed.");
                });
            },

            onUploadComplete: function (evt) {
                BusyIndicator.hide();
                if (evt.getParameters().status !== 201) {
                    MessageBox.error(JSON.parse(evt.getParameters().responseRaw).error.message.value);
                    // BusyIndicator.show();
                } else {
                    var filename = evt.getParameters().fileName;
                    var customDataKey = evt.getSource().getCustomData()[0].getKey();
                    var data = this.createModel.getData();
                    data[customDataKey] = filename;
                    this.createModel.setData(data);
                    MessageToast.show("File " + fileName + " Attached successfully");

                }
            },

            onFileSizeExceded: function (evt) {
                MessageBox.error("File size exceeds the range of 5MB");
                evt.getSource().setValueState("Error");
            },

            onAttachmentGet: function (evt) { // display attachments
                var key = evt.getSource().getCustomData()[0].getKey(); // this should be the Venfiletype
                BusyIndicator.show();
                setTimeout(() => {
                    var filters = [
                        new sap.ui.model.Filter("VendorId", sap.ui.model.FilterOperator.EQ, this.id),
                        new sap.ui.model.Filter("Venfiletype", sap.ui.model.FilterOperator.EQ, key)
                    ];
                    var combinedFilter = new sap.ui.model.Filter({
                        filters: filters,
                        and: true // using AND to combine filters
                    });
                    this.getView().getModel().read("/Attachments", {
                        filters: [combinedFilter],
                        success: (data) => {
                            var item = data.results[0];
                            var fileUrl = this.getView().getModel().sServiceUrl + "/Attachments(VendorId='" + item.VendorId + "',ObjectId='" + item.ObjectId + "')/$value";
                            window.open(fileUrl, '_blank');
                            BusyIndicator.hide();
                        },
                        error: () => BusyIndicator.hide()
                    });
                }, 1000);
            },

            onMainCertificateChange: function (evt) {
                if (evt.getParameter("selected")) {
                    this.createModel.setProperty("/MsmeMainCertificate", "X");
                } else {
                    this.createModel.setProperty("/MsmeMainCertificate", "");
                }
                this.createModel.refresh(true);
            },

            changeStatus: function () {
                var vendata = this.getView().getModel("DataModel").getData();
                var payload = {};
                for (var i = 0; i < vendata.length; i++) {
                    if (vendata[i].VendorId === this.id) {
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
                        payload.ResetValidity = vendata[i].ResetValidity;
                        break;
                    }
                }
                var stat = "";
                var level = "";
                var pending = "";
                var appr = "0";
                if (venStatus === "SBS" || venStatus === "RBF") {
                    stat = "SBC";
                    this.msg = "Form submitted successfully by Supply Chain";
                } else if (venStatus === "SBC") {
                    stat = "SBF";
                    appr = "1"
                    level = "1";
                    pending = "Supply Chain";
                    this.msg = "Form submitted successfully by Finance";
                }
                payload.Status = stat;
                payload.VenLevel = level;
                payload.VenApprovalPending = pending;
                payload.VenApprove = appr;
                this.getView().getModel().update("/VenOnboard(Vendor='" + payload.Vendor + "',VendorId=" + this.id + ")", payload, {
                    success: () => {

                        MessageBox.success(this.msg, {
                            onClose: () => formatter.onNavBack()
                        });
                    },
                    error: (error) => {
                        BusyIndicator.hide();
                        console.log(error);
                    }
                });
                // var payloadStr = JSON.stringify(payload);
                // var sPath = `/v2/odata/v4/catalog/VenOnboard(Vendor='${vendata.Vendor}',VendorId=${vendata.VendorId})`;
                // $.ajax({
                //     type: "PUT",
                //     contentType: "application/json",
                //     url: sPath,
                //     data: payloadStr,
                //     context: this,
                //     success: function (data, textStatus, jqXHR) {
                //         MessageBox.success("Form submitted successfully", {
                //             onClose: () => formatter.onNavBack()
                //         }); 
                //     }.bind(this),
                //     error: function (jqXHR, textStatus, errorThrown) {
                //         console.log("Upsert failed: ", errorThrown);
                //     }
                // });
            },
            onReroutePress: function (evt) {
                var vendata = this.getView().getModel("DataModel").getData();
                var payload = {};
                for (var i = 0; i < vendata.length; i++) {
                    if (vendata[i].VendorId === this.id) {
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
                        payload.ResetValidity = vendata[i].ResetValidity;
                        break;
                    }
                }
                var stat = "";
                var level = "";
                var pending = "";
                var appr = "0";
                if (venStatus === "RBF") {
                    stat = "SRE-ROUTE";
                }
                payload.Status = stat;
                payload.VenLevel = level;
                payload.VenApprovalPending = pending;
                payload.VenApprove = appr;
                this.getView().getModel().update("/VenOnboard(Vendor='" + payload.Vendor + "',VendorId=" + this.id + ")", payload, {
                    success: () => {

                        MessageBox.success("Form re-routed successfully to supplier", {
                            onClose: () => formatter.onNavBack()
                        });
                    },
                    error: (error) => {
                        BusyIndicator.hide();
                        console.log(error);
                    }
                });
            },

            customPanType: SimpleType.extend("Pan", {
                formatValue: function (oValue) {
                    return oValue;
                },
                parseValue: function (oValue) {
                    return oValue;
                },
                validateValue: function (oValue) {
                    var regpan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
                    if (!oValue.match(regpan)) {
                        throw new ValidateException("'" + oValue + "' is not a valid PAN Number");
                    }
                }
            }),

            customGstType: SimpleType.extend("Gst", {
                formatValue: function (oValue) {
                    return oValue;
                },
                parseValue: function (oValue) {
                    return oValue;
                },
                validateValue: function (oValue) {
                    var reggst = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                    if (!oValue.match(reggst)) {
                        throw new ValidateException("'" + oValue + "' is not a valid GST Number");
                    }
                }
            }),
            customAccountType: SimpleType.extend("accountno", {
                formatValue: function (oValue) {
                    return oValue;
                },
                parseValue: function (oValue) {
                    return oValue;
                },
                validateValue: function (oValue) {

                    var rexMail = /^[a-zA-Z0-9]+$/;
                    if (!oValue.match(rexMail)) {
                        throw new ValidateException("'" + oValue + "' is not a valid Account Number");
                    }
                }
            }),
        });
    });
