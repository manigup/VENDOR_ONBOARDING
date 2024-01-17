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

                this.productInfoTableModel = new JSONModel({
                    rows: [
                        { 'SrNo': 1 },
                        { 'SrNo': 2 },
                        { 'SrNo': 3 }
                    ]
                });
                this.getView().setModel(this.productInfoTableModel, "productInfoTable");


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

                this.hardcodedURL = "";
                if (window.location.href.includes("launchpad")) {
                    //  this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/da8bb600-97b5-4ae9-822d-e6aa134d8e1a.onboarding.spfiorisupplierform-0.0.1";
                    this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/ed7b03c3-9a0c-46b0-b0de-b5b00d211677.onboarding.spfiorisupplierform-0.0.1";
                }

                this.initializeCountries();

            },
            handleRouteMatched: function (oEvent) {
                if (oEvent.getParameter("name") !== "RouteView1") {
                    return;
                }

                this.id = jQuery.sap.getUriParameters().get("id");
                var requestData = this.getView().getModel("request").getData();
                var createdata = this.getView().getModel("create").getData();
                createdata.VendorId = this.id;
                createdata.Vendor = requestData.Vendor;
                createdata.RegistrationType = requestData.RegistrationType;
                if (requestData.VendorType === "DM") {
                    createdata.MsmeItilView = "MSME";
                    this.byId("msmeItil").setSelectedIndex(0);
                }
                if (requestData.VendorType === "DM") {
                    createdata.GstApplicable = "YES";
                }
                this.createModel.setData(createdata);
                this.createModel.refresh(true);
                //   this._setRadioButtons(createdata);
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
                        if (data.ISO9001Certification === "X") {
                            this.byId("ISO9001Certification").setSelected(true);
                        }
                        if (data.IATF16949Certification === "X") {
                            this.byId("IATF16949Certification").setSelected(true);
                        }
                        if (data.ISO14001Certification === "X") {
                            this.byId("ISO14001Certification").setSelected(true);
                        }
                        if (data.ISO45001Certification === "X") {
                            this.byId("ISO45001Certification").setSelected(true);
                        }
                        if (data.VDA63Certification === "X") {
                            this.byId("VDA63Certification").setSelected(true);
                        }

                        data.BeneficiaryName = requestData.VendorName;
                        this.createModel.setData(data);
                        this.createModel.refresh(true);
                        if (data.Country) {
                            this.countryHelpSelect().then(() => {
                                var sCountryKey = this.getView().byId("countryId").getSelectedKey();
                                return this.loadStates(sCountryKey, data.State_name, true);
                            }).then(() => {
                                if (data.City) {
                                    return this.loadCities(data.Country_code, data.State_name, data.City_name);
                                }
                            }).catch((error) => {
                                console.error("Error in loading states/cities:", error);
                            });
                        }
                        this._setRadioButtons(data);
                        BusyIndicator.hide();
                    }.bind(this),
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        console.log("Upsert failed: ", errorThrown);
                    }
                });
                this.fetchProductInfo();
                this._showRemainingTime();
            },
            fetchProductInfo: function () {
                var requestData = this.getView().getModel("request").getData();
                var vendorId = requestData.VendorId; // Store the VendorId for filtering

                this.getView().getModel().read("/ProductInfo", {
                    success: (oData) => {
                        var filteredData = oData.results.filter(function (item) {
                            return item.Vendor_VendorId === vendorId;
                        });

                        // Get the default rows from the model
                        var defaultRows = this.productInfoTableModel.getData().rows;

                        // Reset the rows to default before updating
                        this.productInfoTableModel.setData({ rows: defaultRows });

                        // Update the default rows with filtered data, if any
                        for (var i = 0; i < filteredData.length && i < defaultRows.length; i++) {
                            for (var key in filteredData[i]) {
                                if (Object.prototype.hasOwnProperty.call(filteredData[i], key)) {
                                    defaultRows[i][key] = filteredData[i][key];
                                }
                            }
                        }

                        this.productInfoTableModel.refresh(true);
                    },
                    error: (oError) => {
                        console.log("Failed to fetch ProductInfo: ", oError);
                    }
                });
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
                } else if (data.Type === "BOTH") {
                    this.byId("typeRbId").setSelectedIndex(2);
                }
                if (data.Companycode === "2000 SJ RUBBER INDUSTRIES LIMITED") {
                    this.byId("companycodeRbId").setSelectedIndex(1);
                } else if (data.Companycode === "3000 IAI INDUSTRIES LIMITED") {
                    this.byId("companycodeRbId").setSelectedIndex(2);
                } else if (data.Companycode === "4000 IMPERIAL MARTOR ENGINE TUBES PRIVATE LIMITED") {
                    this.byId("companycodeRbId").setSelectedIndex(3);
                }
                if (data.RegistrationType === "BOM Parts") {
                    this.byId("registrationtypeRbId").setSelectedIndex(1);
                } else if (data.RegistrationType === "Non BOM parts") {
                    this.byId("registrationtypeRbId").setSelectedIndex(2);
                }
                if (data.Msme === "NO") {
                    this.byId("msmeRbId").setSelectedIndex(1);
                }
                if (data.Union === "NO") {
                    this.byId("unionRbId").setSelectedIndex(1);
                }
                if (data.ProdDesign === "NO") {
                    this.byId("prodDesignRbId").setSelectedIndex(1);
                }
                if (data.SoftwareCapabilities === "NO") {
                    this.byId("softwareCapRbId").setSelectedIndex(1);
                } else if (data.SoftwareCapabilities === "N/A") {
                    this.byId("softwareCapRbId").setSelectedIndex(2);
                }
                if (data.BusinessContinuity === "NO") {
                    this.byId("businessContinuityRbId").setSelectedIndex(1);
                }
                if (data.LogisticCustomer === "NO") {
                    this.byId("logCustRbId").setSelectedIndex(1);
                }
                if (data.GstApplicable === "NO") {
                    this.byId("gstRbId").setSelectedIndex(1);
                }
                if (data.NatureOfIndustry === "SMALL") {
                    this.byId("natureOfIndustryRbId").setSelectedIndex(0);
                } else if (data.NatureOfIndustry === "MEDIUM") {
                    this.byId("natureOfIndustryRbId").setSelectedIndex(1);
                } else if (data.NatureOfIndustry === "HEAVY") {
                    this.byId("natureOfIndustryRbId").setSelectedIndex(2);
                }
                if (data.WorkingTowardsCertifications === "Yes") {
                    this.byId("workingTowardsCert").setSelectedIndex(0);
                } else if (data.WorkingTowardsCertifications === "No") {
                    this.byId("workingTowardsCert").setSelectedIndex(1);
                }
                if (data.CentralExciseDutyApplicable === "YES") {
                    this.byId("centralExciseDutyApplicableRbId").setSelectedIndex(0);
                } else if (data.CentralExciseDutyApplicable === "NO") {
                    this.byId("centralExciseDutyApplicableRbId").setSelectedIndex(1);
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
                        } else if (index === 2) {
                            data.Type = "BOTH";
                        } else {
                            data.Type = "MATERIAL";
                        }
                        break;
                    case "unionRbId":
                        if (index === 1) {
                            data.Union = "NO";
                        } else {
                            data.Union = "YES";
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
                    case "natureOfIndustryRbId":
                        if (index === 0) {
                            data.NatureOfIndustry = "SMALL";
                        } else if (index === 1) {
                            data.NatureOfIndustry = "MEDIUM";
                        } else {
                            data.NatureOfIndustry = "HEAVY";
                        }
                        break;
                    case "workingTowardsCert": // Make sure this matches the RadioButtonGroup id in your View.xml
                        if (index === 0) {
                            data.WorkingTowardsCertifications = "Yes";
                        } else {
                            data.WorkingTowardsCertifications = "No";
                        }
                        break;
                    case "centralExciseDutyApplicableRbId":
                        if (index === 0) {
                            this.createModel.setProperty("/CentralExciseDutyApplicable", "YES");
                        } else {
                            this.createModel.setProperty("/CentralExciseDutyApplicable", "NO");
                        }
                        break;
                    case "companycodeRbId":
                        if (index === 0) {
                            data.Companycode = "1000 IMPERIAL AUTO INDUSTRIES LIMITED";
                        } else if (index === 1) {
                            data.Companycode = "2000 SJ RUBBER INDUSTRIES LIMITED";
                        } else if (index === 2) {
                            data.Companycode = "3000 IAI INDUSTRIES LIMITED";
                        } else {
                            data.Companycode = "4000 IMPERIAL MARTOR ENGINE TUBES PRIVATE LIMITED";
                        }
                        break;
                    case "registrationtypeRbId":
                        if (index === 0) {
                            data.RegistrationType = "Customer Approved";
                        } else if (index === 1) {
                            data.RegistrationType = "BOM Parts";
                        } else {
                            data.RegistrationType = "Non BOM parts";
                        }
                        break;
                    case "captiveRbId":
                        if (index === 0) {
                            data.RegistrationType = "Yes";
                        } else {
                            data.RegistrationType = "No";
                        }
                        break;
                    case "prodDesignRbId":
                        if (index === 1) {
                            data.Union = "NO";
                        } else {
                            data.Union = "YES";
                        }
                        break;
                    case "softwareCapRbId":
                        if (index === 1) {
                            data.Union = "NO";
                        } else if (index === 2) {
                            data.Union = "N/A";
                        } else {
                            data.Union = "YES";
                        }
                        break;
                    case "businessContinuityRbId":
                        if (index === 1) {
                            data.Union = "NO";
                        } else {
                            data.Union = "YES";
                        }
                        break;
                    case "logCustRbId":
                        if (index === 1) {
                            data.Union = "NO";
                        } else {
                            data.Union = "YES";
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
                oView.byId("address2Id"), oView.byId("pincodeId")];

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

                //oView.byId("stateId")
                // oView.byId("constId")
                var aSelects = [oView.byId("countryId"),
                oView.byId("stateId"), oView.byId("cityId"),
                oView.byId("benAccTypeId"),
                oView.byId("suppliertypeId"),
                oView.byId("grouptypeId")];

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

            initializeCountries: function () {
                console.log("Country initialization")
                var oComboBox = this.getView().byId("countryId");
                if (!oComboBox.getModel("countries")) {
                    this.loadCountries();
                }
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
                                text: "{countries>code}"
                            })
                        });
                    },
                    error: function (oError) {
                        console.log("Error", oError);
                        //sap.m.MessageToast.show("Failed to load countries.");
                    }
                });
            },

            countryHelpSelect: function () {
                return new Promise((resolve, reject) => {
                    var oStateSelect = this.getView().byId("stateId");
                    var sCountryKey = this.getView().byId("countryId").getSelectedKey();
            
                    if (sCountryKey) {
                        oStateSelect.setEnabled(true);
                        this.loadStates(sCountryKey).then(resolve).catch(reject);
                    } else {
                        oStateSelect.setEnabled(false);
                        resolve();
                    }
                });
            },
            
            loadStates: function (sCountryKey, selectedState, isRefresh) {
                var that = this;
                return new Promise(function (resolve, reject) {
                    var oStateSelect = that.getView().byId("stateId");
                    var oDataModel = that.getOwnerComponent().getModel();
                    var sPath = "/States";

                    oDataModel.read(sPath, {
                        urlParameters: {
                            "country": sCountryKey
                        },
                        success: function (oData) {
                            var oJsonModel = new sap.ui.model.json.JSONModel();
                            oJsonModel.setData({ States: oData.results });

                            oStateSelect.setModel(oJsonModel, "states");
                            oStateSelect.bindItems({
                                path: "states>/States",
                                template: new sap.ui.core.Item({
                                    key: "{states>name}",
                                    text: "{states>name}"
                                })
                            });

                            if (isRefresh) {
                                setTimeout(() => {
                                    if (selectedState) {
                                        oStateSelect.setSelectedKey(selectedState);
                                    }
                                    resolve();
                                }, 1000);
                            } else {
                                if (selectedState) {
                                    oStateSelect.setSelectedKey(selectedState);
                                }
                                resolve();
                            }
                        },
                        error: function (oError) {
                            console.log("Error", oError);
                            reject(oError);
                        }
                    });
                });
            },

            handleStatePress: function () {
                var oStateSelect = this.getView().byId("stateId");
                var data = this.createModel.getData();
                if (oStateSelect.getSelectedKey()) {
                    var sCountryKey = this.getView().byId("countryId").getSelectedKey();
                    var sStateKey = oStateSelect.getSelectedKey();
                    if (sCountryKey === "India") {
                        if (sStateKey === "Haryana") {
                            data.Location = "Within State";
                        } else {
                            data.Location = "Outside State";
                        }
                    } else {
                        data.Location = "Outside Country";
                    }
                    this.loadCities(sCountryKey, sStateKey);
                } else {
                    MessageToast.show("Please select a state first.");
                }
                this.createModel.refresh(true);
            },

            loadCities: function (sCountryKey, sStateKey, selectedCity) {
                return new Promise((resolve, reject) => {
                    var oCitySelect = this.getView().byId("cityId");
                    var oDataModel = this.getOwnerComponent().getModel();
                    var sPath = "/City";

                    oDataModel.read(sPath, {
                        urlParameters: {
                            "country": sCountryKey,
                            "state": sStateKey
                        },
                        success: function (oData) {
                            var oJsonModel = new sap.ui.model.json.JSONModel();
                            oJsonModel.setData({ Cities: oData.results });

                            oCitySelect.setModel(oJsonModel, "cities");
                            oCitySelect.bindItems({
                                path: "cities>/Cities",
                                template: new sap.ui.core.Item({
                                    key: "{cities>name}",
                                    text: "{cities>name}"
                                })
                            });

                            if (selectedCity) {
                                oCitySelect.setSelectedKey(selectedCity);
                            }
                            resolve();
                        },
                        error: function (oError) {
                            console.log("Error", oError);
                            reject(oError);
                        }
                    });
                });
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

                // if ((data.VendorType === "DM" || data.VendorType === "IP")) {
                //     if (this.byId("quotfileUploader").getValue() || data.NewVendorQuotationName) {
                //         this.byId("quotfileUploader").setValueState("None");
                //     } else {
                //         bValidationError = true;
                //         this.byId("quotfileUploader").setValueState("Error");
                //     }
                // }

                // if ((data.VendorType === "DM" || data.VendorType === "IP")) {
                //     if (this.byId("cocFileUploader").getValue() || data.CocName) {
                //         this.byId("cocFileUploader").setValueState("None");
                //     } else {
                //         bValidationError = true;
                //         this.byId("cocFileUploader").setValueState("Error");
                //     }
                // }

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
                // if ((data.VendorType === "DM" || data.VendorType === "IP")) {
                //     if (this.byId("quotfileUploader").getValue() || data.CancelledCheque) {
                //         this.byId("quotfileUploader").setValueState("None");
                //     } else {
                //         bValidationError = true;
                //         this.byId("quotfileUploader").setValueState("Error");
                //     }
                //     if (this.byId("cocFileUploader").getValue() || data.CancelledCheque) {
                //         this.byId("cocFileUploader").setValueState("None");
                //     } else {
                //         bValidationError = true;
                //         this.byId("cocFileUploader").setValueState("Error");
                //     }
                // }
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
                this.draft = true;
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
                        this.updateProductInfo(this.vendorId);
                        BusyIndicator.hide();

                        MessageBox.success("Form data saved successfully", {
                            onClose: () => {
                                this.changeStatus();
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
                    var createData = this.createModel.getData();
                    var data = this.getView().getModel("request").getData();
                    var oDataModel = this.getView().getModel();

                    that.otp = that.getOTP();
                    that.otpTime = new Date().getTime();
                    var mParameters = {
                        method: "GET",
                        urlParameters: {
                            vendorName: data.VendorName,
                            subject: "OTP",
                            content: `||OTP for submit vendor on-boarding form is ${that.otp}. | Do not share this with anyone. ImperialAuto will never telephone you to verify it.`,
                            toAddress: data.VendorMail,
                            ccAddress: ""
                        },
                        success: function (oData, response) {
                            that._enterOTP()
                        },
                        error: function (oError) {
                            MessageBox.error("Failed to send OTP. Please try again.");
                        }
                    };

                    // Call the sendEmail function
                    oDataModel.callFunction("/sendEmail", mParameters);

                }
                else {
                    BusyIndicator.hide();
                    if (mandat) {
                        MessageBox.information("Kindly fill all the required details");
                    }
                }

            },

        sendEmailNotification: function (venaddress, vendorName, vendorMail, moddate) {
                return new Promise((resolve, reject) => {
                    let emailBody;
                    if (venaddress === "Initiator") {
                        emailBody = `||Form is submitted by the supplier ${vendorName} on ${moddate}. Approval pending at Quality.`;
                    } else {
                        emailBody = `||Form is submitted by the supplier ${vendorName} on ${moddate}. Approval pending at Quality. Kindly submit and approve using below link.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/site?siteId=3c32de29-bdc6-438e-95c3-285f3d2e74da&sap-language=en#onboarding-manage?sap-ui-app-id-hint=saas_approuter_sp.fiori.onboarding&/">CLICK HERE</a>`;
                    }
                    var oModel = this.getView().getModel();
                    var mParameters = {
                        method: "GET",
                        urlParameters: {
                            vendorName: venaddress,
                            subject: "Supplier Form",
                            content: emailBody,
                            toAddress: vendorMail,
                            ccAddress: ""
                        },
                        success: function (oData, response) {
                            console.log("Email sent successfully.");
                            resolve(oData);
                        },
                        error: function (oError) {
                            console.log("Failed to send email.");
                            reject(oError);
                        }
                    };
                    oModel.callFunction("/sendEmail", mParameters)
                });
            },


            getQualityEmails: async function () {
                var oModel = this.getView().getModel();
                return new Promise((resolve, reject) => {
                    oModel.read("/AccessInfo", {
                        filters: [new sap.ui.model.Filter("Access", sap.ui.model.FilterOperator.EQ, "Quality")],
                        success: function (oData) {
                            var emails = oData.results.map(item => item.email);
                            resolve(emails);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
            },
            getPurchaseEmails: async function () {
                var oModel = this.getView().getModel();
                return new Promise((resolve, reject) => {
                    oModel.read("/AccessInfo", {
                        filters: [new sap.ui.model.Filter("Access", sap.ui.model.FilterOperator.EQ, "Purchase")],
                        success: function (oData) {
                            var emails = oData.results.map(item => item.email);
                            resolve(emails);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
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
                data.vendorId = requestData.vendorId;
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
                                press: async function () {
                                    var currentTime = new Date().getTime();
                                    var timeDifference = currentTime - this.otpTime;
                                    var enterOtp = core.byId("submissionNote").getValue();
            
                                    if (timeDifference <= 300000 && enterOtp === this.otp) {
                                        BusyIndicator.show();
                                        data.Otp = enterOtp;
                                        if(data.RegistrationType === "Non BOM parts"){
                                            this.name = "Purchase Team";
                                        } else {
                                            this.name = "Quality Team";  
                                        }
                                        this.initiateName = "Initiator";
                                        var payloadStr = JSON.stringify(data);
                                        var sPath = this.hardcodedURL + `/v2/odata/v4/catalog/VendorForm('${data.VendorId}')`;
            
                                        $.ajax({
                                            type: "PUT",
                                            contentType: "application/json",
                                            url: sPath,
                                            data: payloadStr,
                                            context: this,
                                            success: async function (data, textStatus, jqXHR) {
                                                this.updateProductInfo(data.d.VendorId);
                                                var moddate = parseInt(data.d.modifiedAt.match(/\/Date\((\d+)\+\d+\)\//)[1]);
                                                var moddatestr = new Date(moddate);
                                                var suppmodified = moddatestr.toDateString();
            
                                                // Send email to initiatedBy
                                                await this.sendEmailNotification(this.initiateName, data.d.VendorName, requestData.initiatedBy, suppmodified);
            
                                                // Fetch and send emails to 'Quality' or 'Purchase' 
                                                if(data.d.RegistrationType === "Non BOM parts"){
                                                    try {
                                                        var purchaseEmails = await this.getPurchaseEmails();
                                                        for (const email of purchaseEmails) {
                                                            await this.sendEmailNotification(this.name, data.d.VendorName, email, suppmodified);
                                                        }
                                                    } catch (error) {
                                                        console.error("Error fetching Purchase emails: ", error);
                                                    }
                                                } else {
                                                    try {
                                                        var qualityEmails = await this.getQualityEmails();
                                                        for (const email of qualityEmails) {
                                                            try {
                                                                await this.sendEmailNotification(this.name, data.d.VendorName, email, suppmodified);
                                                            } catch (emailError) {
                                                                console.error(`Failed to send email to ${email}: `, emailError);
                                                            }
                                                        }
                                                    } catch (error) {
                                                        console.error("Error fetching Quality emails: ", error);
                                                    }
                                                }
            
                                                // Hide BusyIndicator after all emails are sent
                                                    //BusyIndicator.hide();
                                                 
            
                                                MessageBox.success("Form submitted successfully", {
                                                    onClose: () => {
                                                        this.changeStatus();
                                                    }
                                                });
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
/*
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
                                        if(data.RegistrationType === "Non BOM parts"){
                                        this.name = "Purchase Team";
                                        }else{
                                            this.name = "Quality Team";  
                                        }
                                        this.initiateName = "Initiator";
                                        var payloadStr = JSON.stringify(data);
                                        var sPath = this.hardcodedURL + `/v2/odata/v4/catalog/VendorForm('${data.VendorId}')`;
                                        $.ajax({
                                            type: "PUT",
                                            contentType: "application/json",
                                            url: sPath,
                                            data: payloadStr,
                                            context: this,
                                            success: async function (data, textStatus, jqXHR) {
                                                this.updateProductInfo(data.d.VendorId)
                                                //BusyIndicator.hide();
                                                if (jqXHR.status === 200 || jqXHR.status === 204) {
                                                    MessageBox.success("Form submitted successfully", {
                                                        onClose: () => {
                                                            this.changeStatus();
                                                        }
                                                    });
                                                    var moddate = parseInt(data.d.modifiedAt.match(/\/Date\((\d+)\+\d+\)\//)[1]);
                                                    var moddatestr = new Date(moddate);
                                                    var suppmodified = moddatestr.toDateString();
                                                    // Send email to initiatedBy
                                                    await this.sendEmailNotification(this.initiateName, data.d.VendorName, requestData.initiatedBy, suppmodified);
                                                    // Fetch and send emails to 'Quality' 
                                                    if(data.d.RegistrationType === "Non BOM parts"){
                                                    try {
                                                        var purchaseEmails = await this.getPurchaseEmails();
                                                        for (const email of purchaseEmails) {
                                                            await this.sendEmailNotification(this.name, data.d.VendorName, email, suppmodified);
                                                        }
                                                    } catch (error) {
                                                        console.error("Error fetching Purchase emails: ", error);
                                                    }
                                                }else{
                                                    try {
                                                        var qualityEmails = await this.getQualityEmails();
                                                        for (const email of qualityEmails) {
                                                            try {
                                                                await this.sendEmailNotification(this.name, data.d.VendorName, email, suppmodified);
                                                            } catch (emailError) {
                                                                console.error(`Failed to send email to ${email}: `, emailError);
                                                            }
                                                        }
                                                    } catch (error) {
                                                        console.error("Error fetching Quality emails: ", error);
                                                    }
                                                }
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
*/
            updateProductInfo: function (vendorId) {
                var productInfoData = this.productInfoTableModel.getData().rows;

                for (let i = 0; i < productInfoData.length; i++) {
                    let row = productInfoData[i];
                    let sPathProduct = this.hardcodedURL + `/v2/odata/v4/catalog/ProductInfo(Vendor_VendorId='${vendorId}',SrNo=${row.SrNo})`;
                    let productPayloadStr = JSON.stringify(row);

                    $.ajax({
                        type: "PUT",
                        contentType: "application/json",
                        url: sPathProduct,
                        data: productPayloadStr,
                        context: this,
                        success: (data, textStatus, jqXHR) => {
                            BusyIndicator.hide();
                        },
                        error: (jqXHR, textStatus, errorThrown) => {
                            BusyIndicator.hide();
                        }
                    });
                }
            },

            onFileUploaderChange: function (evt) {
                var oFileUploader = evt.getSource();
                oFileUploader.setUploadUrl(this.getView().getModel().sServiceUrl + "/Attachments");
                // BusyIndicator.show();
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
                // BusyIndicator.hide();
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

            onCertificationChange: function (evt) {
                var selected = evt.getParameter("selected");
                var id = evt.getSource().getId();
                var idSplit = id.split("--");
                var fieldName = idSplit[idSplit.length - 1];

                if (selected) {
                    this.createModel.setProperty("/" + fieldName, "X");
                } else {
                    this.createModel.setProperty("/" + fieldName, "");
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
                var level = "";
                var pending = "";
                if (this.draft) {
                    if (requestData.Status === "INITIATED" || requestData.Status === "SAD") {
                        this.draft = false;
                        stat = "SAD";
                    }
                } else {
                    if (requestData.Status === "INITIATED" || requestData.Status === "SAD" || requestData.Status === "SRE-ROUTE" || requestData.Status === "RBQ") {
                        if (requestData.RegistrationType === "Non BOM parts") {
                            stat = "SBS";
                            level = "1";
                            pending = "Purchase";
                        } else {
                            stat = "SBS";
                            level = "1";
                            pending = "Quality";
                        }
                    }
                }
                var payload = requestData;
                payload.Status = stat;
                payload.VenLevel = level;
                payload.VenApprovalPending = pending;
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
