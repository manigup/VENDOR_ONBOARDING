namespace db.VenOnboard;

using {managed} from '@sap/cds/common';

entity Country {
  key code : String(3);
      name : String;
};


entity States {
  key StateId   : Integer;
      StateCode : String(10);
      StateName : String(50);
      Country   : Association to Country;
};

entity StatusCheck {
  key email  : String;
      Access : String;
};

entity VenOnboardHeader : managed {
  key Vendor             : String(10);
  key VendorId           : UUID;
      VendorName         : String;
      VendorType         : String(5);
      Department         : String;
      Telephone          : String(10);
      City               : String;
      VendorMail         : String;
      Status             : String;
      VenValidTo         : DateTime;
      VenFrom            : DateTime;
      VenTimeLeft        : String;
      VenLevel           : String;
      VenApprovalPending : String;
      VenApprove         : String;
}

entity Attachments : managed {
  key VendorId    : String;
  key ObjectId    : String;
      Venfiletype : String;

      @Core.MediaType                  : Mediatype
      @Core.ContentDisposition.Filename: Filename
      Data        : LargeBinary;

      @Core.IsMediaType
      Mediatype   : String;
      Filename    : String;
}

entity VendorForm : managed {
  key VendorId                 : String;
      VendorName               : String;
      VendorType               : String(5);
      Type                     : String;
      VendorName2              : String;
      VendorName3              : String;
      Purpose                  : String;
      Telephone                : String(10);
      Consitution              : String;
      Address1                 : String;
      Address2                 : String;
      Address3                 : String;
      City                     : String;
      Country                  : Association to Country;
      District                 : String;
      Pincode                  : String(6);
      ContactPerson            : String;
      AlternateMobile          : String(10);
      VendorMail               : String;
      Landline                 : String;
      Extension                : String;
      Fax                      : String;
      Website                  : String;
      Remarks                  : String;
      Comments                 : String;
      MsmeItilView             : String;
      MsmeValidTo              : String;
      MsmeValidFrom            : String;
      MsmeMainCertificate      : String;
      MsmeMainCertificateId    : String;
      MsmeCertificateNo        : String;
      MsmeRegistrationCity     : String;
      MsmeDeclarationName      : String;
      Pan                      : String;
      PanName                  : String;
      Tan                      : String;
      GstApplicable            : String;
      GstNumber                : String;
      GstFileName              : String;
      Currency                 : String;
      VAT                      : String;
      ImportExportCode         : String;
      BankName                 : String;
      AccountNo                : String(18);
      BeneficiaryName          : String;
      AccountType              : String;
      IFSCCode                 : String;
      BranchName               : String;
      BeneficiaryLocation      : String;
      CancelledCheque          : String;
      NewVendorQuotationName   : String;
      NdaName                  : String;
      CocName                  : String;
      AgreementName            : String;
      ProjectAppropriationName : String;
      RelatedEmailName         : String;
      TaxResidencyCertificate  : String;
      Form10F                  : String;
      EstablishmentCertificate : String;
      DeductionCertificate     : String;
      OtherDocument            : String;
      Otp                      : String;
}
