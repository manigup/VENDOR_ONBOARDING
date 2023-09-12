sap.ui.define(["./BaseController","sap/m/MessageBox","sap/ui/model/Filter","sap/ui/core/BusyIndicator","sap/ui/model/json/JSONModel"],function(e,t,r,o,i){"use strict";return e.extend("sp.fiori.onboarding.controller.List",{onInit:function(){this.getRouter().attachRoutePatternMatched(this.onRouteMatched,this);["createFromDateId","createToDateId"].forEach(e=>{this.byId(e).attachBrowserEvent("keypress",e=>e.preventDefault())})},onRouteMatched:function(e){if(e.getParameter("name")!=="list"){return}this.getView().setModel(new i([]),"DataModel");this.getData()},getData:function(){o.show();setTimeout(()=>{this.getView().getModel().read("/VenOnboard",{success:e=>{e.results.map(e=>{e.StatusText=formatter.formatStatus(e.Status);e.WavStatusText=formatter.formatStatus(e.WavStatus);parseInt(e.Score);return e});this.getView().getModel("DataModel").setData(e.results);this.getView().getModel("DataModel").setSizeLimit(e.results.length);this.getView().getModel("DataModel").refresh(true);o.hide()},error:()=>o.hide()})},1e3)},onSearch:function(e){var t=e.getParameter("query");if(e.getParameter("refreshButtonPressed")){this.getData()}else if(t){this.byId("createFromDateId").setValue("");this.byId("createToDateId").setValue("");this.byId("vendorList").getBinding("items").filter([new r([new r("Vendor",sap.ui.model.FilterOperator.Contains,t),new r("VenName",sap.ui.model.FilterOperator.Contains,t),new r("Lifnr",sap.ui.model.FilterOperator.Contains,t),new r("ApprovalPending",sap.ui.model.FilterOperator.Contains,t),new r("StatusText",sap.ui.model.FilterOperator.Contains,t)])])}else{this.byId("vendorList").getBinding("items").filter([])}},onCreationDateFilter:function(){var e=this.byId("createFromDateId").getValue(),t=this.byId("createToDateId").getValue();if(e&&t){this.byId("vendorList").getBinding("items").filter([new r([new r("CreatedOn",sap.ui.model.FilterOperator.BT,e,t)])])}else if(e){this.byId("vendorList").getBinding("items").filter([new r([new r("CreatedOn",sap.ui.model.FilterOperator.EQ,e)])])}else if(t){this.byId("vendorList").getBinding("items").filter([new r([new r("CreatedOn",sap.ui.model.FilterOperator.LE,t)])])}else{this.byId("vendorList").getBinding("items").filter([])}this.byId("search").setValue("")},onCreatePress:function(){var e=sap.ui.xmlfragment("sp.fiori.onboarding.fragment.Create",this);this.getView().addDependent(e);sap.ui.getCore().byId("createDialog").setModel(new i({}),"CreateModel");e.open()},onCreateSubmit:function(){if(this.validateFields()){o.show();const e=sap.ui.getCore().byId("createDialog").getModel("CreateModel").getData();e.Vendor=this.generateVendorNo();setTimeout(()=>{this.getView().getModel().create("/VenOnboard",e,{success:e=>{o.hide();t.success("Vendor Creation Request "+e.Vendor+" created successfully",{onClose:()=>{sap.ui.getCore().byId("createDialog").destroy();this.getData()}})},error:()=>o.hide()})},1e3)}else{t.error("Please correct all the error's to proceed")}},onVendorPress:function(e){var t=e.getSource().getBindingContext("DataModel").getObject();this.vendor=t.Vendor;var r=sap.ui.xmlfragment("sp.fiori.onboarding.fragment.VendorDetails",this);sap.ui.getCore().byId("displayPopover").setModel(new i(t),"VenModel");this.getView().addDependent(r);r.openBy(e.getSource())},onAttachmentPress:function(e){o.show();var t=e.getSource();this.vendor=t.getBindingContext("DataModel").getProperty("Vendor");setTimeout(()=>{this.getView().getModel().read("/BuyerFormSet",{filters:[new r("Vendor","EQ",this.vendor)],success:e=>{e.results.map(e=>e.Url=this.getView().getModel().sServiceUrl+"/BuyerFormSet(Vendor='"+e.Vendor+"',Sernr='"+e.Sernr+"')/$value");var r=sap.ui.xmlfragment("sp.fiori.onboarding.fragment.Attachment",this);sap.ui.getCore().byId("attachPopover").setModel(new i(e),"AttachModel");this.getView().addDependent(r);r.openBy(t);sap.ui.getCore().byId("attachment").setUploadUrl(this.getView().getModel().sServiceUrl+"/BuyerFormSet");o.hide()},error:()=>o.hide()})},1e3)},onAttachmentUploadComplete:function(){o.show();setTimeout(()=>{this.getView().getModel().read("/BuyerFormSet",{filters:[new r("Vendor","EQ",this.vendor)],success:e=>{e.results.map(e=>e.Url=this.getView().getModel().sServiceUrl+"/BuyerFormSet(Vendor='"+e.Vendor+"',Sernr='"+e.Sernr+"')/$value");sap.ui.getCore().byId("attachPopover").setModel(new i(e),"AttachModel");o.hide()},error:()=>o.hide()})},1e3)},onAttachmentDeletePress:function(e){var r=e.getSource().getBindingContext("AttachModel").getObject();t.confirm("Are you sure ?",{actions:[t.Action.YES,t.Action.NO],onClose:e=>{if(e==="YES"){o.show();setTimeout(()=>{this.getView().getModel().remove("/BuyerFormSet(Vendor='"+r.Vendor+"',Sernr='"+r.Sernr+"')",{success:()=>{o.hide();t.success(r.Filename+" deleted successfully",{onClose:()=>this.onAttachmentUploadComplete()})},error:()=>o.hide()})},1e3)}}})}})});