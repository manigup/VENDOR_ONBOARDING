using db.VenOnboard as db from '../db/data-model';

type AccountCodeType {
    AcctCode: String;
    AcctName: String;
};

type DocumentListType: {
    DocumentsCode : String;
    DocumentsName : String;
};

type SupplierTransportersListType: {
    TransportersCode : String;
    TransportersName : String;
};

type SupplierLocationListType: {
    LocationCode : String;
    LocationName : String;
};


service CatalogService @(requires: 'any') {

    entity VenOnboard  as projection on db.VenOnboardHeader;

    entity Attachments as projection on db.Attachments;
    
    entity VendorForm  as projection on db.VendorForm;

    entity ProductInfo  as projection on db.ProductInfo;

    entity Country as projection on db.Country;

    entity States as projection on db.States;

    entity City as projection on db.City;

    entity UnitCodes as projection on db.UnitCode;

    entity AccessInfo as projection on db.AccessInfo;
    
    function verfiyPANDetails(panNumber: String) returns String;

    function verifyGSTDetails(gstin: String) returns String;

    function verifyBankAccount(beneficiaryAccount: String, beneficiaryIFSC: String) returns String;

    function sendEmail(vendorName: String, subject: String, content: String, toAddress: String) returns String;

    function GetSupplierAccountCodeList(unitCode:String) returns array of AccountCodeType;

    function GetDocumentList(unitCode:String) returns array of DocumentListType;

    function GetSupplierTransportersList(unitCode:String) returns array of SupplierTransportersListType;

    function GetSupplierLocationList(unitCode:String) returns array of SupplierLocationListType;

    action submitFormData(data: String) returns String;
}
