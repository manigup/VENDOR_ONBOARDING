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

        return Controller.extend("sp.fiori.supplierform.controller.View1", {
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

                this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a1aa5e6e-4fe2-49a5-b95a-5cd7a2b05a51.onboarding.spfiorionboarding-0.0.1";
                this.initializeCountries();

            },
            handleRouteMatched: function (oEvent) {
                if (oEvent.getParameter("name") !== "RouteView1") {
                    return;
                }
        
                this.id = jQuery.sap.getUriParameters().get("id");
                var requestData = this.getView().getModel("request").getData();
              //  BusyIndicator.show();
                this.vendorId = requestData.VendorId;

                    var payload = {
                        VendorId: requestData.VendorId,
                        VendorType: requestData.VendorType,
                        VendorName: requestData.VendorName,
                        VendorMail: requestData.VendorMail,
                        Telephone: requestData.Telephone
                    };
                    var payloadStr = JSON.stringify(payload);

                    //var modulePath = jQuery.sap.getModulePath("sp/fiori/supplierform");
                    //modulePath = modulePath === "." ? "" : modulePath;
                    var sPath = this.hardcodedURL + `/v2/odata/v4/catalog/VendorForm('${payload.VendorId}')`;
                    $.ajax({
                        type: "GET",
                        contentType: "application/json",
                        url: sPath,
                        context: this,
                        

                        success: function (sdata, textStatus, jqXHR) {
                            let data = sdata.d;
                            if (jqXHR.status === 200 || jqXHR.status === 204) {
                                console.log("Data upserted successfully.");
                            }
                            if (requestData.VendorType === "DM") {
                                if (!data.GstApplicable) {
                                    data.GstApplicable = "YES";
                                }
                                if (!data.MsmeValidTo) {
                                    data.MsmeValidTo = "99991231";
                                }
                            }
                            if (!data.Type) {
                                data.Type = "MATERIAL";
                                // data.ScopeOfSupply = "PARTS";
                            }
                            if (!data.MsmeItilView && requestData.VendorType === "DM") {
                                data.MsmeItilView = "MSME";
                                this.byId("msmeItil").setSelectedIndex(0);
                            } else if (data.MsmeItilView === "Non MSME") {
                                this.byId("msmeItil").setSelectedIndex(1);
                            }
                            if (data.MsmeMainCertificate === "X") {
                                this.byId("msmeCert").setSelected(true);
                            }

                            data.BeneficiaryName = requestData.VendorName;



                            this.createModel.setData(data);
                            this.createModel.refresh(true);
                            // if (data.Country) {
                            //     this.countryHelpSelect();
                            // }
                            this._setRadioButtons(data);
                            BusyIndicator.hide();
                        }.bind(this),
                        error: function (jqXHR, textStatus, errorThrown) {
                            BusyIndicator.hide();
                            console.log("Upsert failed: ", errorThrown);
                        }
                    });

                    this._showRemainingTime();

                },
            
                _showRemainingTime: function () {
                    var that = this;
                    var data = this.getView().getModel("request").getData();
                    
                    try {
                        // Extract the timestamp and convert it to integer
                        var timestampExpiry = parseInt(data.VenValidTo.match(/\/Date\((\d+)\+\d+\)\//)[1]);
                        var expiry = new Date(timestampExpiry);
                        var current = new Date();
                
                        var countdown = setInterval(function () {
                            current = new Date();
                            that.distance = expiry - current;
                
                            // Time calculations for days, hours, minutes and seconds
                            var days = Math.floor(that.distance / (1000 * 60 * 60 * 24));
                            var hours = Math.floor((that.distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            var minutes = Math.floor((that.distance % (1000 * 60 * 60)) / (1000 * 60));
                            var seconds = Math.floor((that.distance % (1000 * 60)) / 1000);
                
                            data.VenTimeLeft = ` ${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
                
                            that.getView().getModel("request").refresh(true);
                            that.getView().byId("idRemTime").setText(data.VenTimeLeft);
                
                            if (that.distance < 0) {
                                clearInterval(countdown);
                                data.VenTimeLeft = "EXPIRED";
                                that.getView().getModel("request").refresh(true);
                                MessageBox.error("Form expired");
                                that.getView().byId("saveBtnId").setVisible(false);
                                that.getView().byId("submitBtnId").setVisible(false);
                            }
                        }, 1000);
                    } catch (e) {
                        console.error("Error in calculating remaining time: ", e);
                    }
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

            initializeCountries: function() {
                console.log("Country initialization")
                var oComboBox = this.getView().byId("countryId");
                if (!oComboBox.getModel("countries")) {
                    this.loadCountries();
                }
            },

            loadCountries: function() {
                var oComboBox = this.getView().byId("countryId");
                var oDataModel = this.getOwnerComponent().getModel();
                var sPath = "/Country";
            
                oDataModel.read(sPath, {
                    success: function(oData) {
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
                    error: function(oError) {
                        console.log("Error", oError);
                        sap.m.MessageToast.show("Failed to load countries.");
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

            onSavePress: function (oEvent) { // Save as Draft is Pressed
                var data = this.createModel.getData();
                var requestData = this.getView().getModel("request").getData();
                data.VendorName = requestData.VendorName;
                data.Telephone = requestData.Telephone;
                data.VendorType = requestData.VendorType;
                data.VendorMail = requestData.VendorMail;
                data.BeneficiaryName = requestData.VendorName;
                var payloadStr = JSON.stringify(data);
                
                // var oDataModel = this.getOwnerComponent().getModel();
                BusyIndicator.show();
                var sPath = this.hardcodedURL + `/v2/odata/v4/catalog/VendorForm('${this.vendorId}')`;
                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    url: sPath,
                    data: payloadStr,

                    context: this,
                    success: function (data, textStatus, jqXHR) {
                        BusyIndicator.hide();

                        MessageBox.success("Form data saved successfully", {
                            onClose: () => {
                                window.location.reload();
                            }
                        });
                    }.bind(this),
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();

                    }
                });
                // setTimeout(() => {
                //     oDataModel.update("/VendorForm(VendorId='" + this.vendorId + "')", JSON.stringify(data), {
                //         //  headers: {
                //         //      "x-csrf-token": this.csrf_token
                //         //  },
                //         success: () => {
                //             BusyIndicator.hide();
                //             MessageBox.success("Form data saved successfully");
                //         },
                //         error: () => {
                //             BusyIndicator.hide();
                //         }
                //     });
                // }, 1000);
            },

            onSubmitPress: async function (oEvent) {
                var that = this;
                //BusyIndicator.show();
                var mandat = await this._mandatCheck(); // Mandatory Check
                if (!mandat) {
                    // var createData = this.createModel.getData();
                    // var data = this.getView().getModel("request").getData();
                    // var oDataModel = this.getView().getModel();

                    that.otp = that.getOTP();
                    that.otpTime = new Date().getTime();
                    MessageBox.information("To submit the data, kindly enter the OTP received " + that.otp, {
                        onClose: () => that._enterOTP()
                    });



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
                    BusyIndicator.hide();
                    if (mandat) {
                        MessageBox.information("Kindly fill all the required details");
                    }
                    // else if (!this.isGSTValid) {
                    //     MessageBox.error("Invalid GST Number");
                    // }
                }

            },

            _enterOTP: function () {
                var that = this;
                var core = sap.ui.getCore();
                let data = this.createModel.getData();
                var requestData = this.getView().getModel("request").getData();
                data.VendorName = requestData.VendorName;
                data.Telephone = requestData.Telephone;
                data.VendorType = requestData.VendorType;
                data.VendorMail = requestData.VendorMail;
                data.vendorId = requestData.vendorId
                data.BeneficiaryName = requestData.VendorName;
                if (!this.oSubmitDialog) {
                    this.oSubmitDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Enter the OTP Received ",
                        content: [
                            new Input("submissionNote", {
                                width: "100%",
                                placeholder: "Enter OTP",
                                liveChange: function (oEvent) {
                                    var sText = oEvent.getParameter("value");
                                    this.oSubmitDialog.getButtons()[0].setEnabled(sText.length >= 6);
                                }.bind(this)
                            })
                        ],
                        buttons: [
                            new Button({
                                type: ButtonType.Emphasized,
                                text: "Submit",
                                enabled: false,
                                press: function () {
                                    var currentTime = new Date().getTime();
                                    var timeDifference = currentTime - this.otpTime;
            
                                    var enterOtp = core.byId("submissionNote").getValue();
            
                                    if (timeDifference <= 300000 && enterOtp === this.otp) {
                                        // Successful OTP validation and submission
                                        BusyIndicator.show();
                                        data.Otp = enterOtp;
                                        var payloadStr = JSON.stringify(data);
                                        var sPath = this.hardcodedURL +  `/v2/odata/v4/catalog/VendorForm('${data.VendorId}')`;
                                        $.ajax({
                                            type: "PUT",
                                            contentType: "application/json",
                                            url: sPath,
                                            data: payloadStr,
                                            context: this,
                                            success: function (data, textStatus, jqXHR) {
                                                BusyIndicator.hide();
                                                if (jqXHR.status === 200 || jqXHR.status === 204) {
                                                    MessageBox.success("Form submitted successfully", {
                                                        onClose: () => {
                                                            this.changeStatus();
                                                        }
                                                    });
                                                }
                                            }.bind(this),
                                            error: function (jqXHR, textStatus, errorThrown) {
                                                console.log("Error: ", jqXHR, textStatus, errorThrown);
                                                BusyIndicator.hide();
                                            }
                                        });
                                        core.byId("submissionNote").setValue();
                                        this.oSubmitDialog.close();
                                    } else {
                                        core.byId("submissionNote").setValue();
                                        if (timeDifference > 60000) {
                                            MessageBox.error("OTP has expired");
                                        } else {
                                            MessageBox.error("Incorrect OTP");
                                        }
                                    }
                                }.bind(this)
                            }),
                            new Button({
                                text: "Resend OTP",
                                press: function () {
                                    this.onSubmitPress();
                                    this.oSubmitDialog.close();
                                }.bind(this)
                            }),
                            new Button({
                                type: ButtonType.Reject,
                                text: "Cancel",
                                press: function () {
                                    this.oSubmitDialog.close();
                                }.bind(this)
                            })
                        ]
                    });
                }
                this.oSubmitDialog.open();
            },

            onFileUploaderChange: function (evt) {
                var oFileUploader = evt.getSource();
                oFileUploader.setUploadUrl(this.getView().getModel().sServiceUrl + "/Attachments");
                BusyIndicator.show();
                var key = oFileUploader.getCustomData()[0].getKey();
                // oFileUploader.removeAllHeaderParameters();
                oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                    name: "slug",
                    value: this.vendorId + "/" + oFileUploader.getValue() + "/" + key 
                    
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
                } else {
                    var filename = evt.getParameters().fileName;
                    var customDataKey = evt.getSource().getCustomData()[0].getKey();
                    var data = this.createModel.getData();
                    data[customDataKey] = filename;
                    this.createModel.setData(data);
            
                    MessageToast.show("File " + filename + " Attached successfully");
                }
            },
            
            onFileSizeExceded: function (evt) {
                MessageBox.error("File size exceeds the range of 5MB");
                evt.getSource().setValueState("Error");
            },

            onAttachmentGet: function (evt) { 
                var key = evt.getSource().getCustomData()[0].getKey(); // this should be the Venfiletype
                BusyIndicator.show();
                setTimeout(() => {
                    var filters = [
                        new sap.ui.model.Filter("VendorId", sap.ui.model.FilterOperator.EQ, this.vendorId),
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

            getOTP: function () {
                var otpgen = Math.floor(100000 + Math.random() * 900000).toString();
                return otpgen;
            },

            changeStatus: function () {
                var requestData = this.getView().getModel("request").getData();
                var stat = "";
                if (requestData.Status === "INITIATED" || requestData.Status === "SRE-ROUTE" || requestData.Status === "SCR") {
                    stat = "SBS";
                } else if (requestData.Status === "SBS") {
                    stat = "SBC";
                } else if (requestData.Status === "SBF") {
                    stat = "SBF";
                }
                var payload = requestData;
                payload.Status = stat;
                var payloadStr = JSON.stringify(payload);
                var sPath = this.hardcodedURL + `/v2/odata/v4/catalog/VenOnboard(Vendor='${requestData.Vendor}',VendorId=${requestData.VendorId})`;
                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    url: sPath,
                    data: payloadStr,
                    context: this,
                    success: function (data, textStatus, jqXHR) {
                        if (jqXHR.status === 200 || jqXHR.status === 204) {
                            console.log("Data upserted successfully.");

                             window.location.reload();

                        }
                    }.bind(this),
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log("Upsert failed: ", errorThrown);
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
