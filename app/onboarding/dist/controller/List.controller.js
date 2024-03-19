sap.ui.define(["./BaseController","sap/m/MessageBox","sap/m/MessageToast","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/FilterType","sap/ui/core/BusyIndicator","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/Label","sap/m/library","sap/m/Text","sap/m/TextArea"],function(e,t,i,a,s,o,n,r,d,l,c,p,u,h){"use strict";var m=p.ButtonType;var g=p.DialogType;return e.extend("sp.fiori.onboarding.controller.List",{onInit:function(){this.getRouter().attachRoutePatternMatched(this.onRouteMatched,this);["createFromDateId","createToDateId"].forEach(e=>{this.byId(e).attachBrowserEvent("keypress",e=>e.preventDefault())})},onRouteMatched:function(e){if(e.getParameter("name")!=="list"){return}this.getView().setModel(new r([]),"FormData");this.getData()},getData:function(){n.show();setTimeout(()=>{this.getView().getModel().read("/VenOnboard",{urlParameters:{venfilter:true},success:e=>{e.results.map(e=>{e.StatusText=formatter.formatStatus(e.Status);e.createdAt=formatter.formatDate(e.createdAt);return e});var t={purchase:false,quality:false,coo:false,ceo:false,finance:false};var i=this.getView().getModel("AccessDetails").getData();var a=this.getView().getModel("UserApiDetails").getData();t.purchase=i.find(e=>e.email===a.email&&e.Access==="Purchase")?true:false;t.quality=i.find(e=>e.email===a.email&&e.Access==="Quality")?true:false;t.coo=i.find(e=>e.email===a.email&&e.Access==="COO")?true:false;t.ceo=i.find(e=>e.email===a.email&&e.Access==="CEO")?true:false;t.finance=i.find(e=>e.email===a.email&&e.Access==="Finance")?true:false;if(t.purchase){t.appbtn="purchase"}else if(t.quality){t.appbtn="quality"}else if(t.coo){t.appbtn="coo"}else if(t.ceo){t.appbtn="ceo"}else if(t.finance){t.appbtn="finance"}this.getView().getModel("request").setData(t);this.getView().getModel("request").refresh(true);this.getView().getModel("DataModel").setData(e.results);this.getView().getModel("DataModel").setSizeLimit(e.results.length);this.getView().getModel("DataModel").refresh(true);n.hide()},error:()=>n.hide()})},1e3)},onSelectAllData:function(){n.show();setTimeout(()=>{this.getView().getModel().read("/VenOnboard",{success:e=>{e.results.map(e=>{e.StatusText=formatter.formatStatus(e.Status);e.createdAt=formatter.formatDate(e.createdAt);return e});var t={purchase:false,quality:false,coo:false,ceo:false,finance:false};var i=this.getView().getModel("AccessDetails").getData();var a=this.getView().getModel("UserApiDetails").getData();t.purchase=i.find(e=>e.email===a.email&&e.Access==="Purchase")?true:false;t.quality=i.find(e=>e.email===a.email&&e.Access==="Quality")?true:false;t.coo=i.find(e=>e.email===a.email&&e.Access==="COO")?true:false;t.ceo=i.find(e=>e.email===a.email&&e.Access==="CEO")?true:false;t.finance=i.find(e=>e.email===a.email&&e.Access==="Finance")?true:false;if(t.purchase){t.appbtn="purchase"}else if(t.quality){t.appbtn="quality"}else if(t.coo){t.appbtn="coo"}else if(t.ceo){t.appbtn="ceo"}else if(t.finance){t.appbtn="finance"}this.getView().getModel("request").setData(t);this.getView().getModel("request").refresh(true);this.getView().getModel("DataModel").setData(e.results);this.getView().getModel("DataModel").setSizeLimit(e.results.length);this.getView().getModel("DataModel").refresh(true);n.hide()},error:()=>n.hide()})},1e3)},onDeselectAllData:function(){this.getData()},onSearch:function(e){var t=e.getParameter("query");if(e.getParameter("refreshButtonPressed")){this.getData()}else if(t){this.byId("createFromDateId").setValue("");this.byId("createToDateId").setValue("");this.byId("vendorList").getBinding("items").filter([new a([new a("Vendor",sap.ui.model.FilterOperator.Contains,t),new a("VendorName",sap.ui.model.FilterOperator.Contains,t),new a("Lifnr",sap.ui.model.FilterOperator.Contains,t),new a("VenApprovalPending",sap.ui.model.FilterOperator.Contains,t),new a("StatusText",sap.ui.model.FilterOperator.Contains,t)])])}else{this.byId("vendorList").getBinding("items").filter([])}},onCreationDateFilter:function(){var e=this.byId("createFromDateId").getValue(),t=this.byId("createToDateId").getValue();if(e&&t){this.byId("vendorList").getBinding("items").filter([new a([new a("createdAt",sap.ui.model.FilterOperator.BT,e,t)])])}else if(e){this.byId("vendorList").getBinding("items").filter([new a([new a("createdAt",sap.ui.model.FilterOperator.EQ,e)])])}else if(t){this.byId("vendorList").getBinding("items").filter([new a([new a("createdAt",sap.ui.model.FilterOperator.LE,t)])])}else{this.byId("vendorList").getBinding("items").filter([])}this.byId("search").setValue("")},onCreatePress:function(){var e=sap.ui.xmlfragment("sp.fiori.onboarding.fragment.Create",this);this.getView().addDependent(e);sap.ui.getCore().byId("createDialog").setModel(new r({}),"CreateModel");e.open()},onCreateSubmit:function(){if(this.validateFields()){n.show();const e=sap.ui.getCore().byId("createDialog").getModel("CreateModel").getData();e.Vendor=this.generateVendorNo();e.VenFrom=new Date;e.VenValidTo=this.changeDate(e.VenFrom,7,"add");e.initiatedBy=sessionStorage.getItem("userEmail");setTimeout(()=>{this.getView().getModel().create("/VenOnboard",e,{success:async e=>{n.hide();console.log("VendorId",e.VendorId);t.success("Vendor creation request "+e.Vendor+" created successfully. \n\n Also, Supplier form generated please fill to procced.",{onClose:()=>{sap.ui.getCore().byId("createDialog").destroy();this.getData()}});await this.sendEmailNotification(e.VendorName,e.VendorId,e.VendorMail,e.VenValidTo)},error:()=>n.hide()})},1e3)}else{t.error("Please correct all the error's to proceed")}},sendEmailNotification:function(e,t,i,a){return new Promise((s,o)=>{let n=`||Please find the link below for Vendor Assessment Form. Kindly log-in with the link to fill the form.<br><br>Form is valid till ${a}. Request you to fill the form and submit on time.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/ed7b03c3-9a0c-46b0-b0de-b5b00d211677.onboarding.spfiorisupplierform-0.0.1/index.html?id=${t}">CLICK HERE</a>`;var r=this.getView().getModel();var d={method:"GET",urlParameters:{vendorName:e,subject:"Supplier Form",content:n,toAddress:i,ccAddress:sessionStorage.getItem("userEmail")},success:function(e,t){console.log("Email sent successfully.");s(e)},error:function(e){console.log("Failed to send email.");o(e)}};r.callFunction("/sendEmail",d)})},onFormPress:function(){const e=window.location.href;let t;if(e.includes("impautosuppdev")){t="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/ed7b03c3-9a0c-46b0-b0de-b5b00d211677.onboarding.spfiorisupplierform-0.0.1/index.html?id="+this.vendorId}else{t="/supplierform/webapp/index.html?id="+this.vendorId}window.open(t)},onMoreInfoPress:function(e){e.getSource().getParent().getParent().destroy();this.getRouter().navTo("Form",{VendorId:this.vendorId})},onVendorPress:function(e){var t=e.getSource().getBindingContext("DataModel").getObject();var i=this.getView().getModel("request").getData();this.vendor=t.Vendor;this.vendorId=t.VendorId;if(i.purchase===true){t.Access="Purchase"}else if(i.quality===true){t.Access="Quality"}else if(i.coo===true){t.Access="COO"}else if(i.ceo===true){t.Access="CEO"}else if(i.finance===true){t.Access="Finance"}var a=sap.ui.xmlfragment("sp.fiori.onboarding.fragment.VendorDetails",this);sap.ui.getCore().byId("displayPopover").setModel(new r(t),"VenModel");this.getView().addDependent(a);a.openBy(e.getSource())},onResetValidityPress:function(e){n.show();var i=e.getSource();var a=this.getView().getModel("DataModel").getData();var s={};for(var o=0;o<a.length;o++){if(a[o].VendorId===this.vendorId){s.Vendor=a[o].Vendor;s.VendorId=a[o].VendorId;s.VendorName=a[o].VendorName;s.VendorType=a[o].VendorType;s.Companycode=a[o].Companycode;s.RegistrationType=a[o].RegistrationType;s.Department=a[o].Department;s.Telephone=a[o].Telephone;s.City=a[o].City;s.VendorMail=a[o].VendorMail;s.VenFrom=new Date;s.VenValidTo=this.changeDate(s.VenFrom,7,"add");s.VenTimeLeft="";s.Status=a[o].Status;s.ResetValidity="";s.initiatedBy=a[o].initiatedBy;s.SupplierType=a[o].SupplierType;this.RVendorName=a[o].VendorName;this.RVendorMail=a[o].VendorMail;this.RVenValidTo=s.VenValidTo;break}}setTimeout(()=>{this.getView().getModel().update("/VenOnboard(Vendor='"+s.Vendor+"',VendorId="+this.vendorId+")",s,{success:()=>{n.hide();t.success("Form validity extended for next 7 days for vendor "+this.vendor,{onClose:()=>{i.getParent().getParent().destroy();this.getData()}});this.sendResetEmailNotification(this.RVendorName,this.vendorId,this.RVendorMail,this.RVenValidTo)},error:e=>{n.hide();console.log(e)}})},1e3)},sendResetEmailNotification:function(e,t,i,a){let s=`||Please find the link below for Vendor Assessment Form. Kindly log-in with the link to fill the form.<br><br>Validity of the form is extended for next 7 days. Form is valid till ${a}. Request you to fill the form and submit on time.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/ed7b03c3-9a0c-46b0-b0de-b5b00d211677.onboarding.spfiorisupplierform-0.0.1/index.html?id=${t}">CLICK HERE</a>`;var o=this.getView().getModel();var n={method:"GET",urlParameters:{vendorName:e,subject:"Supplier Form",content:s,toAddress:i,ccAddress:""},success:function(e,t){console.log("Email sent successfully.")},error:function(e){console.log("Failed to send email.")}};o.callFunction("/sendEmail",n)},onAttachmentPress:function(e){n.show();var t=e.getSource();this.vendorId=t.getBindingContext("DataModel").getProperty("VendorId");setTimeout(()=>{this.getView().getModel().read("/Attachments",{filters:[new a("VendorId","EQ",this.vendorId)],success:e=>{e.results.map(e=>e.Url=this.getView().getModel().sServiceUrl+"/Attachments(VendorId='"+e.VendorId+"',ObjectId='"+e.ObjectId+"')/$value");var i=sap.ui.xmlfragment("sp.fiori.onboarding.fragment.Attachment",this);sap.ui.getCore().byId("attachPopover").setModel(new r(e),"AttachModel");this.getView().addDependent(i);i.openBy(t);sap.ui.getCore().byId("attachment").setUploadUrl(this.getView().getModel().sServiceUrl+"/Attachments");n.hide()},error:()=>n.hide()})},1e3)},onBeforeUploadStartsAttach:function(e){n.show();e.getParameters().addHeaderParameter(new sap.m.UploadCollectionParameter({name:"slug",value:this.vendorId+"/"+e.getParameters().fileName}))},getAttachments:function(){n.show();setTimeout(()=>{this.getView().getModel().read("/Attachments",{filters:[new a("VendorId","EQ",this.vendorId)],success:e=>{e.results.map(e=>e.Url=this.getView().getModel().sServiceUrl+"/Attachments(VendorId='"+e.VendorId+"',ObjectId='"+e.ObjectId+"')/$value");sap.ui.getCore().byId("attachPopover").setModel(new r(e),"AttachModel");n.hide()},error:()=>n.hide()})},1e3)},onAttachmentUploadComplete:function(e){if(e.getParameter("files")[0].status==201){i.show("File "+e.getParameter("files")[0].fileName+" Attached successfully");this.getAttachments()}else{t.error(JSON.parse(e.getParameter("files")[0].responseRaw).error.message.value);n.show()}},onAttachmentDeletePress:function(e){var i=e.getSource().getBindingContext("AttachModel").getObject();t.confirm("Are you sure ?",{actions:[t.Action.YES,t.Action.NO],onClose:e=>{if(e==="YES"){n.show();setTimeout(()=>{this.getView().getModel().remove("/Attachments(VendorId='"+i.VendorId+"',ObjectId='"+i.ObjectId+"')",{success:()=>{n.hide();t.success(i.Filename+" deleted successfully",{onClose:()=>this.getAttachments()})},error:()=>n.hide()})},1e3)}}})},delay:function(e){return new Promise(t=>setTimeout(t,e))},changeStatus:async function(){n.show();var e=this.getView().getModel("DataModel").getData();var i=this.getView().getModel("FormData").getData();var a=this.getView().getModel("request").getData();this.SupplierType=i.SupplierType;if(a.quality&&this.SupplierType==="Permanent"&&i.SystemAuditRating>="0"&&i.SystemAuditRating<"70"){t.error("The form cannot be approved as System Audit Rating is "+i.SystemAuditRating);return}else{var s={};for(var o=0;o<e.length;o++){if(e[o].VendorId===this.vendorId){s.Vendor=e[o].Vendor;s.VendorId=e[o].VendorId;s.VendorName=e[o].VendorName;s.VendorType=e[o].VendorType;s.Companycode=e[o].Companycode;s.RegistrationType=e[o].RegistrationType;s.Department=e[o].Department;s.Telephone=e[o].Telephone;s.City=e[o].City;s.VendorMail=e[o].VendorMail;this.VendorMail=e[o].VendorMail;s.VenValidTo=e[o].VenValidTo;s.VenFrom=e[o].VenFrom;s.VenTimeLeft=e[o].VenTimeLeft;s.initiatedBy=e[o].initiatedBy;this.initiatedBy=e[o].initiatedBy;var r=e[o].Status;s.ResetValidity=e[o].ResetValidity;s.SupplierType=e[o].SupplierType;var d=e[o].RegistrationType;break}}var l="";var c="";var p="";var u="0";var h=s.VendorName;if(r==="SBQ"){this.access="COO";this.emailbodyini=`||Form for the supplier ${h} is approved by the Quality. Approval pending at COO. `;this.emailbody=`||Form for the supplier ${h} is approved by the Quality. Approval pending at COO. Kindly submit and approve using below link.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/site?siteId=3c32de29-bdc6-438e-95c3-285f3d2e74da&sap-language=en#onboarding-manage?sap-ui-app-id-hint=saas_approuter_sp.fiori.onboarding&/">CLICK HERE</a>  `;this.VendorName="COO Team";l="ABQ";c="3";p="COO";this.msg="Approved by Quality"}else if(r==="SBP"){if(d==="Non BOM parts"){if(this.SupplierType==="Temporary"||this.SupplierType==="One Time"){this.access="Finance";this.emailbodyini=`||Form for the supplier ${h} is approved by the Purchase. Approval pending at Finance. `;this.emailbody=`||Form for the supplier ${h} is approved by the Purchase. Approval pending at Finance. Kindly submit and approve using below link.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/site?siteId=3c32de29-bdc6-438e-95c3-285f3d2e74da&sap-language=en#onboarding-manage?sap-ui-app-id-hint=saas_approuter_sp.fiori.onboarding&/">CLICK HERE</a>  `;this.VendorName="Finance Team";l="ABP";p="Finance";this.msg="Approved by Purchase";c="2"}else{c="2";this.access="COO";this.emailbodyini=`||Form for the supplier ${h} is approved by the Purchase. Approval pending at COO. `;this.emailbody=`||Form for the supplier ${h} is approved by the Purchase. Approval pending at COO. Kindly submit and approve using below link.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/site?siteId=3c32de29-bdc6-438e-95c3-285f3d2e74da&sap-language=en#onboarding-manage?sap-ui-app-id-hint=saas_approuter_sp.fiori.onboarding&/">CLICK HERE</a>  `;this.VendorName="COO Team";l="ABP";p="COO";this.msg="Approved by Purchase"}}else{if(this.SupplierType==="Temporary"||this.SupplierType==="One Time"){this.access="Finance";this.emailbodyini=`||Form for the supplier ${h} is approved by the Purchase. Approval pending at Finance. `;this.emailbody=`||Form for the supplier ${h} is approved by the Purchase. Approval pending at Finance. Kindly submit and approve using below link.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/site?siteId=3c32de29-bdc6-438e-95c3-285f3d2e74da&sap-language=en#onboarding-manage?sap-ui-app-id-hint=saas_approuter_sp.fiori.onboarding&/">CLICK HERE</a>  `;this.VendorName="Finance Team";l="ABP";p="Finance";this.msg="Approved by Purchase";c="2"}else{c="2";this.access="Quality";this.emailbodyini=`||Form for the supplier ${h} is approved by the Purchase. Approval pending at Quality. `;this.emailbody=`||Form for the supplier ${h} is approved by the Purchase. Approval pending at Quality. Kindly submit and approve using below link.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/site?siteId=3c32de29-bdc6-438e-95c3-285f3d2e74da&sap-language=en#onboarding-manage?sap-ui-app-id-hint=saas_approuter_sp.fiori.onboarding&/">CLICK HERE</a>  `;this.VendorName="Quality Team";l="ABP";p="Quality";this.msg="Approved by Purchase"}}}else if(r==="SBC"&&venRelated==="No"){if(d==="Non BOM parts"){c="3"}else{c="4"}this.access="Finance";this.emailbodyini=`||Form for the supplier ${h} is approved by the COO. Approval pending at Finance. `;this.emailbody=`||Form for the supplier ${h} is approved by the COO. Approval pending at Finance. Kindly submit and approve using below link.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/site?siteId=3c32de29-bdc6-438e-95c3-285f3d2e74da&sap-language=en#onboarding-manage?sap-ui-app-id-hint=saas_approuter_sp.fiori.onboarding&/">CLICK HERE</a>  `;this.VendorName="Finance Team";l="ABC";p="Finance";this.msg="Approved by COO"}else if(r==="SBC"&&venRelated==="Yes"){if(d==="Non BOM parts"){c="3"}else{c="4"}this.access="CEO";this.emailbodyini=`||Form for the supplier ${h} is approved by the COO. Approval pending at CEO. `;this.emailbody=`||Form for the supplier ${h} is approved by the COO. Approval pending at CEO. Kindly submit and approve using below link.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/site?siteId=3c32de29-bdc6-438e-95c3-285f3d2e74da&sap-language=en#onboarding-manage?sap-ui-app-id-hint=saas_approuter_sp.fiori.onboarding&/">CLICK HERE</a>  `;this.VendorName="CEO Team";l="ABC";p="CEO";this.msg="Approved by COO"}else if(r==="SBE"&&venRelated==="Yes"){if(d==="Non BOM parts"){c="4"}else{c="5"}this.access="Finance";this.emailbodyini=`||Form for the supplier ${h} is approved by the CEO. Approval pending at Finance. `;this.emailbody=`||Form for the supplier ${h} is approved by the CEO. Approval pending at Finance. Kindly submit and approve using below link.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/site?siteId=3c32de29-bdc6-438e-95c3-285f3d2e74da&sap-language=en#onboarding-manage?sap-ui-app-id-hint=saas_approuter_sp.fiori.onboarding&/">CLICK HERE</a>  `;this.VendorName="Finance Team";l="ABE";p="Finance";this.msg="Approved by CEO"}else if(r==="SBF"){this.access="Supplier";this.emailbodyini=`||Form for the supplier ${h} is approved by the Finance and BP created successfully. `;this.emailbody=`||Form for the supplier ${h} is approved by the Finance and BP created successfully. `;this.VendorName=s.VendorName;l="ABF";s.AddressCode=i.AddressCode;this.msg="Approved by Finance and BP "+s.AddressCode+" created successfully"}s.Status=l;s.VenLevel=c;s.VenApprovalPending=p;s.VenApprove=u;this.initiateName="Initiator";this.getView().getModel().update("/VenOnboard(Vendor='"+s.Vendor+"',VendorId="+this.vendorId+")",s,{success:async()=>{await this.sendApprovalEmailNotification(this.emailbodyini,this.initiateName,this.initiatedBy);if(this.access!=="Supplier"){try{var e=await this.getEmails(this.access);for(const t of e){await this.sendApprovalEmailNotification(this.emailbody,this.VendorName,t);await this.delay(500)}}catch(e){console.error("Error fetching emails: ",e)}}else if(this.access==="Supplier"){this.sendApprovalEmailNotification(this.emailbody,this.VendorName,this.VendorMail)}n.hide();t.success(this.msg,{onClose:()=>this.getData()})},error:e=>{n.hide();console.log(e)}})}},sendApprovalEmailNotification:function(e,t,i){return new Promise((a,s)=>{var o=this.getView().getModel();var n={method:"GET",urlParameters:{vendorName:t,subject:"Supplier Form",content:e,toAddress:i,ccAddress:""},success:function(e,t){console.log("Email sent successfully.");a(e)},error:function(e){console.log("Failed to send email.");s(e)}};o.callFunction("/sendEmail",n)})},getEmails:async function(e){var t=this.getView().getModel();return new Promise((i,a)=>{t.read("/AccessInfo",{filters:[new sap.ui.model.Filter("Access",sap.ui.model.FilterOperator.EQ,e)],success:function(e){var t=e.results.map(e=>e.email);i(t)},error:function(e){a(e)}})})},getFormData:function(){var e=this.getView().getModel("DataModel").getData();var i=this.getView().getModel("FormData").getData();var a=this.getView().getModel("UserApiDetails").getData();if(i.ExciseDivision===null){i.ExciseDivision="-"}if(i.ExciseBankAcc===null){i.ExciseBankAcc="-"}if(i.STRatePerc===null){i.STRatePerc="0"}if(i.JWRWCost===null){i.JWRWCost="0"}if(i.ExciseRange===null){i.ExciseRange="0"}if(i.ExciseBankName===null){i.ExciseBankName="-"}if(i.STRateSurcharge===null){i.STRateSurcharge="0"}if(i.LSTNo===null){i.LSTNo="0"}if(i.GroupCode7===null){i.GroupCode7="/ /"}if(i.Fax===null){i.Fax=""}if(i.LeadTime===null){i.LeadTime=""}if(i.Remarks===null){i.Remarks=""}if(i.Designation===null){i.Designation=""}if(i.DeliveryMode===null){i.DeliveryMode=""}if(i.CustomerCat===null){i.CustomerCat=""}if(i.ExciseDivision===null){i.ExciseDivision=""}if(i.ExciseBankAcc===null){i.ExciseBankAcc=""}if(i.Tin===null){i.Tin=""}if(i.Composite===null){i.Composite=""}if(i.GstNumber===null){i.GstNumber=""}if(i.CreditRating===null){i.CreditRating=""}if(i.CreditRatingAgency===null){i.CreditRatingAgency=""}if(i.ServiceAccType===null){i.ServiceAccType=""}if(i.ECCNo===null){i.ECCNo=""}if(i.CSTDate===null){i.CSTDate=""}if(i.LSTDate===null){i.LSTDate=""}if(i.ExciseNo===null){i.ExciseNo=""}if(i.JWRWCost===null){i.JWRWCost=""}if(i.CompanyType===null){i.CompanyType=""}if(i.ISOExpiryDate===null){i.ISOExpiryDate=""}if(i.AddressType===null){i.AddressType=""}if(i.ExciseRange===null){i.ExciseRange=""}if(i.ExciseBankName===null){i.ExciseBankName=""}if(i.CinNo===null){i.CinNo=""}if(i.GstRegistered===null){i.GstRegistered=""}if(i.GSTDate===null){i.GSTDate=""}if(i.MsmeMainCertificateId===null){i.MsmeMainCertificateId=""}if(i.ServiceAccCode===null){i.ServiceAccCode=""}if(i.STRateSurcharge===null){i.STRateSurcharge=""}if(i.CSTNo===null){i.CSTNo=""}if(i.LSTNo===null){i.LSTNo=""}if(i.Pan===null){i.Pan=""}if(i.ExciseDate===null){i.ExciseDate=""}if(i.GroupingLocation===null){i.GroupingLocation=""}if(i.GroupCode5===null){i.GroupCode5=""}if(i.GroupCode4===null){i.GroupCode4=""}if(i.Transporters===null){i.Transporters=""}if(i.GroupCode8===null){i.GroupCode8=""}if(i.AccountNo===null){i.AccountNo=""}if(i.IFSCCode===null){i.IFSCCode=""}if(i.BeneficiaryName===null){i.BeneficiaryName=""}if(i.BankName===null){i.BankName=""}if(i.BankAddress===null){i.BankAddress=""}if(i.ExciseDuty===null){i.ExciseDuty="0"}if(i.MRPPercentage===null){i.MRPPercentage="0"}if(i.Distance===null){i.Distance="0"}if(i.Tax===null){i.Tax="-"}if(i.DocCode===null){i.DocCode=""}if(i.DocDescription===null){i.DocDescription=""}var s={SupplierType:i.SupplierType,UnitCode:sessionStorage.getItem("unitCode"),AddressCode:i.AddressCode,AddressDesc:i.VendorName,vendorAddress:i.Address1,AccountCode:i.AccountCode,AccountDesc:i.AccountDesc,FaxNo:i.Fax,ContactPerson:i.ContactPersonName,LeadTime:"",Remark:i.Remarks,IAIvendorCode:"",Country:i.Country_code,State:i.State_name,City:i.City_name,Location:i.Location,PinNo:i.Pincode,PhoneNumber:i.Telephone,Email:i.VendorMail,ContactPersonDesgn:i.ContactPersonDesignation,DeliveryMode:"",CustomerCategory:"",ExciseDivision:"-",ExciseBankAccount:"-",StRatePercent:"0",TinNo:i.Tin,Composite:"",GSTRegistartion:i.GstNumber,CreditRating:"",CreditRatingAgency:"",ServiceAccounType:"",ECCNo:"",CSTDate:i.CSTDate,LSTDate:i.LSTDate,ExciseNo:"",JswCost:"0",CompanyType:i.CompanyType,ISOExpiryDate:"",AddressType:i.AddressType,ExciseRange:"0",ExciseBankAccountName:"-",ExciseDuty:"0",CinNo:i.CinNo,GstRegistered:i.GstRegistered,GstDate:i.GSTDate,MSMEType:i.MsmeMainCertificateId,ServiceAccountCode:"",STRateSurCharge:"0",CSTNo:i.CSTNo,LSTNo:"0",PANNo:i.Pan,ExciseDate:"",MRPPercentage:"0",SalesPersonCode:"",DistanceKm:"0",TypeOfSupplier:"",PartyClassification:"sup",GroupingLocation:i.GroupingLocation,GroupCode5:"",GroupCode7:"/ /",Tax:"-",GroupCode4:"",Transporters:"",GroupCode8:"",BankAccountNo:i.AccountNo,IFSCNo:i.IFSCCode,PayeeName:i.BeneficiaryName,BankName:i.BankName,BankAddress:i.BankAddress,ContantInformation:[{ContactName:i.ContactPersonName,ContactDepartment:i.ContactPersonDepartment,ContactAddress:i.ContactPersonDesignation,ContactPhoneNo:i.ContactPersonPhone,ContactMobiloNo:i.ContactPersonMobile,ContactEmail:i.ContactPersonMail,SNo:"1"}],DocumentRequired:[{DocumentCode:"",DocumentDescription:""}],TransMode:"",CreatedBy:"Manikandan",CreatedIP:"",UpdatedBy:""};if(sessionStorage.getItem("isunitaddressexists")===true){s.TransMode="EDIT";s.UpdatedBy=a.email}else{s.TransMode="ADD"}var o=JSON.stringify(s);this.hardcodedURL="";if(window.location.href.includes("site")){this.hardcodedURL=jQuery.sap.getModulePath("sp.fiori.onboarding")}var n=this.hardcodedURL+`/v2/odata/v4/catalog/submitFormData`;$.ajax({type:"POST",headers:{"Content-Type":"application/json"},url:n,data:JSON.stringify({data:o}),context:this,success:function(e,t,i){this.changeStatus()}.bind(this),error:function(e){var i=JSON.parse(e.responseText);t.error(i.error.message.value)}})},onApprPress:function(e){var t=this.getView().getModel("DataModel").getData();var i=e.getSource().getBindingContext("DataModel").sPath.split("/")[1];this.vendorId=t[i].VendorId;var a=t[i].Status;if(a==="SBF"){setTimeout(()=>{this.getView().getModel().read("/VendorForm(VendorId='"+this.vendorId+"')",{success:e=>{this.getView().getModel("FormData").setData(e);n.hide();this.getFormData()},error:()=>{n.hide()}})},1e3)}else{setTimeout(()=>{this.getView().getModel().read("/VendorForm(VendorId='"+this.vendorId+"')",{success:e=>{this.getView().getModel("FormData").setData(e);this.changeStatus()},error:()=>{n.hide()}})},1e3)}},onRejectPress:function(e){var t=this.getView().getModel("DataModel").getData();var i=e.getSource().getBindingContext("DataModel").sPath.split("/")[1];this.vendorId=t[i].VendorId;if(!this.oSubmitDialog){this.oSubmitDialog=new d({title:"Reject Form",type:g.Message,content:[new c({text:"Reason for Rejection",labelFor:"submissionNote"}),new h("submissionNote",{width:"100%",placeholder:"Add reason (required)",liveChange:function(e){var t=e.getParameter("value");this.RejReason=t;this.oSubmitDialog.getBeginButton().setEnabled(t.length>0)}.bind(this)})],beginButton:new l({type:m.Emphasized,text:"Reject",enabled:false,press:function(){this.oSubmitDialog.close();this.onRejPress()}.bind(this)}),endButton:new l({text:"Cancel",press:function(){this.oSubmitDialog.close()}.bind(this)})})}this.oSubmitDialog.open()},onRejPress:function(){var e=this.getView().getModel("DataModel").getData();var i={};for(var a=0;a<e.length;a++){if(e[a].VendorId===this.vendorId){i.Vendor=e[a].Vendor;i.VendorId=e[a].VendorId;i.VendorName=e[a].VendorName;i.VendorType=e[a].VendorType;i.Companycode=e[a].Companycode;i.RegistrationType=e[a].RegistrationType;i.Department=e[a].Department;i.Telephone=e[a].Telephone;i.City=e[a].City;i.VendorMail=e[a].VendorMail;i.VenFrom=new Date;i.VenValidTo=this.changeDate(i.VenFrom,7,"add");i.VenTimeLeft=e[a].VenTimeLeft;i.initiatedBy=e[a].initiatedBy;var s=e[a].Status;i.ResetValidity=e[a].ResetValidity;i.SupplierType=e[a].SupplierType;i.RejReason=this.RejReason;var o=e[a].RegistrationType;var r=e[a].SupplierType;break}}var d="";var l="";var c="";var p="0";if(s==="SBP"){d="RBP";this.msg="Rejected successfully by Purchase Head"}else if(s==="SBQ"){c="Purchase";d="RBQ";l="1";this.msg="Rejected successfully by Quality"}else if(s==="SBC"){c="Purchase";d="RBC";l="1";this.msg="Rejected successfully by COO"}else if(s==="SBE"){c="Purchase";d="RBE";l="1";this.msg="Rejected successfully by CEO"}else if(s==="SBF"){c="Purchase";d="RBF";l="1";this.msg="Rejected successfully by Finance"}i.Status=d;i.VenLevel=l;i.VenApprovalPending=c;i.VenApprove=p;this.VendorName=i.VendorName;this.VendorMail=i.VendorMail;this.VenValidTo=i.VenValidTo;this.venstatus=d;this.getView().getModel().update("/VenOnboard(Vendor='"+i.Vendor+"',VendorId="+this.vendorId+")",i,{success:()=>{t.success(this.msg,{onClose:()=>this.getData()});if(this.venstatus==="RBP"){this.rejemail=`||The form is rejected due to the following reason ${this.RejReason} .Please find the link below for Vendor Assessment Form. Kindly log-in with the link to fill the form.<br><br>Form is valid till ${this.VenValidTo}. Request you to fill the form and submit on time.<br><br><a href="https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/ed7b03c3-9a0c-46b0-b0de-b5b00d211677.onboarding.spfiorisupplierform-0.0.1/index.html?id=${this.vendorId}">CLICK HERE</a>`;this.sendRejEmailNotification(this.rejemail,this.VendorName,this.vendorId,this.VendorMail,this.VenValidTo)}},error:e=>{n.hide();console.log(e)}})},sendRejEmailNotification:function(e,t,i,a,s){var o=this.getView().getModel();var n={method:"GET",urlParameters:{vendorName:t,subject:"Supplier Form",content:e,toAddress:a,ccAddress:""},success:function(e,t){console.log("Email sent successfully.")},error:function(e){console.log("Failed to send email.")}};o.callFunction("/sendEmail",n)}})});