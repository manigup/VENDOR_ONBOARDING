//@ui5-bundle sp/fiori/onboarding/Component-preload.js
jQuery.sap.registerPreloadedModules({
"version":"2.0",
"modules":{
	"sp/fiori/onboarding/Component.js":function(){sap.ui.define(["sap/ui/core/UIComponent","sp/fiori/onboarding/formatter","sap/ui/core/routing/HashChanger","sap/m/MessageBox"],function(e,r,t,a){"use strict";return e.extend("sp.fiori.onboarding.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.getModel().metadataLoaded(true).then(()=>{t.getInstance().replaceHash("");this.getRouter().initialize()}).catch(e=>this.handleError(e.responseText));this.getModel().attachRequestFailed(e=>this.handleError(e.getParameter("response").responseText))},handleError:function(e){if(e.indexOf("<?xml")!==-1){a.error($($.parseXML(e)).find("message").text())}else if(e.indexOf("{")!==-1){var r=JSON.parse(e);a.error(r.message||r.error.message.value)}else{a.error(e)}}})});
},
	"sp/fiori/onboarding/controller/BaseController.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/ValidateException","sap/m/StandardListItem","sap/ui/model/SimpleType"],function(e,t,a,r){"use strict";return e.extend("sp.fiori.vendoronboarding.controller.BaseController",{getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},onF4HelpRequest:function(e){this.f4Source=e.getSource();this.oTemplate=new a({title:"{Supplier}",description:"{SupplierName}"});this.f4Help("Select Vendor","/SupplierHelpSet")},f4Help:function(e,t){var a=sap.ui.xmlfragment("sp.fiori.vendoronboarding.fragment.F4Help",this);this.getView().addDependent(a);sap.ui.getCore().byId("F4Help").setTitle(e);sap.ui.getCore().byId("F4Help").bindAggregation("items",{path:t,filters:[new sap.ui.model.Filter("Bukrs","EQ",sessionStorage.getItem("compCode")||"1000")],template:this.oTemplate});a.open()},onF4HelpSearch:function(e){var t=e.getParameter("value");var a=e.getSource().getBinding("items").getPath();var r=a.includes("?search")?a.split("?search")[0]:a.split("&search")[0];sap.ui.getCore().byId("F4Help").bindAggregation("items",{path:r,filters:[new sap.ui.model.Filter("Bukrs","EQ",sessionStorage.getItem("compCode")||"1000")],parameters:{custom:{search:t}},template:this.oTemplate})},onF4HelpConfirm:function(e){e.getSource().destroy();this.f4Source.setValue(e.getParameter("selectedItem").getTitle());sap.ui.getCore().byId("venName").setValue(e.getParameter("selectedItem").getDescription())},onF4HelpClose:function(e){e.getSource().destroy()},onDialogCancel:function(e){e.getSource().getParent().destroy()},onDialogEscapeHandler:function(e){e.reject()},onPopOverAfterClose:function(e){e.getSource().destroy()},onPopOverClosePress:function(e){e.getSource().getParent().getParent().destroy()},customEMailType:r.extend("email",{formatValue:function(e){return e},parseValue:function(e){return e},validateValue:function(e){var a=/^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;if(!e.match(a)){throw new t("'"+e+"' is not a valid e-mail address")}}}),validateFields:function(){this.validateResults=[];sap.ui.getCore().byId("createDialog").getControlsByFieldGroupId("required").forEach(e=>{console.log(e.getMetadata().getElementName());switch(e.getMetadata().getElementName()){case"sap.m.Select":this.showError(e,"selectedKey",e.getSelectedKey());break;case"sap.m.Input":case"sap.m.TextArea":this.showError(e,"value",e.getValue());break;case"sap.ui.unified.FileUploader":this.showErrorAttach(e,e.getValue());break}});if(this.validateResults.every(e=>e===true))return true;else return false},showError:function(e,t,a){if(e.getVisible()){try{var r=e.getBinding(t);r.getType().validateValue(a);e.setValueState("None");this.validateResults.push(true)}catch(t){e.setValueState("Error");e.setValueStateText(t.message);this.validateResults.push(false)}}else{e.setValueState("None")}},showErrorAttach:function(e,t){if(e.getVisible()&&!t){try{var a=e.getBinding(binding);a.getType().validateValue(t);e.setValueState("None");this.validateResults.push(true)}catch(t){e.setValueState("Error");this.validateResults.push(false)}}else{e.setValueState("None")}}})});
},
	"sp/fiori/onboarding/controller/List.controller.js":function(){sap.ui.define(["./BaseController","sap/m/MessageBox","sap/ui/model/Filter","sap/ui/core/BusyIndicator","sap/ui/model/json/JSONModel"],function(e,t,r,i,a){"use strict";return e.extend("sp.fiori.onboarding.controller.List",{onInit:function(){this.getRouter().attachRoutePatternMatched(this.onRouteMatched,this);["createFromDateId","createToDateId"].forEach(e=>{this.byId(e).attachBrowserEvent("keypress",e=>e.preventDefault())})},onRouteMatched:function(e){if(e.getParameter("name")!=="list"){return}this.getView().setModel(new a([]),"DataModel");this.getData()},getData:function(){i.show();setTimeout(()=>{var e=this.getView().getModel("request").getData();this.getView().getModel().read("/EmpRoleSet",{success:t=>{var r;for(var i=0;i<t.results.length;i++){r=t.results[i].Access.toUpperCase();if(r==="BUYER"){e.buyer=true}else if(r==="FINANCE"){e.finance=true}else if(r==="LEGAL"){e.legal=true}else if(r==="VALIDITY RESET"){e.reset=true}}this.getView().getModel("request").refresh(true)},error:()=>i.hide()});this.getView().getModel().read("/VenOnboardHeaderSet",{success:e=>{e.results.map(e=>{e.StatusText=formatter.formatStatus(e.Status);e.WavStatusText=formatter.formatStatus(e.WavStatus);parseInt(e.Score);return e});this.getView().getModel("DataModel").setData(e.results);this.getView().getModel("DataModel").setSizeLimit(e.results.length);this.getView().getModel("DataModel").refresh(true);i.hide()},error:()=>i.hide()})},1e3)},onSearch:function(e){var t=e.getParameter("query");if(e.getParameter("refreshButtonPressed")){this.getData()}else if(t){this.byId("createFromDateId").setValue("");this.byId("createToDateId").setValue("");this.byId("vendorList").getBinding("items").filter([new r([new r("Vendor",sap.ui.model.FilterOperator.Contains,t),new r("VenName",sap.ui.model.FilterOperator.Contains,t),new r("Lifnr",sap.ui.model.FilterOperator.Contains,t),new r("ApprovalPending",sap.ui.model.FilterOperator.Contains,t),new r("StatusText",sap.ui.model.FilterOperator.Contains,t)])])}else{this.byId("vendorList").getBinding("items").filter([])}},onCreationDateFilter:function(){var e=this.byId("createFromDateId").getValue(),t=this.byId("createToDateId").getValue();if(e&&t){this.byId("vendorList").getBinding("items").filter([new r([new r("CreatedOn",sap.ui.model.FilterOperator.BT,e,t)])])}else if(e){this.byId("vendorList").getBinding("items").filter([new r([new r("CreatedOn",sap.ui.model.FilterOperator.EQ,e)])])}else if(t){this.byId("vendorList").getBinding("items").filter([new r([new r("CreatedOn",sap.ui.model.FilterOperator.LE,t)])])}else{this.byId("vendorList").getBinding("items").filter([])}this.byId("search").setValue("")},onCreatePress:function(){var e=sap.ui.xmlfragment("sp.fiori.onboarding.fragment.Create",this);this.getView().addDependent(e);sap.ui.getCore().byId("createDialog").setModel(new a({}),"CreateModel");e.open()},onCreateSubmit:function(e){if(this.validateFields()){i.show();setTimeout(()=>{this.getView().getModel().create("/VenOnboardHeaderSet",sap.ui.getCore().byId("createDialog").getModel("CreateModel").getData(),{success:e=>{i.hide();t.success("Vendor Creation Request "+e.Vendor+" created successfully",{onClose:()=>{sap.ui.getCore().byId("createDialog").destroy();this.getData()}})},error:()=>i.hide()})},1e3)}else{t.error("Please correct all the error's to proceed")}}})});
},
	"sp/fiori/onboarding/formatter.js":function(){jQuery.sap.declare("formatter");formatter={onNavBack:function(){var e=sap.ui.core.routing.History.getInstance();var r=e.getPreviousHash();if(r!==undefined){window.history.go(-1)}else{sap.ui.core.UIComponent.getRouterFor(this).navTo("list")}},formatDate:function(e){if(e&&e!=="00000000"){return sap.ui.core.format.DateFormat.getDateInstance({pattern:"MMM dd, yyyy"}).format(new Date(e.substring(4,6)+"/"+e.substring(6,8)+"/"+e.substring(0,4)))}else{return""}},formatTime:function(e){if(e){return e.substring(0,2)+":"+e.substring(2,4)+":"+e.substring(4,6)}else{return""}},formatStatus:function(e){var r="";if(e){switch(e){case"PAP":r="Partially Approved";break;case"SFA":r="Sent for Approval";break;case"SBS":r="Submited by Supplier";break;case"SBB":r="Submitted by Buyer";break;case"SBF":r="Submitted by Finance";break;case"SCC":r="Supplier Code Created";break;case"BRE-ROUTE":r="Re-Routed to Buyer";break;case"SRE-ROUTE":r="Re-Routed to Supplier";break;case"FRE-ROUTE":r="Re-Routed to Finance";break;case"CREATED":r="Request Initiated";break;case"APPROVED":r="Approved";break;case"REJECTED":r="Rejected";break}}return r},statusState:function(e){var r="None";if(e){switch(e){case"SBS":case"SBB":case"SBF":case"INITIATED":case"SAQ_SENT":r="Information";break;case"PAP":case"SFA":case"SAQ_APROVE":case"BRE-ROUTE":case"SRE-ROUTE":case"FRE-ROUTE":r="Warning";break;case"REJECTED":r="Error";break;case"SCC":r="Success";break;default:r="None";break}}return r},formatVendorSubType:function(e){var r="";if(e){switch(e){case"DM":r="Domestic";break;case"IP":r="Import";break;case"EM":r="Employee Vendor";break}}return r},levelState:function(e,r){var t="None";if(e){if(parseInt(e)===0){t="None"}else if(parseInt(e)>0&&!r){t="Warning"}else{t="Success"}}return t},visibleFieldsDom:function(e){if(e==="DM"){return true}return false},visibleFieldsInt:function(e){if(e==="IP"){return true}return false},addVendorColor:function(e,r){r==="X"?this.addStyleClass("resetValidity"):this.removeStyleClass("resetValidity");return e}};
},
	"sp/fiori/onboarding/fragment/Create.fragment.xml":'<Dialog\n    id="createDialog"\n    title="Create Supplier"\n    titleAlignment="Center"\n    xmlns:f="sap.ui.layout.form"\n    xmlns:core="sap.ui.core"\n    xmlns="sap.m"\n    draggable="true"\n    escapeHandler=".onDialogEscapeHandler"\n    contentWidth="320px"\n    class="sapUiSizeCompact"\n><content><f:SimpleForm\n            id="_IDGenSimpleForm1"\n            editable="true"\n            layout="ResponsiveGridLayout"\n        ><Label\n                id="_IDGenLabel1"\n                design="Bold"\n                required="true"\n                text="Supplier Sub-Type"\n            /><Select\n                id="_IDGenSelect1"\n                forceSelection="false"\n                selectedKey="{path:\'CreateModel>/VenSubType\',type:\'sap.ui.model.type.String\',constraints:{minLength:2}}"\n                valueStateText="Required"\n                fieldGroupIds="required"\n            ><core:Item\n                    id="_IDGenItem1"\n                    key=""\n                    text=""\n                /><core:Item\n                    id="_IDGenItem2"\n                    key="DM"\n                    text="Domestic"\n                /><core:Item\n                    id="_IDGenItem3"\n                    key="IP"\n                    text="Import"\n                /><core:Item\n                    id="_IDGenItem4"\n                    key="EM"\n                    text="Employee"\n                /></Select><Label\n                id="_IDGenLabel2"\n                design="Bold"\n                required="true"\n                text="Supplier Name"\n            /><Input\n                id="_IDGenInput1"\n                value="{path:\'CreateModel>/VenName\',type:\'sap.ui.model.type.String\',constraints:{minLength:1}}"\n                valueStateText="Required"\n                fieldGroupIds="required"\n            /><Label\n                id="_IDGenLabel3"\n                design="Bold"\n                required="true"\n                text="Department"\n            /><Input\n                id="_IDGenInput2"\n                value="{path:\'CreateModel>/Dept\',type:\'sap.ui.model.type.String\',constraints:{minLength:1}}"\n                valueStateText="Required"\n                fieldGroupIds="required"\n            /><Label\n                id="_IDGenLabel4"\n                design="Bold"\n                required="true"\n                text="Telephone No."\n            /><Input\n                id="_IDGenInput3"\n                type="Number"\n                value="{path:\'CreateModel>/VenTel\',type:\'sap.ui.model.type.String\',constraints:{minLength: 10,maxLength:10}}"\n                valueStateText="Required"\n                fieldGroupIds="required"\n            /><Label\n                id="_IDGenLabel5"\n                design="Bold"\n                required="true"\n                text="City"\n            /><Input\n                id="_IDGenInput4"\n                value="{path:\'CreateModel>/City\',type:\'sap.ui.model.type.String\',constraints:{minLength:1}}"\n                valueStateText="Required"\n                fieldGroupIds="required"\n            /><Label\n                id="_IDGenLabel6"\n                design="Bold"\n                required="true"\n                text="Supplier Email"\n            /><Input\n                id="_IDGenInput5"\n                value="{path:\'CreateModel>/VenMail\',type:\'.customEMailType\'}"\n                valueStateText="Required"\n                fieldGroupIds="required"\n            /></f:SimpleForm></content><beginButton><Button\n            id="_IDGenButton1"\n            type="Emphasized"\n            text="Submit"\n            press="onCreateSubmit"\n        /></beginButton><endButton><Button\n            id="_IDGenButton2"\n            type="Reject"\n            text="Cancel"\n            press="onDialogCancel"\n        /></endButton></Dialog>\n',
	"sp/fiori/onboarding/i18n/i18n.properties":'# This is the resource bundle for sp.fiori.onboarding\n\n#Texts for manifest.json\n\n#XTIT: Application name\nappTitle=Vendor Onboarding\n\n#YDES: Application description\nappDescription=A Fiori application.\n#XTIT: Main view title\ntitle=Vendor Onboarding\n\nflpTitle=Vendor Onboarding\n\nflpSubtitle=\n',
	"sp/fiori/onboarding/manifest.json":'{"_version":"1.49.0","sap.app":{"id":"sp.fiori.onboarding","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"0.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","sourceTemplate":{"id":"@sap/generator-fiori:basic","version":"1.10.6","toolsId":"dc12caaf-b0f6-4d42-96d3-f5e7fc66801a"},"dataSources":{"mainService":{"uri":"v2/odata/v4/catalog/","type":"OData","settings":{"annotations":[],"localUri":"localService/metadata.xml","odataVersion":"2.0"}}},"crossNavigation":{"inbounds":{"onboarding-manage":{"semanticObject":"onboarding","action":"manage","title":"{{flpTitle}}","subTitle":"{{flpSubtitle}}","signature":{"parameters":{},"additionalParameters":"allowed"}}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":true,"dependencies":{"minUI5Version":"1.118.0","libs":{"sap.m":{},"sap.ui.core":{},"sap.f":{},"sap.suite.ui.generic.template":{},"sap.ui.comp":{},"sap.ui.generic.app":{},"sap.ui.table":{},"sap.ushell":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"sp.fiori.onboarding.i18n.i18n"}},"":{"dataSource":"mainService","preload":true,"settings":{"synchronizationMode":"None","operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}},"request":{"type":"sap.ui.model.json.JSONModel"}},"resources":{"css":[{"uri":"css/style.css"}]},"routing":{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","async":true,"viewPath":"sp.fiori.onboarding.view","controlAggregation":"pages","controlId":"app","clearControlAggregation":false},"routes":[{"name":"list","pattern":"","target":["List"]}],"targets":{"List":{"viewType":"XML","transition":"slide","clearControlAggregation":false,"viewId":"List","viewName":"List"}}},"rootView":{"viewName":"sp.fiori.onboarding.view.App","type":"XML","async":true,"id":"App"}},"sap.cloud":{"public":true,"service":"onboarding"}}',
	"sp/fiori/onboarding/model/models.js":function(){sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,n){"use strict";return{createDeviceModel:function(){var i=new e(n);i.setDefaultBindingMode("OneWay");return i}}});
},
	"sp/fiori/onboarding/view/App.view.xml":'<mvc:View\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"\n><App id="app" /></mvc:View>\n',
	"sp/fiori/onboarding/view/List.view.xml":'<mvc:View\n    controllerName="sp.fiori.onboarding.controller.List"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns:core="sap.ui.core"\n    xmlns="sap.m"\n    class="sapUiSizeCompact"\n><Page\n        id="_IDGenPage1"\n        title="Supplier List"\n        titleAlignment="Center"\n    ><headerContent><Button\n                id="_IDGenButton1"\n                text="Create Supplier"\n                icon="sap-icon://add"\n                press="onCreatePress"\n                type="Transparent"\n            /></headerContent><content><Table\n                id="vendorList"\n                class="sapUiContentPadding sapUiLargeMarginBottom"\n                items="{DataModel>/}"\n                alternateRowColors="true"\n                sticky="ColumnHeaders,HeaderToolbar"\n                growing="true"\n                growingThreshold="50"\n            ><headerToolbar><OverflowToolbar id="_IDGenOverflowToolbar1"><ToolbarSpacer id="_IDGenToolbarSpacer2" /><SearchField\n                            id="search"\n                            width="500px"\n                            search="onSearch"\n                            showRefreshButton="true"\n                            placeholder="Search by Supplier, Business Partner, Status &amp; Approval Pending @"\n                        /><DatePicker\n                            width="172px"\n                            id="createFromDateId"\n                            placeholder="Creation From Date"\n                            tooltip="Creation From Date"\n                            valueFormat="yyyyMMdd"\n                            change="onCreationDateFilter"\n                        /><DatePicker\n                            width="154px"\n                            id="createToDateId"\n                            placeholder="Creation To Date"\n                            tooltip="Creation To Date"\n                            valueFormat="yyyyMMdd"\n                            change="onCreationDateFilter"\n                        /></OverflowToolbar></headerToolbar><columns><Column\n                        id="_IDGenColumn1"\n                        hAlign="Center"\n                        width="4rem"\n                    ><Label\n                            id="_IDGenLabel1"\n                            design="Bold"\n                            text="Supplier"\n                        /></Column><Column\n                        id="_IDGenColumn2"\n                        hAlign="Center"\n                        width="3rem"\n                        minScreenWidth="1300px"\n                        demandPopin="true"\n                        popinDisplay="Inline"\n                    ><Label\n                            id="_IDGenLabel2"\n                            design="Bold"\n                            text="Supplier Sub-Type"\n                            wrapping="true"\n                        /></Column><Column\n                        id="_IDGenColumn3"\n                        hAlign="Center"\n                        width="3rem"\n                        minScreenWidth="700px"\n                        demandPopin="true"\n                        popinDisplay="Inline"\n                    ><Label\n                            id="_IDGenLabel3"\n                            design="Bold"\n                            text="Creation Date"\n                            wrapping="true"\n                        /></Column><Column\n                        id="_IDGenColumn4"\n                        hAlign="Center"\n                        width="3rem"\n                        minScreenWidth="1000px"\n                        demandPopin="true"\n                        popinDisplay="Inline"\n                    ><Label\n                            id="_IDGenLabel4"\n                            design="Bold"\n                            text="Business Partner"\n                            wrapping="true"\n                        /></Column><Column\n                        id="_IDGenColumn5"\n                        hAlign="Center"\n                        width="3rem"\n                        minScreenWidth="900px"\n                        demandPopin="true"\n                        popinDisplay="Inline"\n                    ><Label\n                            id="_IDGenLabel5"\n                            design="Bold"\n                            text="Department"\n                        /></Column><Column\n                        id="_IDGenColumn6"\n                        hAlign="Center"\n                        width="5rem"\n                        minScreenWidth="700px"\n                        demandPopin="true"\n                        popinDisplay="Inline"\n                    ><Label\n                            id="_IDGenLabel6"\n                            design="Bold"\n                            text="Status"\n                        /></Column><Column\n                        id="_IDGenColumn7"\n                        hAlign="Center"\n                        width="2rem"\n                        minScreenWidth="700px"\n                        demandPopin="true"\n                        popinDisplay="Inline"\n                    ><Label\n                            id="_IDGenLabel7"\n                            design="Bold"\n                            text="Level"\n                        /></Column><Column\n                        id="_IDGenColumn8"\n                        hAlign="Center"\n                        width="4rem"\n                        minScreenWidth="1300px"\n                        demandPopin="true"\n                        popinDisplay="Inline"\n                    ><Label\n                            id="_IDGenLabel8"\n                            design="Bold"\n                            text="Approval Pending @"\n                            wrapping="true"\n                        /></Column><Column\n                        id="_IDGenColumn9"\n                        hAlign="Center"\n                        width="4rem"\n                    ><Label\n                            id="_IDGenLabel9"\n                            design="Bold"\n                            text="Action"\n                        /></Column><Column\n                        id="_IDGenColumn10"\n                        hAlign="Center"\n                        width="1rem"\n                    /></columns><items><ColumnListItem id="_IDGenColumnListItem1"><cells><ObjectIdentifier\n                                id="_IDGenObjectIdentifier1"\n                                title="{parts:[{path:\'DataModel>Vendor\'},{path:\'DataModel>ResetValidity\'}],formatter:\'formatter.addVendorColor\'}"\n                                text="{DataModel>VenName}"\n                                titleActive="true"\n                                tooltip="{= ${DataModel>ResetValidity} === \'X\' ? \'Validity Expired\' : \'\'}"\n                                titlePress="onVendorPress"\n                            /><ObjectStatus\n                                id="_IDGenObjectStatus1"\n                                text="{path:\'DataModel>VenSubType\',formatter:\'formatter.formatVendorSubType\'}"\n                                state="Indication08"\n                                class="objectStatus"\n                            /><Text\n                                id="_IDGenText1"\n                                text="{path:\'DataModel>CreatedOn\',formatter:\'formatter.formatDate\'}"\n                            /><ObjectStatus\n                                id="_IDGenObjectStatus2"\n                                text="{DataModel>Lifnr}"\n                                state="Indication03"\n                                class="objectStatus"\n                            /><Text\n                                id="_IDGenText2"\n                                text="{DataModel>Dept}"\n                            /><ObjectStatus\n                                id="_IDGenObjectStatus3"\n                                text="{DataModel>StatusText}"\n                                inverted="true"\n                                state="{path:\'DataModel>Status\',formatter:\'formatter.statusState\'}"\n                            /><ObjectStatus\n                                id="_IDGenObjectStatus4"\n                                text="{DataModel>Level}"\n                                inverted="true"\n                                state="{parts:[{path:\'DataModel>Level\'},{path:\'DataModel>Lifnr\'}],formatter:\'formatter.levelState\'}"\n                            /><ObjectStatus\n                                id="_IDGenObjectStatus5"\n                                text="{DataModel>ApprovalPending}"\n                                state="{parts:[{path:\'DataModel>Level\'},{path:\'DataModel>Lifnr\'}],formatter:\'formatter.levelState\'}"\n                                class="objectStatus"\n                            /><FlexBox\n                                id="_IDGenFlexBox1"\n                                direction="Column"\n                                alignItems="Center"\n                            ><Button\n                                    id="_IDGenButton2"\n                                    class="approveBtn"\n                                    text="Approve"\n                                    type="Accept"\n                                    press="onActionPress"\n                                    width="80px"\n                                    visible="{= ${DataModel>Approve}}"\n                                ><customData><core:CustomData\n                                            key="action"\n                                            value="A"\n                                        /></customData></Button><Button\n                                    id="_IDGenButton3"\n                                    class="rejectBtn"\n                                    text="Reject"\n                                    type="Reject"\n                                    press="onActionPress"\n                                    width="80px"\n                                    visible="{= ${DataModel>Approve}}"\n                                ><customData><core:CustomData\n                                            key="action"\n                                            value="R"\n                                        /></customData></Button></FlexBox><core:Icon\n                                id="_IDGenIcon1"\n                                src="sap-icon://attachment"\n                                tooltip="Attachments"\n                                color="#fbc02d"\n                                size="1.2rem"\n                                press="onAttachmentPress"\n                            /></cells></ColumnListItem></items></Table></content></Page></mvc:View>\n'
}});
