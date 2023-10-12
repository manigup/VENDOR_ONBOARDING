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

                    // var modulePath = jQuery.sap.getModulePath("sp/fiori/supplierform");
                    // modulePath = modulePath === "." ? "" : modulePath;

                    let hardcodedURL = "";
                    if (window.location.href.includes("launchpad")) {
                        hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/da8bb600-97b5-4ae9-822d-e6aa134d8e1a.onboarding.spfiorionboarding-0.0.1";
                    }
                    const sPath = hardcodedURL + `/v2/odata/v4/catalog/VenOnboard?$filter=VendorId eq ${id}`;

                    // const sPath = modulePath + "/v2/odata/v4/catalog/VenOnboard?$filter=VendorId eq " + id;

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
