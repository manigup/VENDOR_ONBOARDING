//@ui5-bundle sp/fiori/supplierform/Component-preload.js
jQuery.sap.registerPreloadedModules({
"version":"2.0",
"modules":{
	"sp/fiori/supplierform/Component.js":function(){sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","sp/fiori/supplierform/model/models"],function(e,i,t){"use strict";return e.extend("sp.fiori.supplierform.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.getRouter().initialize();this.setModel(t.createDeviceModel(),"device")}})});
},
	"sp/fiori/supplierform/controller/App.controller.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller"],function(r){"use strict";return r.extend("sp.fiori.supplierform.controller.App",{onInit(){}})});
},
	"sp/fiori/supplierform/controller/MessagePage.controller.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller"],function(e){"use strict";return e.extend("sp.fiori.supplierform.controller.MessagePage",{onInit:function(){this.router=sap.ui.core.UIComponent.getRouterFor(this);this.router.attachRouteMatched(this.handleRouteMatched,this)},handleRouteMatched:function(e){if(e.getParameter("name")!=="invalidUrl"){return}var t=e.getParameter("arguments").status;if(t==="submit"){this.getView().byId("msgPageId").setText("This form link is already submitted")}}})});
},
	"sp/fiori/supplierform/controller/View1.controller.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageBox","sap/ui/core/BusyIndicator","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/DialogType","sap/m/Button","sap/m/ButtonType","sap/m/Input","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/SimpleType","sap/ui/model/ValidateException"],function(e,t,a,i,r,s,o,n,l,d,u,c,h){"use strict";return e.extend("sp.fiori.supplierform.controller.View1",{onInit:function(){sap.ui.getCore().getMessageManager().registerObject(this.getView(),true);this.router=sap.ui.core.UIComponent.getRouterFor(this);this.router.attachRouteMatched(this.handleRouteMatched,this);this.createModel=new i({Otp:"",Werks:"",VenSubType:"DM",Type:"MATERIAL",VenName:"",Purpose:"",Consitution:"",VendorCategory:"",Pan:"",Address1:"",Address2:"",Address3:"",Country:"",State:"",Pincode:"",ContactPerson:"",Mobile:"",Email:"",Landline:"",Fax:"",Website:"",ProductName:"",PaymentTerm:"",GstApplicable:"",ImportExportCode:"",Remarks:"",Currency:"",VAT:"",NameOfService:"",AvailableServiceName:"",NameOfParts:"",AvailablePartsName:"",Others:"",GstNumber:""});this.getView().setModel(this.createModel,"create");var e=this.byId("MsmeValidFrom");e.addEventDelegate({onAfterRendering:()=>{e.$().find("INPUT").attr("disabled",true).css("color","#ccc")}},e);this.byId("MsmeValidTo").attachBrowserEvent("keypress",e=>e.preventDefault())},handleRouteMatched:function(e){if(e.getParameter("name")!=="RouteView1"){return}var t=this.getView().getModel("request").getData();this.id=jQuery.sap.getUriParameters().get("id");setTimeout(()=>{this.getView().getModel().read("/VendorFormSet(Reqnr='"+this.id+"',PropertyName=' ')",{success:e=>{if(t.VenSubType==="DM"){if(!e.GstApplicable){e.GstApplicable="YES"}if(!e.MsmeValidTo){e.MsmeValidTo="99991231"}}if(!e.Type){e.Type="MATERIAL"}if(!e.MsmeItilView&&e.VenSubType==="DM"){e.MsmeItilView="MSME";this.byId("msmeItil").setSelectedIndex(0)}else if(e.MsmeItilView==="Non MSME"){this.byId("msmeItil").setSelectedIndex(1)}if(e.MsmeMainCertificate==="X"){this.byId("msmeCert").setSelected(true)}e.BeneficiaryName=e.VenName;this.createModel.setData(e);this.createModel.refresh(true);if(e.Country){this.countryHelpSelect()}this._setRadioButtons(e);a.hide()},error:()=>{a.hide()}})},1e3)},_showRemainingTime:function(){var e=this;var a=this.getView().getModel("request").getData();var i=a.Date.substring(0,4);var r=parseInt(a.Date.substring(4,6))-1;var s=a.Date.substring(6,8);var o=a.Time.substring(0,2);var n=a.Time.substring(2,4);var l=a.Time.substring(4,6);var d=new Date(i,r,s,o,n,l,"00");var u=a.SDate.substring(0,4);var c=parseInt(a.SDate.substring(4,6))-1;var h=a.SDate.substring(6,8);var m=a.STime.substring(0,2);var p=a.STime.substring(2,4);var b=a.STime.substring(4,6);var f=new Date(u,c,h,m,p,b,"00");var I=setInterval(function(){d=new Date(d-1e3);e.distance=d-f;var i=Math.floor(e.distance/(1e3*60*60*24));var r=Math.floor(e.distance%(1e3*60*60*24)/(1e3*60*60));var s=Math.floor(e.distance%(1e3*60*60)/(1e3*60));var o=Math.floor(e.distance%(1e3*60)/1e3);a.time=i+" Days "+r+" hours "+s+" minute "+o+" seconds ";e.getView().getModel("request").refresh(true);if(e.distance<0){clearInterval(I);a.time="EXPIRED";e.getView().getModel("request").refresh(true);t.error("Form expired");e.getView().byId("saveBtnId").setVisible(false);e.getView().byId("submitBtnId").setVisible(false);return}},1e3)},_setRadioButtons:function(e){if(e.VenSubType==="IP"){this.byId("venTypeRbId").setSelectedIndex(1)}else if(e.VenSubType==="EM"){this.byId("venTypeRbId").setSelectedIndex(2)}if(e.Type==="SERVICE"){this.byId("typeRbId").setSelectedIndex(1)}if(e.Msme==="NO"){this.byId("msmeRbId").setSelectedIndex(1)}if(e.GstApplicable==="NO"){this.byId("gstRbId").setSelectedIndex(1)}},onVenNameChange:function(e){var t=this.createModel.getData();t.BeneficiaryName=e.getSource().getValue();this.createModel.refresh(true)},onRadioButtonSelect:function(e){var t=this.createModel.getData();var a=e.getParameter("id").substring(e.getParameter("id").lastIndexOf("-")+1);var i=e.getParameter("selectedIndex");switch(a){case"venTypeRbId":if(i===1){t.VenSubType="IMPORT"}else if(i===2){t.VenSubType="EMPLOYEE"}else{t.VenSubType="DOMESTIC"}break;case"typeRbId":if(i===1){t.Type="SERVICE"}else{t.Type="MATERIAL"}break;case"gstRbId":if(i===1){t.GstApplicable="NO"}else{t.GstApplicable="YES"}break;case"msmeItil":if(i===0){t.MsmeItilView="MSME"}else{t.MsmeItilView="Non MSME"}break}this.createModel.refresh(true)},_mandatCheck:function(){var e=this.createModel.getData();var t=this.getView().getModel("request").getData();var a=this.getView(),i=false;var r=[a.byId("venNameId"),a.byId("mobileId"),a.byId("purposeId"),a.byId("address1Id"),a.byId("accNoId"),a.byId("bankNameId"),a.byId("ifscId"),a.byId("branchNameId"),a.byId("benNameId"),a.byId("benLocId"),a.byId("address2Id"),a.byId("pincodeId"),a.byId("contactPersonId"),a.byId("contactPersonMobileId")];if(e.GstApplicable==="YES"){r.push(a.byId("gstId"))}var s=[a.byId("constId"),a.byId("countryId"),a.byId("stateId"),a.byId("benAccTypeId")];if(e.MsmeItilView==="MSME"){r.push(a.byId("MsmeCertificateNo"));r.push(a.byId("MsmeValidFrom"));r.push(a.byId("MsmeRegistrationCity"));s.push(a.byId("MsmeCertificateId"))}if(t.VenSubType==="IP"){s.push(a.byId("currId"))}if(t.VenSubType==="DM"||t.VenSubType==="EM"){r.push(a.byId("panId"))}r.forEach(function(e){i=this._validateInput(e)||i},this);s.forEach(function(e){i=this._validateSelect(e,i)||i},this);i=this._validateAttachments(i);if(e.MsmeItilView==="MSME"&&!a.byId("msmeCert").getSelected()){a.byId("msmeCert").setValueState("Error");i=true}return i},_validateInput:function(e){var t,a=e.getBinding("value");try{a.getType().validateValue(e.getValue());e.setValueState("None");t=false}catch(a){e.setValueState("Error");t=true}return t},countryHelpSelect:function(e){var t=this.getView().byId("countryId").getSelectedKey();this.getView().byId("stateId").getBinding("items").filter([new d({path:"Land1",operator:u.EQ,value1:t})])},_validateSelect:function(e,t){var a="None";var i=e.getSelectedKey();try{if(!i){oBinding.getType().validateValue(e.getValue())}}catch(e){a="Error";t=true}e.setValueState(a);return t},_validateAttachments:function(e){var t=this.createModel.getData();if(t.VenSubType==="DM"||t.VenSubType==="IP"){if(this.byId("quotfileUploader").getValue()||t.NewVendorQuotationName){this.byId("quotfileUploader").setValueState("None")}else{e=true;this.byId("quotfileUploader").setValueState("Error")}}if(t.VenSubType==="DM"||t.VenSubType==="IP"){if(this.byId("cocFileUploader").getValue()||t.CocName){this.byId("cocFileUploader").setValueState("None")}else{e=true;this.byId("cocFileUploader").setValueState("Error")}}if(t.VenSubType==="IP"||t.VenSubType==="EM"||t.MsmeItilView==="Non MSME"||this.byId("msmefileUploader").getValue()||t.MsmeDeclarationName){this.byId("msmefileUploader").setValueState("None")}else{e=true;this.byId("msmefileUploader").setValueState("Error")}if(t.VenSubType==="DM"||t.VenSubType==="EM"){if(this.byId("panfileUploader").getValue()||t.PanName){this.byId("panfileUploader").setValueState("None")}else{e=true;this.byId("panfileUploader").setValueState("Error")}}if(t.GstApplicable==="YES"){if(this.byId("gstfileUploader").getValue()||t.GstFileName){this.byId("gstfileUploader").setValueState("None")}else{e=true;this.byId("gstfileUploader").setValueState("Error")}}if(this.byId("canChqfileUploader").getValue()||t.CancelledCheque){this.byId("canChqfileUploader").setValueState("None")}else{e=true;this.byId("canChqfileUploader").setValueState("Error")}return e},onInputChange:function(e,t){this.createModel.getData()[t]=e.getParameter("newValue");this.createModel.refresh},onSavePress:function(e){var i=this.createModel.getData();a.show();setTimeout(()=>{this.getView().getModel().update("/VendorFormSet(Reqnr='"+this.id+"',PropertyName=' ')",i,{headers:{"x-csrf-token":this.csrf_token},success:()=>{a.hide();t.success("Form data saved successfully",{onClose:()=>window.location.reload()})},error:()=>{a.hide()}})},1e3)},onSubmitPress:function(e){var i=this;var r=this._mandatCheck();if(!r){var s=this.createModel.getData();var o=this.getView().getModel("request").getData();if(s.VenSubType==="DM"&&s.GstApplicable==="YES"&&s.Pan!==s.GstNumber.substr(2,10)){t.error("Invalid GSTIN Number. GSTIN does not matches with entered PAN No.");return}a.show();setTimeout(()=>{this.getView().getModel().read("/OTPGetSet(Reqnr='"+this.id+"')",{success:e=>{this.otp=e.Otp;t.information("To submit the data, kindly enter the OTP received on "+o.VenMail,{onClose:()=>this._enterOTP()});a.hide()},error:()=>{a.hide()}})},1e3)}else{t.information("Kindly fill all the required details")}},_enterOTP:function(){var e=this;var i=sap.ui.getCore();var d=this.createModel.getData();if(!this.oSubmitDialog){this.oSubmitDialog=new r({type:s.Message,title:"Enter the OTP Received on your Email",content:[new l("submissionNote",{width:"100%",placeholder:"Enter OTP",liveChange:function(e){var t=e.getParameter("value");this.oSubmitDialog.getButtons()[0].setEnabled(t.length>=6)}.bind(this)})],buttons:[new o({type:n.Emphasized,text:"Submit",enabled:false,press:function(){var e=i.byId("submissionNote").getValue();if(e===this.otp){a.show();d.Otp=e;setTimeout(()=>{this.getView().getModel().update("/VendorFormSet(Reqnr='"+this.id+"',PropertyName=' ')",d,{success:()=>{a.hide();t.success("Form submitted successfully",{onClose:()=>window.location.reload()})},error:()=>{a.hide()}})},1e3);i.byId("submissionNote").setValue();this.oSubmitDialog.close()}else{i.byId("submissionNote").setValue();t.error("Incorrect OTP")}}.bind(this)}),new o({text:"Resend OTP",press:function(){this.onSubmitPress();this.oSubmitDialog.close()}.bind(this)}),new o({type:n.Reject,text:"Cancel",press:function(){this.oSubmitDialog.close()}.bind(this)})]})}this.oSubmitDialog.open()},onFileUploaderChange:function(e){var i=e.getSource();i.setUploadUrl(this.getView().getModel().sServiceUrl+"/VendorFormSet");a.show();var r=i.getCustomData()[0].getKey();i.removeAllHeaderParameters();i.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({name:"slug",value:this.id+"/"+r+"/"+i.getValue()}));i.checkFileReadable().then(()=>{i.upload()},()=>{t.information("The file cannot be read. It may have changed.")})},onUploadComplete:function(e){if(e.getParameter("status")!==201){e.getSource().setValue("");const a=e.getParameter("response");if(a){t.error(a.split(".")[0].split("022")[1]||a)}else{t.error("Error while uploading file")}}else{t.success("File "+e.getSource().getValue()+" uploaded successfully");e.getSource().setValueState("None")}a.hide()},onFileSizeExceded:function(e){t.error("File size exceeds the range of 5MB");e.getSource().setValueState("Error")},onAttachmentGet:function(e){var t=e.getSource().getCustomData()[0].getKey();sap.m.URLHelper.redirect(this.getView().getModel().sServiceUrl+"/VendorFormSet(Reqnr='"+this.id+"',PropertyName='"+t+"')/$value",true)},onMainCertificateChange:function(e){if(e.getParameter("selected")){this.createModel.setProperty("/MsmeMainCertificate","X")}else{this.createModel.setProperty("/MsmeMainCertificate","")}this.createModel.refresh(true)},customPanType:c.extend("Pan",{formatValue:function(e){return e},parseValue:function(e){return e},validateValue:function(e){var t=/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;if(!e.match(t)){throw new h("'"+e+"' is not a valid PAN Number")}}}),customGstType:c.extend("Gst",{formatValue:function(e){return e},parseValue:function(e){return e},validateValue:function(e){var t=/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;if(!e.match(t)){throw new h("'"+e+"' is not a valid GST Number")}}}),customAccountType:c.extend("accountno",{formatValue:function(e){return e},parseValue:function(e){return e},validateValue:function(e){var t=/^[a-zA-Z0-9]+$/;if(!e.match(t)){throw new h("'"+e+"' is not a valid Account Number")}}})})});
},
	"sp/fiori/supplierform/formatter.js":function(){jQuery.sap.declare("formatter");formatter={formatDate:function(t){if(t&&t!=="00000000"){return sap.ui.core.format.DateFormat.getDateInstance({pattern:"MMM dd, yyyy"}).format(new Date(t.substring(4,6)+"/"+t.substring(6,8)+"/"+t.substring(0,4)))}else{return""}},visibleFieldsDom:function(t){if(t==="DM"){return true}return false},visibleFieldsInt:function(t){if(t==="IP"){return true}return false}};
},
	"sp/fiori/supplierform/i18n/i18n.properties":'# This is the resource bundle for sp.fiori.supplierform\n\n#Texts for manifest.json\n\n#XTIT: Application name\nappTitle=Supplier Form\n\n#YDES: Application description\nappDescription=A Fiori application.\n#XTIT: Main view title\ntitle=Supplier Form',
	"sp/fiori/supplierform/manifest.json":'{"_version":"1.49.0","sap.app":{"id":"sp.fiori.supplierform","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"0.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","sourceTemplate":{"id":"@sap/generator-fiori:basic","version":"1.10.6","toolsId":"39cca0a2-10f8-4b75-9230-932f2e31459c"},"dataSources":{"mainService":{"uri":"odata/v4/catalog/","type":"OData","settings":{"annotations":[],"localUri":"localService/metadata.xml","odataVersion":"4.0"}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":true,"dependencies":{"minUI5Version":"1.118.0","libs":{"sap.m":{},"sap.ui.core":{},"sap.f":{},"sap.suite.ui.generic.template":{},"sap.ui.comp":{},"sap.ui.generic.app":{},"sap.ui.table":{},"sap.ushell":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"sp.fiori.supplierform.i18n.i18n"}},"":{"dataSource":"mainService","preload":true,"settings":{"synchronizationMode":"None","operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}},"request":{"type":"sap.ui.model.json.JSONModel"}},"resources":{"css":[{"uri":"css/style.css"}]},"routing":{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","async":true,"viewPath":"sp.fiori.supplierform.view","controlAggregation":"pages","controlId":"app","clearControlAggregation":false},"routes":[{"name":"RouteView1","pattern":":?query:","target":["TargetView1"]},{"name":"invalidUrl","pattern":"InvalidURL/:status:","titleTarget":"","greedy":false,"target":["MessagePage"]}],"targets":{"TargetView1":{"viewType":"XML","transition":"slide","clearControlAggregation":false,"viewId":"View1","viewName":"View1"},"MessagePage":{"viewType":"XML","viewName":"MessagePage"}}},"rootView":{"viewName":"sp.fiori.supplierform.view.App","type":"XML","async":true,"id":"App"}},"sap.cloud":{"public":true,"service":"onboarding"}}',
	"sp/fiori/supplierform/model/models.js":function(){sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,n){"use strict";return{createDeviceModel:function(){var i=new e(n);i.setDefaultBindingMode("OneWay");return i}}});
},
	"sp/fiori/supplierform/view/App.view.xml":'<mvc:View controllerName="sp.fiori.supplierform.controller.App"\n    xmlns:html="http://www.w3.org/1999/xhtml"\n    xmlns:mvc="sap.ui.core.mvc" displayBlock="true"\n    xmlns="sap.m"><App id="app"></App></mvc:View>\n',
	"sp/fiori/supplierform/view/InvalidUrl.view.xml":'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m"><MessagePage showHeader="false" text="Invalid Url" description=" "/></mvc:View>',
	"sp/fiori/supplierform/view/MessagePage.view.xml":'<mvc:View controllerName="sp.fiori.supplierform.controller.MessagePage"\n\txmlns:core="sap.ui.core"\n\txmlns:mvc="sap.ui.core.mvc"\n\txmlns="sap.m"><MessagePage id="msgPageId" showHeader="false" text="Invalid url" icon="sap-icon://message-information" description=" "/></mvc:View>',
	"sp/fiori/supplierform/view/View1.view.xml":'<mvc:View controllerName="sp.fiori.supplierform.controller.View1"\n    xmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:mvc="sap.ui.core.mvc"\n\txmlns:f="sap.ui.layout.form"\n\txmlns:u="sap.ui.unified" class="sapUiSizeCompact"><Page><customHeader><OverflowToolbar><Image src="images/logo.png" height="90%"/><ToolbarSpacer/><Title text="Vendor Creation Form"/><ToolbarSpacer/><FlexBox><core:Icon src="sap-icon://fob-watch" tooltip="watch" color="red" size="1.1rem"/><Label design="Bold" text="Remaining Time -" class="size5 sapUiTinyMarginEnd sapUiTinyMarginBegin"/><Label design="Bold" text="{request>/time}" class="size5"/></FlexBox><ToolbarSpacer/><Button id="saveBtnId" text="Draft" tooltip="Save as Draft" type="Ghost" press="onSavePress"/><Button id="submitBtnId" text="Submit" tooltip="Submit" type="Emphasized" press="onSubmitPress"/></OverflowToolbar></customHeader><content><Panel headerText="General Data" expandable="true" expanded="true"><f:SimpleForm editable="true" layout="ColumnLayout" columnsM="2" columnsL="3" columnsXL="3"><f:content><Label design="Bold" text="Vendor Type" required="true"/><RadioButtonGroup id="venTypeRbId" columns="3" enabled="false"><RadioButton text="Domestic"/><RadioButton text="Import"/><RadioButton text="Employee"/></RadioButtonGroup><Label design="Bold" text="Type" required="true"/><RadioButtonGroup id="typeRbId" columns="2" enabled="true" select="onRadioButtonSelect"><RadioButton text="Material"/><RadioButton text="Service"/></RadioButtonGroup><Label design="Bold" text="Vendor Name" required="true"/><Input id="venNameId" change="onVenNameChange" maxLength="40" value="{path:\'create>/VenName\',type:\'sap.ui.model.type.String\',constraints:{minLength: 1}}"/><Label design="Bold" text="Vendor Name 2"/><Input id="venName2Id" maxLength="40" value="{path:\'create>/VenName2\',type:\'sap.ui.model.type.String\'}"/><Label design="Bold" text="Vendor Name 3"/><Input id="venName3Id" maxLength="40" value="{path:\'create>/VenName3\',type:\'sap.ui.model.type.String\'}"/><Label design="Bold" text="Vendor Mobile Number" required="true"/><Input id="mobileId" value="{path:\'create>/Mobile\',type:\'sap.ui.model.type.String\',constraints:{minLength:10,maxLength:10}}"/><Label design="Bold" text="Program/Purpose" required="true"/><Input id="purposeId" value="{path:\'create>/Purpose\',type:\'sap.ui.model.type.String\',constraints:{minLength: 1}}"/><Label design="Bold" text="Constitution of Business" required="true"/><Select id="constId" forceSelection="false" selectedKey="{create>/Consitution}" items="{/ConstitutionHelpSet}"><core:Item key="{Constitution}" text="{Constitution}"/></Select><Label design="Bold" text="Address 1" required="true"/><Input id="address1Id" maxLength="60" value="{path:\'create>/Address1\',type:\'sap.ui.model.type.String\',constraints:{minLength:1,maxLength:60}}"/><Label design="Bold" text="Address 2" required="true"/><Input id="address2Id" maxLength="40" value="{path:\'create>/Address2\',type:\'sap.ui.model.type.String\',constraints:{minLength:1, maxLength:40}}"/><Label design="Bold" text="Address 3"/><Input value="{path:\'create>/Address3\',type:\'sap.ui.model.type.String\',constraints:{minLength:0, maxLength:40}}" maxLength="40"/><Label design="Bold" text="City"/><Input maxLength="20" value="{create>/City}"/><Label design="Bold" text="Country" required="true"/><ComboBox id="countryId" items="{path:\'/CountryHelpSet\', length:260}" selectedKey="{create>/Country}" change="countryHelpSelect"><core:Item key="{Land1}" text="{Landx}"/></ComboBox><Label design="Bold" text="State" required="true"/><Select id="stateId" forceSelection="false" selectedKey="{create>/Region}" items="{/StateHelpSet}"><core:Item key="{Region}" text="{Bezei}"/></Select><Label design="Bold" text="District"/><Input value="{create>/District}"/><Label design="Bold" text="City Postal Code" required="true"/><Input id="pincodeId" type="Number" value="{path:\'create>/Pincode\',type:\'sap.ui.model.type.String\',constraints:{minLength:1,maxLength:7}}"/><Label design="Bold" text="Contact Person Name" required="true"/><Input id="contactPersonId" value="{path:\'create>/ContactPerson\',type:\'sap.ui.model.type.String\',constraints:{minLength:1}}"/><Label design="Bold" text="Contact Person Mobile Number" required="true"/><Input id="contactPersonMobileId" value="{path:\'create>/AlternateMobile\',type:\'sap.ui.model.type.String\',constraints:{minLength:10,maxLength:10}}"/><Label design="Bold" text="Email" required="true"/><Input enabled="false" value="{path:\'create>/Email\'}" type="Email"/><Label design="Bold" text="Landline Number"/><Input placeholder="Number" value="{create>/Landline}"/><Input placeholder="Extension" value="{create>/Extension}"/><Label design="Bold" text="Fax"/><Input value="{create>/Fax}"/><Label design="Bold" text="Website"/><Input value="{create>/Website}"/><Label design="Bold" text="Remarks"/><TextArea id="remarksId" value="{path:\'create>/Remarks\',type:\'sap.ui.model.type.String\',constraints:{minLength: 1}}"/><Label design="Bold" text="ITIL Comments"/><TextArea enabled="false" value="{create>/Comments}"/></f:content></f:SimpleForm></Panel><Panel headerText="Finance Data" expandable="true"><f:SimpleForm editable="true" layout="ColumnLayout" columnsM="2" columnsL="3" columnsXL="3"><f:content><Label design="Bold" text="MSME ITIL View"/><RadioButtonGroup columns="2" id="msmeItil" select="onRadioButtonSelect" visible="{= ${request>/VenSubType} === \'DM\'}"><RadioButton text="MSME"/><RadioButton text="Non-MSME"/></RadioButtonGroup><Label design="Bold" text="MSME Main Certificate" required="true"/><CheckBox id="msmeCert" select="onMainCertificateChange" visible="{= ${request>/VenSubType} === \'DM\' &amp;&amp; ${create>/MsmeItilView} === \'MSME\'}"/><Label design="Bold" text="MSME Certificate ID" required="true"/><Select id="MsmeCertificateId" showSecondaryValues= "true" forceSelection="false" selectedKey="{create>/MsmeCertificateId}" visible="{= ${request>/VenSubType} === \'DM\' &amp;&amp; ${create>/MsmeItilView} === \'MSME\'}"><core:Item key="INMED" text="Medium"/><core:Item key="INMIC" text="Micro"/><core:Item key="INSML" text="Small"/></Select><Label design="Bold" text="MSME Certification No." required="true"/><Input id="MsmeCertificateNo" value="{path:\'create>/MsmeCertificateNo\',type:\'sap.ui.model.type.String\',constraints:{minLength: 1}}" visible="{= ${request>/VenSubType} === \'DM\' &amp;&amp; ${create>/MsmeItilView} === \'MSME\'}"/><Label design="Bold" text="MSME Valid From" required="true"/><DatePicker id="MsmeValidFrom" value="{path:\'create>/MsmeValidFrom\',type:\'sap.ui.model.type.String\',constraints:{minLength: 1}}" valueFormat="yyyyMMdd" visible="{= ${request>/VenSubType} === \'DM\' &amp;&amp; ${create>/MsmeItilView} === \'MSME\'}"/><Label design="Bold" text="MSME Valid Up To" required="true"/><DatePicker id="MsmeValidTo" value="{create>/MsmeValidTo}" valueFormat="yyyyMMdd" visible="{= ${request>/VenSubType} === \'DM\' &amp;&amp; ${create>/MsmeItilView} === \'MSME\'}"/><Label design="Bold" text="MSME Registration City" required="true"/><Input id="MsmeRegistrationCity" value="{path:\'create>/MsmeRegistrationCity\',type:\'sap.ui.model.type.String\',constraints:{minLength: 1}}" visible="{= ${request>/VenSubType} === \'DM\' &amp;&amp; ${create>/MsmeItilView} === \'MSME\'}"/><Label design="Bold" text="Upload MSME Certificate" required="true"/><u:FileUploader id="msmefileUploader" sendXHR="true" useMultipart="false" uploadComplete="onUploadComplete" buttonText="Browse" fileSizeExceed="onFileSizeExceded" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" change="onFileUploaderChange" maximumFileSize="5MB" visible="{= ${request>/VenSubType} === \'DM\' &amp;&amp; ${create>/MsmeItilView} === \'MSME\'}"><u:customData><core:CustomData key="UMD"/></u:customData></u:FileUploader><Link id="msmefileUploadLink" text="{create>/MsmeDeclarationName}" press="onAttachmentGet" visible="{= ${request>/VenSubType} === \'DM\' &amp;&amp; ${create>/MsmeDeclarationName} !== \'\'}"><customData><core:CustomData key="UMD"/></customData></Link><Label design="Bold" text="PAN Number" required="true"/><Input id="panId" placeholder="Enter PAN Number (Eg: ABCDE1234Z)" change="onInputChange($event,\'Pan\')" value="{path:\'create>/Pan\',type: \'.customPanType\'}" visible="{= ${request>/VenSubType} === \'DM\' || ${request>/VenSubType} === \'EM\'}"/><Label design="Bold" text="Upload PAN" required="true"/><u:FileUploader id="panfileUploader" sendXHR="true" useMultipart="false" uploadComplete="onUploadComplete" buttonText="Browse" fileSizeExceed="onFileSizeExceded" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" change="onFileUploaderChange" maximumFileSize="5MB" visible="{= ${request>/VenSubType} === \'DM\' || ${request>/VenSubType} === \'EM\'}"><u:customData><core:CustomData key="PAN"/></u:customData></u:FileUploader><Link id="panfileUploadLink" text="{create>/PanName}" press="onAttachmentGet" visible="{= ${request>/VenSubType} === \'DM\' || ${request>/VenSubType} === \'EM\' &amp;&amp; ${create>/PanName} !== \'\'}"><customData><core:CustomData key="PAN"/></customData></Link><Label design="Bold" text="TAN Number"/><Input id="tanId" placeholder="Enter TAN Number" value="{path:\'create>/Tan\',type : \'sap.ui.model.type.String\', constraints : { minLength: 1, maxLength: 10} }" visible="{path:\'request>/VenSubType\',formatter:\'formatter.visibleFieldsDom\'}"/><Label design="Bold" text="GST Applicable" required="true"/><RadioButtonGroup id="gstRbId" columns="2" select="onRadioButtonSelect" visible="{path:\'request>/VenSubType\',formatter:\'formatter.visibleFieldsDom\'}"><RadioButton text="Yes"/><RadioButton text="No"/></RadioButtonGroup><Label design="Bold" text="GSTIN" required="true"/><Input id="gstId" placeholder="Enter GST Number (Eg: 29ABCDE1234ZXXX)" change="onInputChange($event,\'GstNumber\')" value="{path:\'create>/GstNumber\',type: \'.customGstType\'}" visible="{= ${create>/GstApplicable} === \'YES\'}"/><Label design="Bold" text="Upload GSTIN" required="true"/><u:FileUploader id="gstfileUploader" sendXHR="true" useMultipart="false" uploadComplete="onUploadComplete" buttonText="Browse" fileSizeExceed="onFileSizeExceded" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" change="onFileUploaderChange" maximumFileSize="5MB" visible="{= ${create>/GstApplicable} === \'YES\'}"><u:customData><core:CustomData key="GA"/></u:customData></u:FileUploader><Link id="gstfileUploadLink" text="{create>/GstFileName}" press="onAttachmentGet" visible="{= ${create>/GstApplicable} === \'YES\' &amp;&amp; ${create>/GstFileName} !== \'\'}"><customData><core:CustomData key="GA"/></customData></Link><Label design="Bold" text="Currency" required="true"/><ComboBox id="currId" selectedKey="{create>/Currency}" items="{path:\'/CurrencySet\',length:250}" showSecondaryValues="true" visible="{path:\'request>/VenSubType\',formatter:\'formatter.visibleFieldsInt\'}"><core:ListItem key="{Waers}" text="{Ktext}" additionalText="{Waers}"/></ComboBox><Label design="Bold" text="VAT ID/EORI Number"/><Input placeholder="Enter VAT ID/EORI Number" value="{create>/VAT}" visible="{path:\'request>/VenSubType\',formatter:\'formatter.visibleFieldsInt\'}"/><Label design="Bold" text="Import/Export Code"/><Input placeholder="Enter Import/Export Code" value="{create>/ImportExportCode}"/><Label design="Bold" text="Bank Name" required="true"/><Input id="bankNameId" value="{path:\'create>/BankName\',type:\'sap.ui.model.type.String\',constraints :{minLength:1}}"/><Label design="Bold" text="Account No." required="true"/><Input id="accNoId" maxLength="18" value="{path:\'create>/AccountNo\',type:\'.customAccountType\',constraints:{minLength:1,maxLength:18}}"/><Label design="Bold" text="Beneficiary Name" required="true"/><Input id="benNameId" enabled="false" value="{path:\'create>/BeneficiaryName\',type:\'sap.ui.model.type.String\',constraints:{minLength:1}}"/><Label design="Bold" text="Beneficiary A/C Type" required="true"/><Select id="benAccTypeId" forceSelection="false" selectedKey="{create>/AccountType}"><core:Item key="SAVINGS" text="Savings"/><core:Item key="CURRENT" text="Current"/></Select><Label design="Bold" text="IFSC/Swift Code" required="true"/><Input id="ifscId" value="{ path : \'create>/IFSCCode\', type:\'sap.ui.model.type.String\',constraints:{minLength:1}}"/><Label design="Bold" text="Branch Name" required="true"/><Input id="branchNameId" value="{path:\'create>/BranchName\',type:\'sap.ui.model.type.String\',constraints:{minLength:1}}"/><Label design="Bold" text="Beneficiary Bank Location" required="true"/><Input id="benLocId" value="{path:\'create>/BeneficiaryLocation\',type:\'sap.ui.model.type.String\',constraints:{minLength:1}}"/><Label design="Bold" text="Cancelled Cheque &amp; Declaration" required="true"/><u:FileUploader id="canChqfileUploader" sendXHR="true" useMultipart="false" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileSizeExceed="onFileSizeExceded" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse"><u:customData><core:CustomData key="CHQ"/></u:customData></u:FileUploader><Link id="canChqfileUploadLink" text="{create>/CancelledCheque}" visible="{= ${create>/CancelledCheque} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="CHQ"/></customData></Link></f:content></f:SimpleForm></Panel><Panel headerText="Attachments" expandable="true"><f:SimpleForm editable="true" layout="ColumnLayout" columnsM="2" columnsL="3" columnsXL="3"><f:content><Label design="Bold" text="New Vendor Quotation" required="{= ${request>/VenSubType} === \'DM\' || ${request>/VenSubType} === \'IP\'}"/><u:FileUploader id="quotfileUploader" sendXHR="true" useMultipart="false" change="onFileUploaderChange" uploadComplete="onUploadComplete" buttonText="Browse" fileSizeExceed="onFileSizeExceded" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB"><u:customData><core:CustomData key="NVQ"/></u:customData></u:FileUploader><Link text="{create>/NewVendorQuotationName}" visible="{= ${create>/NewVendorQuotationName} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="NVQ"/></customData></Link><Label design="Bold" text="NDA Attachment"/><u:FileUploader sendXHR="true" useMultipart="false" fileSizeExceed="onFileSizeExceded" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse"><u:customData><core:CustomData key="NDA"/></u:customData></u:FileUploader><Link text="{create>/NdaName}" visible="{= ${create>/NdaName} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="NDA"/></customData></Link><Label design="Bold" text="Code of Conduct" required="{= ${request>/VenSubType} === \'DM\' || ${request>/VenSubType} === \'IP\'}"/><u:FileUploader id="cocFileUploader" sendXHR="true" useMultipart="false" fileSizeExceed="onFileSizeExceded" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse"><u:customData><core:CustomData key="COC"/></u:customData></u:FileUploader><Link text="{create>/CocName}" visible="{= ${create>/CocName} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="COC"/></customData></Link><Label design="Bold" text="Agreement Copy"/><u:FileUploader sendXHR="true" useMultipart="false" fileSizeExceed="onFileSizeExceded" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse"><u:customData><core:CustomData key="AC"/></u:customData></u:FileUploader><Link text="{create>/AgreementName}" visible="{= ${create>/AgreementName} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="AC"/></customData></Link><Label design="Bold" text="Project Appropriation Ref"/><u:FileUploader sendXHR="true" useMultipart="false" fileSizeExceed="onFileSizeExceded" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse"><u:customData><core:CustomData key="PAR"/></u:customData></u:FileUploader><Link text="{create>/ProjectAppropriationName}" visible="{= ${create>/ProjectAppropriationName} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="PAR"/></customData></Link><Label design="Bold" text="Related Email Exchanges"/><u:FileUploader sendXHR="true" useMultipart="false" fileSizeExceed="onFileSizeExceded" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse"><u:customData><core:CustomData key="REE"/></u:customData></u:FileUploader><Link text="{create>/RelatedEmailName}" visible="{= ${create>/RelatedEmailName} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="REE"/></customData></Link><Label design="Bold" text="Tax Residency Certificate"/><u:FileUploader sendXHR="true" useMultipart="false" fileSizeExceed="onFileSizeExceded" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse" visible="{path:\'request>/VenSubType\',formatter:\'formatter.visibleFieldsInt\'}"><u:customData><core:CustomData key="TRC"/></u:customData></u:FileUploader><Link text="{create>/TaxResidencyCertificate}" visible="{= ${create>/TaxResidencyCertificate} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="TRC"/></customData></Link><Label design="Bold" text="Form 10F"/><u:FileUploader sendXHR="true" useMultipart="false" fileSizeExceed="onFileSizeExceded" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse" visible="{path:\'request>/VenSubType\',formatter:\'formatter.visibleFieldsInt\'}"><u:customData><core:CustomData key="F10"/></u:customData></u:FileUploader><Link text="{create>/Form10F}" visible="{= ${create>/Form10F} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="F10"/></customData></Link><Label design="Bold" text="No PE Establishment Certificate"/><u:FileUploader sendXHR="true" useMultipart="false" fileSizeExceed="onFileSizeExceded" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse" visible="{path:\'request>/VenSubType\',formatter:\'formatter.visibleFieldsInt\'}"><u:customData><core:CustomData key="PEC"/></u:customData></u:FileUploader><Link text="{create>/EstablishmentCertificate}" visible="{= ${create>/EstablishmentCertificate} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="PEC"/></customData></Link><Label design="Bold" text="Lower Deduction Certificate"/><u:FileUploader sendXHR="true" useMultipart="false" fileSizeExceed="onFileSizeExceded" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse" visible="{path:\'request>/VenSubType\',formatter:\'formatter.visibleFieldsInt\'}"><u:customData><core:CustomData key="LDC"/></u:customData></u:FileUploader><Link text="{create>/DeductionCertificate}" visible="{= ${create>/DeductionCertificate} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="LDC"/></customData></Link><Label design="Bold" text="Other Document"/><u:FileUploader sendXHR="true" useMultipart="false" fileSizeExceed="onFileSizeExceded" uploadComplete="onUploadComplete" change="onFileUploaderChange" fileType="jpg,jpeg,msg,pdf,docx,doc,ppt,pptx,ost" maximumFileSize="5MB" buttonText="Browse" visible="{path:\'request>/VenSubType\',formatter:\'formatter.visibleFieldsInt\'}"><u:customData><core:CustomData key="OTH"/></u:customData></u:FileUploader><Link text="{create>/OtherDocument}" tooltip="" visible="{= ${create>/OtherDocument} !== \'\'}" press="onAttachmentGet"><customData><core:CustomData key="OTH"/></customData></Link></f:content></f:SimpleForm></Panel></content></Page></mvc:View>\n'
}});
