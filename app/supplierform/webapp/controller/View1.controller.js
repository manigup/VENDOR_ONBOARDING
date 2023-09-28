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
    function (Controller, MessageBox, BusyIndicator, JSONModel, Dialog, DialogType, Button, ButtonType, Input, Filter, FilterOperator, SimpleType, ValidateException,MessageToast) {
        "use strict";

        return Controller.extend("sp.fiori.supplierform.controller.View1", {
            onInit: function () {
                sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);

			this.router = sap.ui.core.UIComponent.getRouterFor(this); //Get Router
			this.router.attachRouteMatched(this.handleRouteMatched, this);
			this.createModel = new JSONModel({
				"Otp": "",
				"Werks": "",
				"VenSubType": "DM",
				"Type": "MATERIAL",
				"VenName": "",
				"Purpose": "",
				"Consitution": "",
				"VendorCategory": "",
				"Pan": "",
				"Address1": "",
				"Address2": "",
				"Address3": "",
				"Country": "",
				"State": "",
				"Pincode": "",
				"ContactPerson": "",
				"Mobile": "",
				"Email": "",
				"Landline": "",
				"Fax": "",
				"Website": "",
				"ProductName": "",
				"PaymentTerm": "",
				"GstApplicable": "",
				"ImportExportCode": "",
				"Remarks": "",
				"Currency": "",
				"VAT": "",
				"NameOfService": "",
				"AvailableServiceName": "",
				"NameOfParts": "",
				"AvailablePartsName": "",
				"Others": "",
				"GstNumber": "",
				// "Agreement": 0
			});

			this.getView().setModel(this.createModel, "create");
            this.isGSTValid = true
            this.isPANValid = true

			var datePckerFrom = this.byId("MsmeValidFrom");
			datePckerFrom.addEventDelegate({
				onAfterRendering: () => {
					datePckerFrom.$().find('INPUT').attr('disabled', true).css('color', '#ccc');
				}
			}, datePckerFrom);

			this.byId("MsmeValidTo").attachBrowserEvent("keypress", evt => evt.preventDefault());

            this.getView().byId("countryId").attachBrowserEvent("click", this.loadCountries.bind(this));

            },
            handleRouteMatched: function (oEvent) {
                if (oEvent.getParameter("name") !== "RouteView1") {
                    return;
                }
                this.id = jQuery.sap.getUriParameters().get("id");
                var requestData = this.getView().getModel("request").getData();
                BusyIndicator.show();
                this.vendorId = requestData.VendorId;
                if(requestData.Status === "INITIATED"){
                var payload = {
                    VendorId: requestData.VendorId,
                    VendorType: requestData.VendorType,
                    VendorName: requestData.VendorName,
                    VendorMail: requestData.VendorMail,
                    Telephone: requestData.Telephone
                };
                var payloadStr = JSON.stringify(payload);
                var sPath = `/odata/v4/catalog/VendorForm('${payload.VendorId}')`;
                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    url: sPath,
                    data: payloadStr,

                    context: this,
                       success: function (data, textStatus, jqXHR) {
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
						if (!data.MsmeItilView && data.VendorType === "DM") {
							data.MsmeItilView = "MSME";
							this.byId("msmeItil").setSelectedIndex(0);
						} else if (data.MsmeItilView === "Non MSME") {
							this.byId("msmeItil").setSelectedIndex(1);
						}
						if (data.MsmeMainCertificate === "X") {
							this.byId("msmeCert").setSelected(true);
						}
						data.BeneficiaryName = data.VendorName;


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
            }
            // else{
            //     var sPath = "/odata/v4/catalog/VendorForm?$filter=VendorId eq " + this.id;
            //     $.ajax({
            //         type: "GET",
            //         contentType: "application/json",
            //         url: sPath,
            //         dataType: "json",
            //         context: this,
            //         success: function (data) {
            //             this.createModel.setData(data);
            //             this.createModel.refresh(true);
            //             BusyIndicator.hide();
            //         }.bind(this),
            //         error: () => {
            //             BusyIndicator.hide();
            //         }
            //     });
            // }
            },

            _showRemainingTime: function () {
                var that = this;
                var data = this.getView().getModel("request").getData();

                var expiryYYYY = data.VenValidTo.substring(0, 4);
                var expiryMonth = parseInt(data.VenValidTo.substring(5, 7)) - 1;
                // data.Date.substring(4, 6);
                var expiryDD = data.VenValidTo.substring(8, 10);
                // var expiryHH = data.Time.substring(0, 2);
                // var expiryMM = data.Time.substring(2, 4);
                // var expirySS = data.Time.substring(4, 6);
                var expiry = new Date(expiryYYYY, expiryMonth, expiryDD, "00");

                var todayDate = new Date();
                var today = todayDate.toJSON();
                var currentYYYY = today.substring(0, 4);
                var currentMonth = parseInt(today.substring(5, 7)) - 1;
                // data.SDate.substring(4, 6); 
                var currentDD = today.substring(8, 10);
                // var currentHH = data.STime.substring(0, 2);
                // var currentMM = data.STime.substring(2, 4);
                // var currentSS = data.STime.substring(4, 6);
                var current = new Date(currentYYYY, currentMonth, currentDD, "00");

                //var x = setInterval(function () {
                    expiry = new Date(expiry - 1000);
                    current = new Date(current - 1000);
                    that.distance = expiry - current;

                    // Time calculations for days, hours, minutes and seconds
                    var days = Math.floor(that.distance / (1000 * 60 * 60 * 24));
                    // var hours = Math.floor((that.distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    // var minutes = Math.floor((that.distance % (1000 * 60 * 60)) / (1000 * 60));
                    // var seconds = Math.floor((that.distance % (1000 * 60)) / 1000);

                    data.VenTimeLeft = days + " Days ";// + hours + " hours " + minutes + " minute " + seconds + " seconds ";
                    that.getView().getModel("request").refresh(true);
                    that.getView().byId("idRemTime").setText(data.VenTimeLeft);
                    if (that.distance < 0) {
                       // clearInterval(x);
                        data.VenTimeLeft = "EXPIRED";
                        that.getView().getModel("request").refresh(true);
                        MessageBox.error("Form expired");
                        that.getView().byId("saveBtnId").setVisible(false);
                        that.getView().byId("submitBtnId").setVisible(false);
                        return;
                    }

              //  }, 1000);
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
                                this.isGSTValid = true;
                                var gstin = data.GstNumber;
            
                                var sPathGST = "/verifyGSTDetails";
                                var mParametersGST = {
                                    urlParameters: {
                                        gstin: gstin
                                    }
                                };
            
                                // Await the GST verification
                                await new Promise((resolve, reject) => {
                                    oDataModel.callFunction(sPathGST, {
                                        ...mParametersGST,
                                        success: function (oData, response) {
                                            var result = oData.verifyGSTDetails;
                                            if (!result.isValid) {
                                                this.isGSTValid = false;
                                            }
                                            resolve();
                                        }.bind(this),
                                        error: function (oError) {
                                            this.isGSTValid = false;
                                            resolve();
                                        }.bind(this)
                                    });
                                });
                            }

                var aSelects = [oView.byId("constId"), oView.byId("countryId"), oView.byId("stateId"),
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
                    success: function(oData) {
                        var oJsonModel = new sap.ui.model.json.JSONModel();
                        oJsonModel.setData({Countries: oData.results});
            
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
                var oDataModel = this.getOwnerComponent().getModel();
                BusyIndicator.show();
                setTimeout(() => {
                    oDataModel.update("/VendorForm(VendorId='" + this.vendorId + "')", data, {
                        //  headers: {
                        //      "x-csrf-token": this.csrf_token
                        //  },
                        success: () => {
                            BusyIndicator.hide();
                            MessageBox.success("Form data saved successfully");
                        },
                        error: () => {
                            BusyIndicator.hide();
                        }
                    });
                }, 1000);
            },

            onSubmitPress: async function (oEvent) {
                var that = this;
                BusyIndicator.show();
                var mandat = await this._mandatCheck(); // Mandatory Check
                if (!mandat && this.isGSTValid) {
                    var createData = this.createModel.getData();
                    var data = this.getView().getModel("request").getData();
                    var oDataModel = this.getView().getModel();
            
                    // Prepare the function import parameters
                    var sPath = "/verifyBankAccount";
                    var mParameters = {
                        urlParameters: {
                            beneficiaryAccount: createData.AccountNo,
                            beneficiaryIFSC: createData.IFSCCode
                        },
                        success: function (oData, response) {
                            var result = oData.verifyBankAccount; // or response.data.verifyBankAccount;
                            BusyIndicator.hide();

                            if (result.isValid) {
                                // Generate OTP and proceed
                                that.otp = that.getOTP();
                                MessageBox.information("To submit the data, kindly enter the OTP received " + that.otp, {
                                    onClose: () => that._enterOTP()
                                });
                            } else {
                                MessageBox.error(result.errorMessage);
                            }
                        },
                        error: function (oError) {
                            BusyIndicator.hide();
                            MessageBox.error("An error occurred while verifying the bank account.");
                        }
                    };

                    // Execute the function import
                    oDataModel.callFunction(sPath, mParameters);
                } 
                else
                {
                    BusyIndicator.hide();
                    if (mandat) {
                        MessageBox.information("Kindly fill all the required details");
                    } else if (!this.isGSTValid) {
                        MessageBox.error("Invalid GST Number");
                    }
                }

            },

            _enterOTP: function () {
                var that = this;
                var core = sap.ui.getCore();
                var data = this.createModel.getData();
                var requestData = this.getView().getModel("request").getData();
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
                                    var enterOtp = core.byId("submissionNote").getValue();
                                    if (enterOtp === this.otp) {
                                        BusyIndicator.show();
                                        data.Otp = enterOtp;
                                        var payloadStr = JSON.stringify(data);
                                        var sPath = `/odata/v4/catalog/VendorForm('${data.VendorId}')`;
                                        $.ajax({
                                            type: "PUT",
                                            contentType: "application/json",
                                            url: sPath,
                                            data: payloadStr,

                                            context: this,
                                            success: function (data, textStatus, jqXHR) {
                                                BusyIndicator.hide();
                                               
                                                    MessageBox.success("Form submitted successfully", {
                                                        onClose: () => {
                                                            this.changeStatus();
                                                            
                                                        }
                                                    });
                                            }.bind(this),
                                            error: function (jqXHR, textStatus, errorThrown) {
                                                BusyIndicator.hide();
                                                
                                            }
                                        });


                                        core.byId("submissionNote").setValue();
                                        this.oSubmitDialog.close();
                                    } else {
                                        core.byId("submissionNote").setValue();
                                        MessageBox.error("Incorrect OTP");
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
                //var key = oFileUploader.getCustomData()[0].getKey();
               // oFileUploader.removeAllHeaderParameters();
                oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                    name: "slug",
                    value: this.vendorId + "/" + oFileUploader.getValue()
                }));
                //oFileUploader.upload();

                oFileUploader.checkFileReadable().then(() => {
                    oFileUploader.upload();
                }, () => {
                    MessageBox.information("The file cannot be read. It may have changed.");
                });
            },
            
            onUploadComplete: function (evt) {
                if (evt.getParameters().status !== 201) {
                    MessageBox.error(JSON.parse(evt.getParameters().responseRaw).error.message.value);
                    BusyIndicator.show();
                } else {
                    MessageToast.show("File " + evt.getParameters().fileName + " Attached successfully");
                    BusyIndicator.hide();
                }
            },

            onFileSizeExceded: function (evt) {
                MessageBox.error("File size exceeds the range of 5MB");
                evt.getSource().setValueState("Error");
            },

            onAttachmentGet: function (evt) { // display attachments
                //var key = evt.getSource().getCustomData()[0].getKey();
                //sap.m.URLHelper.redirect(this.getView().getModel().sServiceUrl + "/VendorFormSet(Reqnr='" + this.id + "',PropertyName='" + key +
                  //  "')/$value", true);
                    BusyIndicator.show();
                    setTimeout(() => {
                        this.getView().getModel().read("/Attachments", {
                            filters: [new Filter("VendorId", "EQ", this.vendorId)],
                            success: (data) => {
                                //data.results.map(item => item.Url = this.getView().getModel().sServiceUrl + "/Attachments(VendorId='" + item.VendorId + "',ObjectId='" + item.ObjectId + "')/$value");
                                sap.m.URLHelper.redirect(this.getView().getModel().sServiceUrl + "/Attachments(VendorId='" + this.vendorId + "',ObjectId='" + item.ObjectId + "')/$value", true);
                               // sap.ui.getCore().byId("attachPopover").setModel(new JSONModel(data), "AttachModel");
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
                var otpgen = "2305602";
                return otpgen;
            },
            
            changeStatus: function(){
                var requestData = this.getView().getModel("request").getData();
                var stat = "";
                if (requestData.Status === "INITIATED"){
                    stat = "SBS";
                }else if(requestData.Status === "SBS"){
                    stat = "SBC";
                }else if(requestData.Status === "SBF"){
                    stat = "SBF";
                }               
                var payload = requestData;
                payload.Status = stat;
                var payloadStr = JSON.stringify(payload);
                var sPath = `/odata/v4/catalog/VenOnboard(Vendor='${requestData.Vendor}',VendorId=${requestData.VendorId})`;
                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    url: sPath,
                    data: payloadStr,
                    context: this,
                    success: function (data, textStatus, jqXHR) {
                        if (jqXHR.status === 200 || jqXHR.status === 204) {
                            console.log("Data upserted successfully.");
                           // window.location.reload();
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
