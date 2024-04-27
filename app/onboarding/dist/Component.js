sap.ui.define(["sap/ui/core/UIComponent","sp/fiori/onboarding/formatter","sap/ui/core/routing/HashChanger","sap/m/MessageBox","sap/ui/model/json/JSONModel"],function(e,s,t,a,i){"use strict";return e.extend("sp.fiori.onboarding.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.setModel(new i([]),"DataModel");this.setModel(new i([]),"AccessDetails");this.setModel(new i([]),"UserApiDetails");this.getModel().metadataLoaded(true).then(()=>{this.getStatus();if(window.location.href.includes("site")){this.hardcodedURL=jQuery.sap.getModulePath("sp.fiori.onboarding");var e=this.hardcodedURL+"/user-api/attributes";$.ajax({url:e,type:"GET",success:e=>{console.log("RESPONSE: ",e);this.getModel("UserApiDetails").setData(e);sessionStorage.setItem("userName",e.name);sessionStorage.setItem("userEmail",e.email);this.setHeaders(e.login_name[0],e.type[0].substring(0,1).toUpperCase())},error:(e,s,t)=>{console.log("ERROR: ",s,", DETAILS: ",t)}})}else{this.setHeaders("RA046 ","E")}}).catch(e=>{this.handleError(e.responseText)});this.getModel().attachRequestFailed(e=>{this.handleError(e.getParameter("response").responseText)})},getStatus:function(){this.getModel().read("/AccessInfo",{success:e=>{this.getModel("AccessDetails").setData(e.results)}})},setHeaders:function(e,s){this.getModel().setHeaders({loginId:e,loginType:s});t.getInstance().replaceHash("");this.getRouter().initialize()},handleError:function(e){if(e.indexOf("<?xml")!==-1){a.error($($.parseXML(e)).find("message").text())}else if(e.indexOf("{")!==-1){var s=JSON.parse(e);a.error(s.message||s.error.message.value)}else{a.error(e)}}})});