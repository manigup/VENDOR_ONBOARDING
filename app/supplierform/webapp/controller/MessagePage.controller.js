sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sp.fiori.supplierform.controller.MessagePage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sp.fiori.vendorcreation.view.MessagePage
		 */
		onInit: function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this); // get Router
			this.router.attachRouteMatched(this.handleRouteMatched, this);
		},

		handleRouteMatched: function (oEvent) {
			if (oEvent.getParameter("name") !== "invalidUrl") {
				return;
			}
			var status = oEvent.getParameter("arguments").status;
			if (status === "submit") {
				this.getView().byId("msgPageId").setText("This form link is already submitted");
			}
		}
		

	});

});