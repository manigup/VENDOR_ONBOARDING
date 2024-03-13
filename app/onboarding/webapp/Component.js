/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sp/fiori/onboarding/formatter",
    "sap/ui/core/routing/HashChanger",
    "sap/m/MessageBox",
    'sap/ui/model/json/JSONModel',
],
    function (UIComponent, formatter, HashChanger, MessageBox, JSONModel) {
        "use strict";

        return UIComponent.extend("sp.fiori.onboarding.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                
                this.setModel(new JSONModel([]), "DataModel");
                this.setModel(new JSONModel([]), "AccessDetails");
                this.setModel(new JSONModel([]), "UserApiDetails");
                this.getModel().metadataLoaded(true).then(() => {
                    // metadata success
                    this.getStatus();
                    // Hardcoded URL for the AJAX request
                   // var hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/da8bb600-97b5-4ae9-822d-e6aa134d8e1a.onboarding.spfiorionboarding-0.0.1/user-api/attributes";
                   if (window.location.href.includes("site")) {
					this.hardcodedURL = jQuery.sap.getModulePath("sp.fiori.onboarding");
				}
                   var url = this.hardcodedURL + "/user-api/attributes";
                    // Make the AJAX call
                    $.ajax({
                        url: url,
                        type: "GET",
                        success: res => {
                            console.log("RESPONSE: ", res);
                            this.getModel("UserApiDetails").setData(res);
                            // Store the name and email in session storage
                            sessionStorage.setItem('userName', res.name);
                            sessionStorage.setItem('userEmail', res.email);
                           
                            console.log(`Name and Email stored in session storage`);
                        },
                        error: (jqXHR, textStatus, errorThrown) => {
                            console.log("ERROR: ", textStatus, ", DETAILS: ", errorThrown);
                        }
                    });
                    // $.ajax({
                    //     url: 'http://103.237.175.233:84/IAIAPI.asmx/TestConnection',
                    //     type: 'POST',
                    //     contentType: 'application/json',
                    //      data: JSON.stringify({}),

                    //     success: function (response) {

                    //         console.log(reponse);
                    //     },
                    //     error: function (error) {
                    //         console.log(error);

                    //     },
                    //     });
                    // enable routing
                    HashChanger.getInstance().replaceHash("");
                    this.getRouter().initialize();

                }).catch(err => {
                    // metadata error
                    this.handleError(err.responseText);
                });

                // odata request failed
                this.getModel().attachRequestFailed(err => {
                    this.handleError(err.getParameter("response").responseText);
                });
            },

            getStatus: function () {
                this.getModel().read("/AccessInfo", {
                    success: data => {
                        this.getModel("AccessDetails").setData(data.results);
                    },
                    error: () => {
                    }
                });
            },

            handleError: function (responseText) {
                if (responseText.indexOf("<?xml") !== -1) {
                    MessageBox.error($($.parseXML(responseText)).find("message").text());
                } else if (responseText.indexOf("{") !== -1) {
                    var json = JSON.parse(responseText);
                    MessageBox.error(json.message || json.error.message.value);
                } else {
                    MessageBox.error(responseText);
                }
            }
        });
    }
);