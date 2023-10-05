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

        async init() {
            UIComponent.prototype.init.apply(this, arguments);

            try {
                const data = await this.getDataFromServer();
                this.handleData(data);
                this.getRouter().initialize();
            } catch (error) {
                BusyIndicator.hide();
                this.getRouter().navTo("invalidUrl", { status: "" });
                this.getRouter().initialize();
            }
        },

        async getDataFromServer() {
            return new Promise((resolve, reject) => {
                const id = jQuery.sap.getUriParameters().get("id");
               const hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a1aa5e6e-4fe2-49a5-b95a-5cd7a2b05a51.onboarding.spfiorionboarding-0.0.1";
               //const  hardcodedURL = "";
              const sPath = hardcodedURL + `/v2/odata/v4/catalog/VenOnboard?$filter=VendorId eq ${id}`;

                $.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: sPath,
                    dataType: "json",
                    success: resolve,
                    error: reject
                });
            });
        },

        handleData(data) {
            const requestModel = this.getModel("request");
            requestModel.setData(data.d.results[0]);
            requestModel.refresh(true);

            if (data.d.results[0].Status === "SBS") {
                this.getRouter().navTo("invalidUrl", { status: "submit" });
                return;
            }

            const today = new Date();
            const expirationDate = new Date(data.d.results[0].VenValidTo);

            if (today >= expirationDate) {
                MessageBox.error("Link Expired");
                return;
            }

            const id = jQuery.sap.getUriParameters().get("id");
            if (data.d.results[0].VendorId === id) {
                this.getRouter().navTo("RouteView1", { "id": id });
            } else {
                this.getRouter().navTo("invalidUrl", { status: "" });
            }
        }
    });
});
