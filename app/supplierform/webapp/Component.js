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

            var that = this;

            this.id = jQuery.sap.getUriParameters().get("id");
            var requestModel = this.getModel("request");
            
            var hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a1aa5e6e-4fe2-49a5-b95a-5cd7a2b05a51.onboarding.spfiorionboarding-0.0.1";
            var sPath = hardcodedURL + "/v2/odata/v4/catalog/VenOnboard?$filter=VendorId eq " + this.id;

            var ajaxCall = new Promise(function(resolve, reject) {
                $.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: sPath,
                    dataType: "json",
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });

            ajaxCall.then(function(data) {
                requestModel.setData(data.d.results[0]);
                requestModel.refresh(true);
                if (data.d.results[0].Status === "SBS") {
                    that.getRouter().navTo("invalidUrl", { status: "submit" });
                    return;
                }

                var today = new Date();
                if ((today > new Date(data.d.results[0].VenValidTo)) || (today.toDateString() === new Date(data.d.results[0].VenValidTo).toDateString())) {
                    MessageBox.error("Link Expired");
                    return;
                }
                
                if (data.d.results[0].VendorId === that.id) {
                    that.getRouter().navTo("RouteView1", { "id": that.id });
                } else {
                    that.getRouter().navTo("invalidUrl", { status: "" });
                }
                // enable routing
                that.getRouter().initialize();

            }).catch(function(error) {
                // Error logic here
                BusyIndicator.hide();
                that.getRouter().navTo("invalidUrl", { status: "" });

                // enable routing
                that.getRouter().initialize();
            });
        }
    });
});
