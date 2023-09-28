/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sp/fiori/supplierform/model/models",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "./formatter"
],
    function (UIComponent, Device, models, BusyIndicator, MessageBox, Filter, formatter) {
        "use strict";

        return UIComponent.extend("sp.fiori.supplierform.Component", {
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

                 // enable routing
                 this.getRouter().initialize();

                this.id = jQuery.sap.getUriParameters().get("id");
                var requestModel = this.getModel("request");

                // Using Ajax instead of OData read method
                var modulePath = jQuery.sap.getModulePath("sp/fiori/supplierform");
                modulePath = modulePath === "." ? "" : modulePath;

                var sPath = modulePath + "/v2/odata/v4/catalog/VenOnboard?$filter=VendorId eq " + this.id;

                $.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: sPath,
                    dataType: "json",
                    context: this,
                    success: function (data) {
                        console.log("Returned data:", data);
                        // BusyIndicator.hide();
                        requestModel.setData(data.d.results[0]);
                        requestModel.refresh(true);


                        if (data.d.results[0].Status === "SBS") {
                            this.getRouter().navTo("invalidUrl", {
                                status: "submit"
                            });
                            return;
                        }

                        var today = new Date();
                        if ((today > new Date(data.d.results[0].VenValidTo)) || (today.toDateString() === new Date(data.d.results[0].VenValidTo).toDateString())) {
                            MessageBox.error("Link Expired");
                            return;
                        }
                        if (data.d.results[0].VendorId === this.id) {
                            this.getRouter().navTo("RouteView1", {
                                "id": this.id
                            });
                        } else {
                            this.getRouter().navTo("invalidUrl", {
                                status: ""
                            });
                        }
                    }.bind(this),
                    error: () => {
                        BusyIndicator.hide();
                        this.getRouter().navTo("invalidUrl", {
                            status: ""
                        });

                        // enable routing
                        this.getRouter().initialize();
                    }
                });

            }

        });
    }
);