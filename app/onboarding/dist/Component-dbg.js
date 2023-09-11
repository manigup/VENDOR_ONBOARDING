/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sp/fiori/onboarding/formatter",
    "sap/ui/core/routing/HashChanger",
    "sap/m/MessageBox"
],
    function (UIComponent, formatter, HashChanger, MessageBox) {
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

                // metadata success
                this.getModel().metadataLoaded(true).then(() => {

                    // enable routing
                    HashChanger.getInstance().replaceHash("");
                    this.getRouter().initialize();

                }).catch(err =>
                    // metadata error
                    this.handleError(err.responseText));

                // odata request failed
                this.getModel().attachRequestFailed(err =>
                    this.handleError(err.getParameter("response").responseText));
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