namespace db.VenOnboard;

using {managed} from '@sap/cds/common';

entity Country {

  key code : String;
      name : String;

}

entity States {
  key name : String;
};

entity City {
  key name : String;
}

entity AccessInfo {
  key email           : String;
      Access          : String;
      Application     : String;
      ApplicationName : String;
      CompCode        : String;
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
      AddressCode        : String;
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
      Vendor                   : String(10);
      AddressCode              : String;
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
      City                     : Association to City;
      Country                  : Association to Country;
      State                    : Association to States;
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
      SupplierType             : String;
      AccountCode              : String;
      AccountDesc              : String;
      LeadTime                 : String;
      IAIvendorCode            : String;
      Location                 : String;
      Designation              : String;
      DeliveryMode             : String;
      CustomerCat              : String;
      ExciseDivision           : String;
      ExciseBankAcc            : String;
      STRatePerc               : String;
      Tin                      : String;
      Composite                : String;
      CreditRating             : String;
      CreditRatingAgency       : String;
      ServiceAccType           : String;
      ECCNo                    : String;
      CSTDate                  : String;
      LSTDate                  : String;
      ExciseNo                 : String;
      JWRWCost                 : String;
      CompanyType              : String;
      ISOExpiryDate            : String;
      AddressType              : String;
      ExciseRange              : String;
      ExciseBankName           : String;
      ExciseDuty               : String;
      CinNo                    : String;
      GstRegistered            : String;
      GSTDate                  : String;
      ServiceAccCode           : String;
      STRateSurcharge          : String;
      CSTNo                    : String;
      LSTNo                    : String;
      ExciseDate               : String;
      MRPPercentage            : String;
      SalesPersonCode          : String;
      Distance                 : String;
      TypeOfSupplier           : String;
      PartyClassification      : String;
      GroupingLocation         : String;
      GroupCode5               : String;
      GroupCode7               : String;
      Tax                      : String;
      GroupCode4               : String;
      Transporters             : String;
      GroupCode8               : String;
      ContactPersonName        : String;
      ContactPersonDepartment  : String;
      ContactPersonDesignation : String;
      ContactPersonPhone       : String;
      ContactPersonMobile      : String;
      ContactPersonMail        : String;
      DocCode                  : String;
      DocDescription           : String;
      BankAddress              : String;
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
      PrevAccNo                : String;
      Bukrs                    : String;
      ReconAccount             : String;
      HouseBank                : String;
      ExtBpNo                  : String;
      PurOrg                   : String;
      PurGrp                   : String;
      SchemaGrp                : String;
      Waers                    : String;
      WitholdingTax            : String;
      RecipientType            : String;
      WitholdTaxcode           : String;
      TaxNumCat                : String;
      ChkDoubleInv             : String;
      ClrWthCust               : String;
      SubWitholdingTax         : String;
      GrBasedInv               : String;
      SerBasedInv              : String;
}
