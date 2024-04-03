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

                // this.productInfoTableModel = new JSONModel({
                //     rows: [
                //         { 'SrNo': 1 },
                //         { 'SrNo': 2 },
                //         { 'SrNo': 3 }
                //     ]
                // });
                // this.getView().setModel(this.productInfoTableModel, "productInfoTable");

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
                // if (window.location.href.includes("launchpad")) {
                //    // this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/da8bb600-97b5-4ae9-822d-e6aa134d8e1a.onboarding.spfiorionboarding-0.0.1";
                //     this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/ed7b03c3-9a0c-46b0-b0de-b5b00d211677.onboarding.spfiorionboarding-0.0.1";
                // }
                if (window.location.href.includes("site")) {
                    this.hardcodedURL = jQuery.sap.getModulePath("sp.fiori.onboarding");
                }

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
                        //var vendorrelated = vendordata[i].RelatedPart;
                        var vendorregtype = vendordata[i].RegistrationType;
                        break;
                    }
                }

                BusyIndicator.show();
                setTimeout(() => {
                    this.getView().getModel().read("/VendorForm(VendorId='" + this.id + "')", {
                        success: (data) => {
                            //data.PartyClassification = "Sup";
                            this.SupplierType = data.SupplierType;
                            //     data.TaxNumCat = "IN3";
                            // data.ChkDoubleInv = "X";
                            // data.GrBasedInv = "X";
                            // data.SerBasedInv = "X";
                            // if (vendorrelated === "No") {
                            if (vendorregtype === "Non BOM parts") {
                                if (data.SupplierType === "Temporary" || data.SupplierType === "One Time") {
                                    if (vendorStatus === "SBS" && requestData.purchase) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABP" && requestData.finance) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "RBF" && requestData.purchase) {
                                        requestData.edit = false;
                                        requestData.route = true;
                                    }
                                    else {
                                        requestData.edit = ""
                                    }
                                } else {
                                    if (vendorStatus === "SBS" && requestData.purchase) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABP" && requestData.coo) {
                                        requestData.edit = false;
                                    }
                                    else if (vendorStatus === "ABC" && requestData.finance) {
                                        requestData.edit = false;
                                    } else if ((vendorStatus === "RBC" || vendorStatus === "RBF") && requestData.purchase) {
                                        requestData.edit = false;
                                        requestData.route = true;
                                    }
                                    else {
                                        requestData.edit = ""
                                    }
                                }
                            } else if (vendorregtype === "Customer Driven (Domestic)") {
                                if (data.SupplierType === "Temporary" || data.SupplierType === "One Time") {
                                    if (vendorStatus === "SBS" && requestData.purchase) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABP" && requestData.finance) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "RBF" && requestData.purchase) {
                                        requestData.edit = false;
                                        requestData.route = true;
                                    }
                                    else {
                                        requestData.edit = ""
                                    }
                                } else {
                                    if (vendorStatus === "SBS" && requestData.purchase) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABP" && requestData.marketingdom) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABE" && requestData.quality) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABQ" && requestData.coo) {
                                        requestData.edit = false;
                                    }
                                    else if (vendorStatus === "ABC" && requestData.finance) {
                                        requestData.edit = false;
                                    } else if ((vendorStatus === "RBE" || vendorStatus === "RBQ" || vendorStatus === "RBC" || vendorStatus === "RBF") && requestData.purchase) {
                                        requestData.edit = false;
                                        requestData.route = true;
                                    }
                                    else {
                                        requestData.edit = ""
                                    }
                                }
                            } else if (vendorregtype === "Customer Driven (Export)") {
                                if (data.SupplierType === "Temporary" || data.SupplierType === "One Time") {
                                    if (vendorStatus === "SBS" && requestData.purchase) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABP" && requestData.finance) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "RBF" && requestData.purchase) {
                                        requestData.edit = false;
                                        requestData.route = true;
                                    }
                                    else {
                                        requestData.edit = ""
                                    }
                                } else {
                                    if (vendorStatus === "SBS" && requestData.purchase) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABP" && requestData.marketingexp) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABE" && requestData.quality) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABQ" && requestData.coo) {
                                        requestData.edit = false;
                                    }
                                    else if (vendorStatus === "ABC" && requestData.finance) {
                                        requestData.edit = false;
                                    } else if ((vendorStatus === "RBE" || vendorStatus === "RBQ" || vendorStatus === "RBC" || vendorStatus === "RBF") && requestData.purchase) {
                                        requestData.edit = false;
                                        requestData.route = true;
                                    }
                                    else {
                                        requestData.edit = ""
                                    }
                                }
                            } else {
                                if (data.SupplierType === "Temporary" || data.SupplierType === "One Time") {
                                    if (vendorStatus === "SBS" && requestData.purchase) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABP" && requestData.finance) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "RBF" && requestData.purchase) {
                                        requestData.edit = false;
                                        requestData.route = true;
                                    }
                                    else {
                                        requestData.edit = ""
                                    }
                                } else {
                                    if (vendorStatus === "SBS" && requestData.purchase) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABP" && requestData.quality) {
                                        requestData.edit = false;
                                    } else if (vendorStatus === "ABQ" && requestData.coo) {
                                        requestData.edit = false;
                                    }
                                    else if (vendorStatus === "ABC" && requestData.finance) {
                                        requestData.edit = false;
                                    } else if ((vendorStatus === "RBQ" || vendorStatus === "RBC" || vendorStatus === "RBF") && requestData.purchase) {
                                        requestData.edit = false;
                                        requestData.route = true;
                                    }
                                    else {
                                        requestData.edit = ""
                                    }
                                }
                            }
                            //     } else if (vendorrelated === "Yes") {
                            //         if(vendorregtype === "Non BOM parts"){
                            //             if(data.SupplierType === "Temporary" || data.SupplierType === "One Time" ){
                            //                 if (vendorStatus === "SBS" && requestData.purchase) {
                            //                     requestData.edit = false;
                            //                 } else if (vendorStatus === "ABP" && requestData.finance) {
                            //                     requestData.edit = false;
                            //                 } else if (vendorStatus === "RBF" && requestData.purchase) {
                            //                     requestData.edit = false;
                            //                     requestData.route = true;
                            //                 }
                            //                 else {
                            //                     requestData.edit = ""
                            //                 }
                            //             }else{
                            //             if (vendorStatus === "SBS" && requestData.purchase) {
                            //                 requestData.edit = false;
                            //             } else if (vendorStatus === "ABP" && requestData.coo) {
                            //                 requestData.edit = false;
                            //             } else if (vendorStatus === "ABC" && requestData.ceo) {
                            //                 requestData.edit = false;
                            //             } else if (vendorStatus === "ABE" && requestData.finance) {
                            //                 requestData.edit = false;
                            //             } else if ((vendorStatus === "RBC" || vendorStatus === "RBE" || vendorStatus === "RBF") && requestData.quality) {
                            //                 requestData.edit = false;
                            //                 requestData.route = true;
                            //             }
                            //             else {
                            //                 requestData.edit = ""
                            //             }
                            //         }
                            //         }else{
                            //             if(data.SupplierType === "Temporary" || data.SupplierType === "One Time" ){
                            //                 if (vendorStatus === "SBS" && requestData.purchase) {
                            //                     requestData.edit = false;
                            //                 } else if (vendorStatus === "ABP" && requestData.finance) {
                            //                     requestData.edit = false;
                            //                 } else if (vendorStatus === "RBF" && requestData.purchase) {
                            //                     requestData.edit = false;
                            //                     requestData.route = true;
                            //                 }
                            //                 else {
                            //                     requestData.edit = ""
                            //                 }
                            //             }else{
                            //         if (vendorStatus === "SBS" && requestData.purchase) {
                            //             requestData.edit = false;
                            //         } else if (vendorStatus === "ABP" && requestData.quality) {
                            //             requestData.edit = false;
                            //         } else if (vendorStatus === "ABQ" && requestData.coo) {
                            //             requestData.edit = false;
                            //         } else if (vendorStatus === "ABC" && requestData.ceo) {
                            //             requestData.edit = false;
                            //         } else if (vendorStatus === "ABE" && requestData.finance) {
                            //             requestData.edit = false;
                            //         } else if ((vendorStatus === "RBQ" || vendorStatus === "RBC" || vendorStatus === "RBE" || vendorStatus === "RBF") && requestData.purchase) {
                            //             requestData.edit = false;
                            //             requestData.route = true;
                            //         }
                            //         else {
                            //             requestData.edit = ""
                            //         }
                            //     }
                            // }
                            // }
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
                            if (data.MACEGreen === "X") {
                                this.byId("MACEGreen").setSelected(true);
                            }
                            if (data.OverallRating >= "0" && data.OverallRating <= "2") {
                                this.getView().byId("overallRatingId").addStyleClass("ratingSuccess");
                                this.getView().byId("overallRatingId").removeStyleClass("ratingWarning");
                                this.getView().byId("overallRatingId").removeStyleClass("ratingError");
                            } else if (data.OverallRating >= "2.1" && data.OverallRating <= "3") {
                                this.getView().byId("overallRatingId").addStyleClass("ratingWarning");
                                this.getView().byId("overallRatingId").removeStyleClass("ratingError");
                                this.getView().byId("overallRatingId").removeStyleClass("ratingSuccess");
                            } else if (data.OverallRating > "3") {
                                this.getView().byId("overallRatingId").addStyleClass("ratingError");
                                this.getView().byId("overallRatingId").removeStyleClass("ratingSuccess");
                                this.getView().byId("overallRatingId").removeStyleClass("ratingWarning");
                            }
                            if (data.SystemAuditRating >= "0" && data.SystemAuditRating < "70") {
                                this.getView().byId("systemRatingId").addStyleClass("ratingError");
                                this.getView().byId("systemRatingId").removeStyleClass("ratingSuccess");
                            } else if (data.SystemAuditRating >= "70") {
                                this.getView().byId("systemRatingId").addStyleClass("ratingSuccess");
                                this.getView().byId("systemRatingId").removeStyleClass("ratingError");
                            }
                            this.getView().getModel("request").refresh(true);
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
                // this.fetchProductInfo();
            },
            onGetSupplierRegForm: function(){
                this.hardcodedURL="";
                if (window.location.href.includes("site")) {
					this.hardcodedURL = jQuery.sap.getModulePath("sp.fiori.onboarding");
				}
                var fileUrl = this.hardcodedURL + "/files/SupplierRegistrationfromupdated.doc";
                window.open(fileUrl, '_blank');
            },
            onGetRiskAssess: function(){
                this.hardcodedURL="";
                if (window.location.href.includes("site")) {
					this.hardcodedURL = jQuery.sap.getModulePath("sp.fiori.onboarding");
				}
                var fileUrl = this.hardcodedURL + "/files/RiskassessmentsupplierFinal.xlsx";
                window.open(fileUrl, '_blank');
            },
            onGetSysAud: function(){
                this.hardcodedURL="";
                if (window.location.href.includes("site")) {
					this.hardcodedURL = jQuery.sap.getModulePath("sp.fiori.onboarding");
				}
                var fileUrl = this.hardcodedURL + "/files/SystemAuditCheckSheet.xlsx";
                window.open(fileUrl, '_blank');
            },
            onRiskRatingChange: function (oEvent) {
                var rating = oEvent.getSource().getValue();
                if (rating >= "0" && rating <= "2") {
                    this.getView().byId("overallRatingId").addStyleClass("ratingSuccess");
                    this.getView().byId("overallRatingId").removeStyleClass("ratingWarning");
                    this.getView().byId("overallRatingId").removeStyleClass("ratingError");
                } else if (rating >= "2.1" && rating <= "3") {
                    this.getView().byId("overallRatingId").addStyleClass("ratingWarning");
                    this.getView().byId("overallRatingId").removeStyleClass("ratingError");
                    this.getView().byId("overallRatingId").removeStyleClass("ratingSuccess");
                } else if (rating > "3") {
                    this.getView().byId("overallRatingId").addStyleClass("ratingError");
                    this.getView().byId("overallRatingId").removeStyleClass("ratingSuccess");
                    this.getView().byId("overallRatingId").removeStyleClass("ratingWarning");
                }
            },
            onsysRatingChange: function (oEvent) {
                var rating = oEvent.getSource().getValue();
                if (rating >= "0" && rating < "70") {
                    this.getView().byId("systemRatingId").addStyleClass("ratingError");
                    this.getView().byId("systemRatingId").removeStyleClass("ratingSuccess");
                } else if (rating >= "70") {
                    this.getView().byId("systemRatingId").addStyleClass("ratingSuccess");
                    this.getView().byId("systemRatingId").removeStyleClass("ratingError");
                }
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
            /*
                        fetchProductInfo: function () {
                            var requestData = this.getView().getModel("request").getData();
                            var sProductInfoPath = `/ProductInfo?$filter=Vendor_VendorId eq '${requestData.VendorId}'`;
            
                            this.getView().getModel().read(sProductInfoPath, {
                                success: (oData, oResponse) => {
                                    if (oData.results && oData.results.length > 0) {
                                        this.productInfoTableModel.setData({ rows: oData.results });
                                        this.productInfoTableModel.refresh(true);
                                    }
                                },
                                error: (oError) => {
                                    console.log("Failed to fetch ProductInfo: ", oError);
                                }
                            });
                        },
            */
            onEdit: function () {
                this.getView().getModel("request").getData().edit = true;
                this.getView().getModel("request").refresh(true);
            },

            initializeAPIS: function () {
                var unitCode = sessionStorage.getItem("unitCode");

                this.GetSupplierAccountCodeList(unitCode)
                    .then(function () {
                        return this.GetDocumentList(unitCode);
                    }.bind(this))
                    .then(function () {
                        return this.GetSupplierTransportersList(unitCode);
                    }.bind(this))
                    .then(function () {
                        return this.GetSupplierLocationList(unitCode);
                    }.bind(this))
                    .catch(function (error) {
                        MessageBox.error("Failed to fetch data: " + error.message);
                    });
            },

            GetSupplierAccountCodeList: function (unitCode) {
                var oModel = this.getView().getModel();
                return new Promise(function (resolve, reject) {
                    oModel.callFunction("/GetSupplierAccountCodeList", {
                        method: "GET",
                        urlParameters: {
                            unitCode: unitCode
                        },
                        success: function (oData, response) {
                            var accountData = oData.results;
                            var oAccountModel = new sap.ui.model.json.JSONModel();
                            oAccountModel.setData({ items: accountData });
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
                return new Promise(function (resolve, reject) {
                    oModel.callFunction("/GetDocumentList", {
                        method: "GET",
                        urlParameters: {
                            unitCode: unitCode
                        },
                        success: function (oData, response) {
                            var docData = oData.results;
                            var oDocModel = new sap.ui.model.json.JSONModel();
                            oDocModel.setData({ items: docData });
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
                return new Promise(function (resolve, reject) {
                    oModel.callFunction("/GetSupplierTransportersList", {
                        method: "GET",
                        urlParameters: {
                            unitCode: unitCode
                        },
                        success: function (oData, response) {
                            var transporterData = oData.results;
                            var oTransporterModel = new sap.ui.model.json.JSONModel();
                            oTransporterModel.setData({ items: transporterData });
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
                return new Promise(function (resolve, reject) {
                    oModel.callFunction("/GetSupplierLocationList", {
                        method: "GET",
                        urlParameters: {
                            unitCode: unitCode
                        },
                        success: function (oData, response) {
                            var locationData = oData.results;
                            var oLocationModel = new sap.ui.model.json.JSONModel();
                            oLocationModel.setData({ items: locationData });
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
                if (data.RegistrationType === "Customer Driven (Export)") {
                    this.byId("registrationtypeRbId").setSelectedIndex(1);
                } else if (data.RegistrationType === "BOM Parts") {
                    this.byId("registrationtypeRbId").setSelectedIndex(2);
                } else if (data.RegistrationType === "Non BOM parts") {
                    this.byId("registrationtypeRbId").setSelectedIndex(3);
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
                if (data.Location === "Within State" && this.isunitaddressexists === false) {
                    if (data.STRatePerc >= "0" && data.STRatePerc <= "9" && data.STRatePerc.length === "1") {
                        tax = "0" + data.STRatePerc;
                        finalTax = "LST" + tax;
                    } else if (data.STRatePerc >= "10" && data.STRatePerc <= "99" && data.STRatePerc.length === "2") {
                        tax = data.STRatePerc;
                        finalTax = "LST" + tax;
                    } else {
                        tax = data.STRatePerc;
                        finalTax = "LST" + tax;
                    }
                } else if (data.Location === "Outside State" && this.isunitaddressexists === false) {
                    if (data.STRatePerc >= "0" && data.STRatePerc <= "9" && data.STRatePerc.length === "1") {
                        tax = "0" + data.STRatePerc;
                        finalTax = "CST" + tax;
                    } else if (data.STRatePerc >= "10" && data.STRatePerc <= "99" && data.STRatePerc.length === "2") {
                        tax = data.STRatePerc;
                        finalTax = "CST" + tax;
                    } else {
                        tax = data.STRatePerc;
                        finalTax = "CST" + tax;
                    }
                } else if ((data.Location === "Within State" || data.Location === "Outside State") && this.isunitaddressexists) {
                    if (data.STRatePerc >= "0" && data.STRatePerc <= "9" && data.STRatePerc.length === "1") {
                        tax = "0" + data.STRatePerc;
                        finalTax = "STB" + tax;
                    } else {
                        tax = data.STRatePerc;
                        finalTax = "STB" + tax;
                    }
                } else if (data.Location === "Outside Country" && HdnTrnCode === "ADDP") {
                    if (data.STRatePerc >= "0" && data.STRatePerc <= "9" && data.STRatePerc.length === "1") {
                        tax = "0" + data.STRatePerc;
                        finalTax = "IMP" + tax;
                    } else if (data.STRatePerc >= "10" && data.STRatePerc <= "99" && data.STRatePerc.length === "2") {
                        tax = data.STRatePerc;
                        finalTax = "IMP" + tax;
                    } else {
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
                            data.RegistrationType = "Customer Driven (Domestic)";
                        } else if (index === 1) {
                            data.RegistrationType = "Customer Driven (Export)";
                        } else if (index === 2) {
                            data.RegistrationType = "BOM Parts";
                        } else {
                            data.RegistrationType = "Non BOM parts";
                        }
                        break;
                    case "captiveRbId":
                        if (index === 0) {
                            data.CaptivePower = "Yes";
                        } else {
                            data.CaptivePower = "No";
                        }
                        break;
                    case "prodDesignRbId":
                        if (index === 1) {
                            data.ProdDesign = "NO";
                        } else {
                            data.ProdDesign = "YES";
                        }
                        break;
                    case "softwareCapRbId":
                        if (index === 1) {
                            data.SoftwareCapabilities = "NO";
                        } else if (index === 2) {
                            data.SoftwareCapabilities = "N/A";
                        } else {
                            data.SoftwareCapabilities = "YES";
                        }
                        break;
                    case "businessContinuityRbId":
                        if (index === 1) {
                            data.BusinessContinuity = "NO";
                        } else {
                            data.BusinessContinuity = "YES";
                        }
                        break;
                    case "logCustRbId":
                        if (index === 1) {
                            data.LogisticCustomer = "NO";
                        } else {
                            data.LogisticCustomer = "YES";
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
                var aInputs = [oView.byId("venNameId"), oView.byId("address1Id"),
                oView.byId("mobileId"),
                oView.byId("accNoId"), oView.byId("bankNameId"), oView.byId("ifscId"),
                oView.byId("branchNameId"), oView.byId("benNameId"), oView.byId("benLocId"),
                oView.byId("address2Id"),
                oView.byId("pincodeId"), oView.byId("panId"),
                oView.byId("contactPersonnameId"), oView.byId("deptId"), oView.byId("desigId"),
                oView.byId("contphoneId"), oView.byId("contmobileId")
                ];

                if (requestData.quality) {
                    aInputs.push(oView.byId("overallRatingId"));
                    aInputs.push(oView.byId("systemRatingId"));
                }
                if (requestData.quality && data.OverallRating > "3") {
                    aInputs.push(oView.byId("riskRatingRemId"));
                }
                // if (requestData.purchase) {
                //     aInputs.push(oView.byId("overallRatingId"));
                // }


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
                oView.byId("stateId"), oView.byId("cityId"),
                oView.byId("benAccTypeId"),
                oView.byId("suppliertypeId"),
                oView.byId("grouptypeId")];
                if (requestData.purchase) {
                    aInputs.push(oView.byId("suppPaymentTerm"));
                    aInputs.push(oView.byId("suppCurrency"));
                    aSelects.push(oView.byId("purposeId"));
                }
                if (data.Purpose === "Other") {
                    aInputs.push(oView.byId("reasonTextId"));
                }
                if (requestData.quality && data.VDAAssessment === "Yes") {
                    aSelects.push(oView.byId("VDAStatusId"));
                }
                if (requestData.finance) {
                    aInputs.push(oView.byId("accdescId"));
                    aInputs.push(oView.byId("addcodeId"));
                    aSelects.push(oView.byId("accountcodeId"));
                }
                if (data.RelatedParty === true) {
                    aInputs.push(oView.byId("RelatedPartyNameId"));
                    aInputs.push(oView.byId("RelatedPartyDesigId"));
                    aInputs.push(oView.byId("RelatedPartyContactId"));
                }
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
            onMACEGreenChange: function (evt) {
                var selected = evt.getParameter("selected");
                if (selected) {
                    this.createModel.setProperty("/" + MACEGreen, "X");
                } else {
                    this.createModel.setProperty("/" + MACEGreen, "");
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
                if (requestData.quality === true) {

                    if (data.VDAAssessment === "Yes") {
                        if (this.byId("VDAAssessmentFileUploader").getValue() || data.VDAAssessmentAttachment) {
                            this.byId("VDAAssessmentFileUploader").setValueState("None");
                        } else {
                            bValidationError = true;
                            this.byId("VDAAssessmentFileUploader").setValueState("Error");
                        }
                    }
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
                //this.updateProductInfo(this.id)
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
                        payload.AddressCode = vendata[i].AddressCode;
                        //payload.RelatedPart = vendata[i].RelatedPart;
                        payload.SupplierType = vendata[i].SupplierType;
                        payload.VDAAssessment = vendata[i].VDAAssessment;
                        //var venRelated = vendata[i].RelatedPart;
                        var venRegType = vendata[i].RegistrationType;
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
                    pending = "Purchase";
                    this.msg = "Form submitted successfully by Purchase";
                } else if (venStatus === "ABP") {
                    if (venRegType === "Non BOM parts") {
                        if (this.SupplierType === "Temporary" || this.SupplierType === "One Time") {
                            stat = "SBF";
                            appr = "1"
                            level = "2";
                            pending = "Finance";
                            this.msg = "Form submitted successfully by Finance";
                        } else {
                            stat = "SBC";
                            appr = "1"
                            level = "2";
                            pending = "COO";
                            this.msg = "Form submitted successfully by COO";
                        }
                    }else if(venRegType === "Customer Driven (Domestic)"){
                        if (this.SupplierType === "Temporary" || this.SupplierType === "One Time") {
                            stat = "SBF";
                            appr = "1"
                            level = "2";
                            pending = "Finance";
                            this.msg = "Form submitted successfully by Finance";
                        } else {
                            stat = "SBE";
                            appr = "1"
                            level = "2";
                            pending = "Marketingdom";
                            this.msg = "Form submitted successfully by Marketing";
                        }
                    }else if(venRegType === "Customer Driven (Export)") {
                        if (this.SupplierType === "Temporary" || this.SupplierType === "One Time") {
                            stat = "SBF";
                            appr = "1"
                            level = "2";
                            pending = "Finance";
                            this.msg = "Form submitted successfully by Finance";
                        } else {
                            stat = "SBE";
                            appr = "1"
                            level = "2";
                            pending = "Marketingexp";
                            this.msg = "Form submitted successfully by Marketing";
                        }
                    } else {
                        if (this.SupplierType === "Temporary" || this.SupplierType === "One Time") {
                            stat = "SBF";
                            appr = "1"
                            level = "2";
                            pending = "Finance";
                            this.msg = "Form submitted successfully by Finance";
                        } else {
                            stat = "SBQ";
                            appr = "1"
                            level = "2";
                            pending = "Quality";
                            this.msg = "Form submitted successfully by Quality";
                        }
                    }
                }else if (venStatus === "ABE") {
                            stat = "SBQ";
                            appr = "1"
                            level = "3";
                            pending = "Quality";
                            this.msg = "Form submitted successfully by Quality";
                }
                 else if (venStatus === "ABQ") {
                    if (venRegType === "Customer Driven (Domestic)"){
                        level = "4";
                    }else if(venRegType === "Customer Driven (Export)"){
                        level = "4";
                    } else {
                        level = "3";
                    }
                    stat = "SBC";
                    appr = "1"
                    pending = "COO";
                    this.msg = "Form submitted successfully by COO";
                }
                else if (venStatus === "ABC") {
                    if (venRegType === "Non BOM parts") {
                        level = "3";
                    }else if(venRegType === "Customer Driven (Domestic)"){
                        level = "5";
                    }else if(venRegType === "Customer Driven (Export)"){
                        level = "5";
                    } else {
                        level = "4";
                    }
                        stat = "SBF";
                        appr = "1"
                        pending = "Finance";
                        this.msg = "Form submitted successfully by Finance";
                }
                // else if (venStatus === "ABC" && venRelated === "Yes") {
                //     if(venRegType === "Non BOM parts"){
                //         stat = "SBE";
                //         appr = "1"
                //         level = "3";
                //         pending = "CEO";
                //         this.msg = "Form submitted successfully by CEO";
                //     }else{
                //     stat = "SBE";
                //     appr = "1"
                //     level = "4";
                //     pending = "CEO";
                //     this.msg = "Form submitted successfully by CEO";
                //     }
                // } 
                // else if (venStatus === "ABE" && venRelated === "Yes") {
                //     if(venRegType === "Non BOM parts"){
                //     stat = "SBF";
                //     appr = "1"
                //     level = "4";
                //     pending = "Finance";
                //     this.msg = "Form submitted successfully by Finance";
                //     }else{
                //     stat = "SBF";
                //     appr = "1"
                //     level = "5";
                //     pending = "Finance";
                //     this.msg = "Form submitted successfully by Finance";
                //     }
                // }
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
                        payload.AddressCode = vendata[i].AddressCode;
                        //payload.RelatedPart = vendata[i].RelatedPart;
                        payload.SupplierType = vendata[i].SupplierType;
                        payload.VDAAssessment = vendata[i].VDAAssessment;
                        break;
                    }
                }
                var stat = "";
                var level = "";
                var pending = "";
                var appr = "0";
                if (venStatus === "RBP" || venStatus === "RBC" || venStatus === "RBF") {
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
                let emailBody = `||Please find the link below for Vendor Assessment Form. Kindly log-in with the link to fill the form.<br><br>Form is valid till ${validTo}. Request you to fill the form and submit on time.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/ed7b03c3-9a0c-46b0-b0de-b5b00d211677.onboarding.spfiorisupplierform-0.0.1/index.html?id=${vendorId}">CLICK HERE</a>`;
                var oModel = this.getView().getModel();
                var mParameters = {
                    method: "GET",
                    urlParameters: {
                        vendorName: vendorName,
                        subject: "Supplier Form",
                        content: emailBody,
                        toAddress: vendorMail,
                        ccAddress: ""
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
