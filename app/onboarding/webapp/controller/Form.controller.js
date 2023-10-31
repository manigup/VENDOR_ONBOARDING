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
    "sap/m/Label",
    "sap/m/Text",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, BusyIndicator, JSONModel, Dialog, DialogType, Button, ButtonType, Input, Label, Text, Filter, FilterOperator, SimpleType, ValidateException, MessageToast) {
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
                this.initializeCountries();
                
            },
            handleRouteMatched: function (oEvent) {
                this.initializeAPIS();
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
                            data.PartyClassification = "Sup";
                        //     data.TaxNumCat = "IN3";
                        // data.ChkDoubleInv = "X";
                        // data.GrBasedInv = "X";
                        // data.SerBasedInv = "X";
                            if (vendorStatus === "SBS"  && requestData.purchase) {
                                requestData.edit = false;
                            }else if (vendorStatus === "ABP" && requestData.quality) {
                                requestData.edit = false;
                            }else if (vendorStatus === "ABQ" && requestData.coo) {
                                requestData.edit = false;
                            } 
                            else if (vendorStatus === "ABC" && requestData.finance) {
                                requestData.edit = false;
                            }else if ((vendorStatus === "RBQ" || vendorStatus === "RBC" || vendorStatus === "RBF") && requestData.purchase) {
                                requestData.edit = false;
                                requestData.route = true;
                            }
                            else {
                                requestData.edit = ""
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
                            this.getView().getModel("request").refresh(true);
                            this.createModel.setData(data);
                            this.createModel.refresh(true);
                            // if (data.WitholdingTax) {
                            //     this.withHoldingTaxSelect();
                            // }
                            // if (data.Bukrs) {
                            //     this.compCodeSelect();
                            // }
                            this._setRadioButtons(data);
                            this._setCheckBoxes(data);
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

            initializeAPIS: function(){
                var unitCode = 'P01'
                //var unitCode = sessionStorage.getItem("unitCode");
                
                this.GetSupplierAccountCodeList(unitCode)
                    .then(function() {
                        return this.GetDocumentList(unitCode);
                    }.bind(this))
                    .then(function() {
                        return this.GetSupplierTransportersList(unitCode);
                    }.bind(this))
                    .then(function() {
                        return this.GetSupplierLocationList(unitCode);
                    }.bind(this))
                    .catch(function(error) {
                        MessageBox.error("Failed to fetch data: " + error.message);
                    });
            },

            GetSupplierAccountCodeList: function (unitCode) {
                var oModel = this.getView().getModel();
                return new Promise(function(resolve, reject) {
                    oModel.callFunction("/GetSupplierAccountCodeList", {
                        method: "GET",
                        urlParameters: {
                            unitCode: unitCode
                        },
                        success: function (oData, response) {
                            var accountData = oData.results;
                            var oAccountModel = new sap.ui.model.json.JSONModel();
                            oAccountModel.setData({items: accountData});
                            this.getView().setModel(oAccountModel, "account");
                            resolve();
                        }.bind(this),
                        error: function (oError) {
                            reject(new Error("Failed to fetch account data."));
                        }
                    });
                }.bind(this));
            },
            
            onAccountCodeChange: function (oEvent) {
                var oComboBox = oEvent.getSource(); 
                var oSelectedItem = oComboBox.getSelectedItem(); 
                if (oSelectedItem) {
                    var sSelectedKey = oSelectedItem.getKey(); 
                    var oAccountModel = this.getView().getModel("account");
                    var aItems = oAccountModel.getProperty("/items");
                    var oSelectedItemData = aItems.find(function (item) {
                        return item.AcctCode === sSelectedKey; 
                    });
                    if (oSelectedItemData) {
                        var sAccountDesc = oSelectedItemData.AcctName;  
                        var oCreateModel = this.getView().getModel("create");  
                        oCreateModel.setProperty("/AccountDesc", sAccountDesc); 
                    }
                }
            },

            GetDocumentList: function (unitCode) {
                var oModel = this.getView().getModel();
                return new Promise(function(resolve, reject) {
                    oModel.callFunction("/GetDocumentList", {
                        method: "GET",
                        urlParameters: {
                            unitCode: unitCode
                        },
                        success: function (oData, response) {
                            var docData = oData.results;
                            var oDocModel = new sap.ui.model.json.JSONModel();
                            oDocModel.setData({items: docData});
                            this.getView().setModel(oDocModel, "doc");
                            resolve();
                        }.bind(this),
                        error: function (oError) {
                            reject(new Error("Failed to fetch document data."));
                        }
                    });
                }.bind(this));
            },

            doccodeHelpSelect: function (oEvent) {
                var oComboBox = oEvent.getSource();
                var oSelectedItem = oComboBox.getSelectedItem();
                if (oSelectedItem) {
                    var sSelectedKey = oSelectedItem.getKey();
                    var oDocModel = this.getView().getModel("doc");
                    var aItems = oDocModel.getProperty("/items");
                    var oSelectedItemData = aItems.find(function (item) {
                        return item.DocumentsCode === sSelectedKey;
                    });
                    if (oSelectedItemData) {
                        var sDocDescription = oSelectedItemData.DocumentsName;
                        var oCreateModel = this.getView().getModel("create");
                        oCreateModel.setProperty("/DocDescription", sDocDescription);
                    }
                }
            },

            GetSupplierTransportersList: function (unitCode) {
                var oModel = this.getView().getModel();
                return new Promise(function(resolve, reject) {
                    oModel.callFunction("/GetSupplierTransportersList", {
                        method: "GET",
                        urlParameters: {
                            unitCode: unitCode
                        },
                        success: function (oData, response) {
                            var transporterData = oData.results;
                            var oTransporterModel = new sap.ui.model.json.JSONModel();
                            oTransporterModel.setData({items: transporterData});
                            this.getView().setModel(oTransporterModel, "transporters");
                            resolve();
                        }.bind(this),
                        error: function (oError) {
                            reject(new Error("Failed to fetch transporter data."));
                        }
                    });
                }.bind(this));
            },

            GetSupplierLocationList: function (unitCode) {
                var oModel = this.getView().getModel();
                return new Promise(function(resolve, reject) {
                    oModel.callFunction("/GetSupplierLocationList", {
                        method: "GET",
                        urlParameters: {
                            unitCode: unitCode
                        },
                        success: function (oData, response) {
                            var locationData = oData.results;
                            var oLocationModel = new sap.ui.model.json.JSONModel();
                            oLocationModel.setData({items: locationData});
                            this.getView().setModel(oLocationModel, "location");
                            resolve();
                        }.bind(this),
                        error: function (oError) {
                            reject(new Error("Failed to fetch location data."));
                        }
                    });
                }.bind(this));
            },
        
            _setCheckBoxes: function (data) {
                // if (data.ChkDoubleInv === "X") {
                //     this.getView().byId("chkInvId").setSelected(true);
                // }
                // if (data.ClrWthCust === "X") {
                //     this.getView().byId("clrCustId").setSelected(true);
                // }
                // if (data.SubWitholdingTax === "X") {
                //     this.getView().byId("withTaxId").setSelected(true);
                // }
                // if (data.GrBasedInv === "X") {
                //     this.getView().byId("grbasedId").setSelected(true);
                // }
                // if (data.SerBasedInv === "X") {
                //     this.getView().byId("srvbasedId").setSelected(true);
                // }
                if (data.Composite === "1") {
                    this.getView().byId("compositeid").setSelected(true);
                }
                if (data.GstRegistered === "1") {
                    this.getView().byId("gstRbId").setSelected(true);
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

            onNavBack: function () {
                this.router.navTo("list");
            },

            onVenNameChange: function (oEvent) { //When vendor name is selected auto populate Beneficiary Name
                var data = this.createModel.getData();
                data.BeneficiaryName = oEvent.getSource().getValue();
                this.createModel.refresh(true);
            },
            onAddressCodChange: function (oEvent) {
               var addcode = oEvent.getSource().getValue();
               var addresscodedata = JSON.parse(sessionStorage.getItem("CodeDetails"));
               this.isunitaddressexists = addresscodedata.find(item => item.AddressCode === addcode) ? true : false;
               sessionStorage.setItem("isunitaddressexists", this.isunitaddressexists);
            },
            onCalcTaxPress: function (oEvent) {
                var data = this.createModel.getData();
                var finalTax = "";
                var tax = "";
                var HdnTrnCode = "ADDP";
                if(data.Location === "Within State" && this.isunitaddressexists === false){
                    if(data.STRatePerc >= "0" && data.STRatePerc <= "9" && data.STRatePerc.length === "1"){
                         tax = "0" + data.STRatePerc;
                         finalTax = "LST" + tax;
                    }else if(data.STRatePerc >= "10" && data.STRatePerc <= "99" && data.STRatePerc.length === "2"){
                        tax = data.STRatePerc;
                        finalTax = "LST" + tax;
                    }else{
                    tax = data.STRatePerc;
                    finalTax = "LST" + tax;
                    }
                }else if(data.Location === "Outside State" && this.isunitaddressexists === false){
                    if(data.STRatePerc >= "0" && data.STRatePerc <= "9" && data.STRatePerc.length === "1"){
                        tax = "0" + data.STRatePerc;
                        finalTax = "CST" + tax;
                   }else if(data.STRatePerc >= "10" && data.STRatePerc <= "99" && data.STRatePerc.length === "2"){
                       tax = data.STRatePerc;
                       finalTax = "CST" + tax;
                   }else{
                   tax = data.STRatePerc;
                   finalTax = "CST" + tax;
                   }
                }else if((data.Location === "Within State" || data.Location === "Outside State") && this.isunitaddressexists){
                    if(data.STRatePerc >= "0" && data.STRatePerc <= "9" && data.STRatePerc.length === "1"){
                        tax = "0" + data.STRatePerc;
                        finalTax = "STB" + tax;
                   }else{
                   tax = data.STRatePerc;
                   finalTax = "STB" + tax;
                   }
                }else if(data.Location === "Outside Country" && HdnTrnCode === "ADDP"){
                    if(data.STRatePerc >= "0" && data.STRatePerc <= "9" && data.STRatePerc.length === "1"){
                        tax = "0" + data.STRatePerc;
                        finalTax = "IMP" + tax;
                   }else if(data.STRatePerc >= "10" && data.STRatePerc <= "99" && data.STRatePerc.length === "2"){
                       tax = data.STRatePerc;
                       finalTax = "IMP" + tax;
                   }else{
                   tax = data.STRatePerc;
                   finalTax = "IMP" + tax;
                   }
                }
                data.Tax = finalTax;
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
                    case "registrationtypeRbId":
                        if (index === 0) {
                            data.RegistrationType = "Customer Approved / Non BOM";
                        } else {
                            data.RegistrationType = "BOM parts";
                        }
                        break;
                    case "captiveRbId":
                        if (index === 0) {
                            data.RegistrationType = "Yes";
                        } else {
                            data.RegistrationType = "No";
                        }
                        break;
                }
                this.createModel.refresh(true);
            },
            onCheckSelect: function (oEvent) {
                var data = this.createModel.getData();
                var name = oEvent.getSource().getName();
    
                if (oEvent.getParameter("selected")) {
                    switch (name) {
                        case "doubleInv":
                            data.ChkDoubleInv = "X";
                            break;
                        case "clearCustomer":
                            data.ClrWthCust = "X";
                            break;
                        case "withTax":
                            data.SubWitholdingTax = "X";
                            break;
                        case "grbased":
                            data.GrBasedInv = "X";
                            break;
                        case "srvbased":
                            data.SerBasedInv = "X";
                            break;
                    }
                } else {
                    switch (name) {
                        case "doubleInv":
                            data.ChkDoubleInv = "";
                            break;
                        case "clearCustomer":
                            data.ClrWthCust = "";
                            break;
                        case "withTax":
                            data.SubWitholdingTax = "";
                            break;
                        case "grbased":
                            data.GrBasedInv = "";
                            break;
                        case "srvbased":
                            data.SerBasedInv = "";
                            break;
                    }
                }
    
                this.createModel.refresh(true);
            },
            _mandatCheck: async function () {

                var data = this.createModel.getData();
                var requestData = this.getView().getModel("request").getData();

                var oView = this.getView(),
                    bValidationError = false;
                var aInputs = [oView.byId("addcodeId"),oView.byId("venNameId"),oView.byId("address1Id"), 
                oView.byId("accdescId"),
                oView.byId("mobileId"), oView.byId("purposeId"),
                oView.byId("accNoId"), oView.byId("bankNameId"), oView.byId("ifscId"),
                oView.byId("branchNameId"), oView.byId("benNameId"), oView.byId("benLocId"),
                oView.byId("address2Id"),oView.byId("contactPersonId"), oView.byId("contactPersonMobileId"),
                oView.byId("pincodeId"),  oView.byId("panId"),
                 oView.byId("stRateId"), oView.byId("excisedutyId"), 
                 oView.byId("mrpId"), oView.byId("distId"),
                 oView.byId("contactPersonnameId"), oView.byId("deptId"),oView.byId("desigId"),
                 oView.byId("contphoneId"), oView.byId("contmobileId"),
                 oView.byId("docdescId")
            ];

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
                var aSelects = [ oView.byId("countryId"),
                oView.byId("stateId"),oView.byId("cityId"),
                oView.byId("accountcodeId"),oView.byId("doccodeId"),
                oView.byId("benAccTypeId"),
                oView.byId("suppliertypeId") ];

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
                                text: "{countries>code}"
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
                var oStateSelect = this.getView().byId("stateId");
                var sCountryKey = this.getView().byId("countryId").getSelectedKey();
                
                if (sCountryKey) {
                    oStateSelect.setEnabled(true);
                    this.loadStates(sCountryKey);
                } else {
                    oStateSelect.setEnabled(false);
                }
            },

            loadStates: function (sCountryKey) {
                var oStateSelect = this.getView().byId("stateId");
                var oDataModel = this.getOwnerComponent().getModel();
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
                    },
                    error: function (oError) {
                        console.log("Error", oError);
                        sap.m.MessageToast.show("Failed to load states.");
                    }
                });
            },

            handleStatePress: function () {
                var oStateSelect = this.getView().byId("stateId");
                var data = this.createModel.getData();
                if (oStateSelect.getSelectedKey()) {
                    var sCountryKey = this.getView().byId("countryId").getSelectedKey();
                    var sStateKey = oStateSelect.getSelectedKey();
                    if(sCountryKey === "India"){
                        if(sStateKey === "Haryana"){
                            data.Location = "Within State";
                        }else{
                            data.Location = "Outside State";
                        }
                    }else{
                        data.Location = "Outside Country";
                    }
                    this.loadCities(sCountryKey, sStateKey);
                } else {
                    MessageToast.show("Please select a state first.");
                }
                this.createModel.refresh(true);
            },

            loadCities: function (sCountryKey, sStateKey) {
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
                    },
                    error: function (oError) {
                        console.log("Error", oError);
                        sap.m.MessageToast.show("Failed to load cities.");
                    }
                });
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

            compCodeSelect: function (oEvent) {
                var key = this.getView().byId("compCodeId").getSelectedKey();
                this.getView().byId("houseBankId").getBinding("items").filter([new Filter({
                    path: "Bukrs",
                    operator: FilterOperator.EQ,
                    value1: key
                })]);
            },
    
            withHoldingTaxSelect: function (oEvent) {
                var data = this.createModel.getData();
                var key = this.getView().byId("taxTypeId").getSelectedKey();
    
                this.getView().byId("recTypeId").getBinding("items").filter([new Filter({
                    path: "Country",
                    operator: FilterOperator.EQ,
                    value1: data.Country
                }),
                new Filter({
                    path: "WitholdingTax",
                    operator: FilterOperator.EQ,
                    value1: key
                })]);
    
                this.getView().byId("taxCodeId").getBinding("items").filter([new Filter({
                    path: "Country",
                    operator: FilterOperator.EQ,
                    value1: data.Country
                }),
                new Filter({
                    path: "WitholdingTax",
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
                var requestData = this.getView().getModel("request").getData();
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
                if (data.RegistrationType === "BOM parts" && requestData.quality === true) {
                    if (this.byId("riskFileUploader").getValue() || data.RiskAssessment) {
                        this.byId("riskFileUploader").setValueState("None");
                    } else {
                        bValidationError = true;
                        this.byId("riskFileUploader").setValueState("Error");
                    }
                    if (this.byId("systemAuditCheckFileUploader").getValue() || data.SystemAuditCheck) {
                        this.byId("systemAuditCheckFileUploader").setValueState("None");
                    } else {
                        bValidationError = true;
                        this.byId("systemAuditCheckFileUploader").setValueState("Error");
                    }
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

            onCompositeChange: function (evt) {
                if (evt.getParameter("selected")) {
                    this.createModel.setProperty("/Composite", "1");
                } else {
                    this.createModel.setProperty("/Composite", "0");
                }
                this.createModel.refresh(true);
            },
            onGSTChange: function (evt) {
                if (evt.getParameter("selected")) {
                    this.createModel.setProperty("/GstRegistered", "1");
                } else {
                    this.createModel.setProperty("/GstRegistered", "0");
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
                        payload.AddressCode = vendata[i].AddressCode;
                        break;
                    }
                }
                var stat = "";
                var level = "";
                var pending = "";
                var appr = "0";
                if (venStatus === "SBS" || venStatus === "RBF") {
                    stat = "SBP";
                    appr = "1"
                    level = "1";
                    pending = "Purchase Head";
                    this.msg = "Form submitted successfully by Purchase Head";
                } else if (venStatus === "ABP") {
                    stat = "SBQ";
                    appr = "1"
                    level = "2";
                    pending = "Quality";
                    this.msg = "Form submitted successfully by Quality";
                }else if (venStatus === "ABQ") {
                    stat = "SBC";
                    appr = "1"
                    level = "3";
                    pending = "COO";
                    this.msg = "Form submitted successfully by COO";
                }else if (venStatus === "ABC") {
                    stat = "SBF";
                    appr = "1"
                    level = "4";
                    pending = "Finance";
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
                        payload.AddressCode = vendata[i].AddressCode;
                        break;
                    }
                }
                var stat = "";
                var level = "";
                var pending = "";
                var appr = "0";
                if (venStatus === "RBQ" || venStatus === "RBC" || venStatus === "RBF") {
                    stat = "SRE-ROUTE";
                }
                payload.Status = stat;
                payload.VenLevel = level;
                payload.VenApprovalPending = pending;
                payload.VenApprove = appr;
                this.VendorName = payload.VendorName;
                this.VendorMail = payload.VendorMail;
                this.VenValidTo = payload.VenValidTo;
                this.getView().getModel().update("/VenOnboard(Vendor='" + payload.Vendor + "',VendorId=" + this.id + ")", payload, {
                    success: () => {

                        MessageBox.success("Form re-routed successfully to supplier", {
                            onClose: () => formatter.onNavBack()
                        });
                        this.sendEmailNotification(this.VendorName, this.id, this.VendorMail, this.VenValidTo);
                    },
                    error: (error) => {
                        BusyIndicator.hide();
                        console.log(error);
                    }
                });
            },
            sendEmailNotification: function (vendorName, vendorId, vendorMail, validTo) {
                let emailBody = `||Please find the link below for Vendor Assessment Form. Kindly log-in with the link to fill the form.<br><br>Form is valid till ${validTo}. Request you to fill the form and submit on time.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/da8bb600-97b5-4ae9-822d-e6aa134d8e1a.onboarding.spfiorisupplierform-0.0.1/index.html?id=${vendorId}">CLICK HERE</a>`;
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
