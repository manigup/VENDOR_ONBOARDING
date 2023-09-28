using db.VenOnboard as db from '../db/data-model';

service CatalogService {

    entity VenOnboard  as projection on db.VenOnboardHeader;

    entity Attachments as projection on db.Attachments;
    
    entity VendorForm  as projection on db.VendorForm;

    entity Country as projection on db.Country;

    entity States as projection on db.States;
    
    entity StatusCheck as projection on db.StatusCheck;
    
    function verfiyPANDetails(panNumber: String) returns String;

    function verifyGSTDetails(gstin: String) returns String;

    function verifyBankAccount(beneficiaryAccount: String, beneficiaryIFSC: String) returns String;
  
}
