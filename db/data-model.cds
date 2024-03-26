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

entity UnitCode {
  key code        : String;
      addressCode : String;
};


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
      Companycode        : String;
      RegistrationType   : String;
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
      ResetValidity      : String;
      Department         : String;
      initiatedBy        : String;
      RelatedPart        : String;
      RejReason          : String;
      SupplierType       : String;
      VDAAssessment      : String;
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

entity CommonFile : managed {
  key fileid      : Integer;
      Venfiletype : String;

      @Core.MediaType                  : Mediatype
      @Core.ContentDisposition.Filename: Filename
      Data        : LargeBinary;

      @Core.IsMediaType
      Mediatype   : String;
      Filename    : String;
}

entity VendorForm : managed {
  key VendorId                     : String;
      Vendor                       : String(10);
      AddressCode                  : String;
      VendorName                   : String;
      VendorType                   : String(5);
      Type                         : String;
      Companycode                  : String;
      RegistrationType             : String;
      VendorName2                  : String;
      VendorName3                  : String;
      Purpose                      : String;
      Telephone                    : String(10);
      Consitution                  : String;
      Address1                     : String;
      Address2                     : String;
      Address3                     : String;
      City                         : Association to City;
      Country                      : Association to Country;
      State                        : Association to States;
      District                     : String;
      Pincode                      : String(6);
      ContactPerson                : String;
      AlternateMobile              : String(10);
      VendorMail                   : String;
      Landline                     : String;
      Extension                    : String;
      Fax                          : String;
      Website                      : String;
      Remarks                      : String;
      Comments                     : String;
      MsmeItilView                 : String;
      MsmeValidTo                  : String;
      MsmeValidFrom                : String;
      MsmeMainCertificate          : String;
      MsmeMainCertificateId        : String;
      MsmeCertificateNo            : String;
      MsmeRegistrationCity         : String;
      MsmeDeclarationName          : String;
      Pan                          : String;
      PanName                      : String;
      Tan                          : String;
      GstApplicable                : String;
      GstNumber                    : String;
      GstFileName                  : String;
      Currency                     : String;
      VAT                          : String;
      ImportExportCode             : String;
      BankName                     : String;
      AccountNo                    : String(18);
      BeneficiaryName              : String;
      AccountType                  : String;
      IFSCCode                     : String;
      BranchName                   : String;
      BeneficiaryLocation          : String;
      CancelledCheque              : String;
      SupplierType                 : String;
      TemporaryStartDate           : String;
      TemporaryEndDate             : String;
      AccountCode                  : String;
      AccountDesc                  : String;
      LeadTime                     : String;
      IAIvendorCode                : String;
      Location                     : String;
      Designation                  : String;
      DeliveryMode                 : String;
      CustomerCat                  : String;
      ExciseDivision               : String;
      ExciseBankAcc                : String;
      STRatePerc                   : String;
      Tin                          : String;
      Composite                    : String;
      CreditRating                 : String;
      CreditRatingAgency           : String;
      ServiceAccType               : String;
      ECCNo                        : String;
      CSTDate                      : String;
      LSTDate                      : String;
      ExciseNo                     : String;
      JWRWCost                     : String;
      CompanyType                  : String;
      ISOExpiryDate                : String;
      AddressType                  : String;
      ExciseRange                  : String;
      ExciseBankName               : String;
      ExciseDuty                   : String;
      CinNo                        : String;
      GstRegistered                : String;
      GSTDate                      : String;
      ServiceAccCode               : String;
      STRateSurcharge              : String;
      CSTNo                        : String;
      LSTNo                        : String;
      ExciseDate                   : String;
      MRPPercentage                : String;
      SalesPersonCode              : String;
      Distance                     : String;
      TypeOfSupplier               : String;
      PartyClassification          : String;
      GroupingLocation             : String;
      GroupCode5                   : String;
      GroupCode7                   : String;
      Tax                          : String;
      GroupCode4                   : String;
      Transporters                 : String;
      GroupCode8                   : String;
      ContactPersonName            : String;
      ContactPersonDepartment      : String;
      ContactPersonDesignation     : String;
      ContactPersonPhone           : String;
      ContactPersonMobile          : String;
      ContactPersonMail            : String;
      ContactPersonName2           : String;
      ContactPersonDepartment2     : String;
      ContactPersonDesignation2    : String;
      ContactPersonPhone2          : String;
      ContactPersonMobile2         : String;
      ContactPersonMail2           : String;
      DocCode                      : String;
      DocDescription               : String;
      BankAddress                  : String;
      NewVendorQuotationName       : String;
      NdaName                      : String;
      CocName                      : String;
      AgreementName                : String;
      ProjectAppropriationName     : String;
      RelatedEmailName             : String;
      TaxResidencyCertificate      : String;
      Form10F                      : String;
      EstablishmentCertificate     : String;
      DeductionCertificate         : String;
      OtherDocument                : String;
      Otp                          : String;
      PrevAccNo                    : String;
      Bukrs                        : String;
      ReconAccount                 : String;
      HouseBank                    : String;
      ExtBpNo                      : String;
      PurOrg                       : String;
      PurGrp                       : String;
      SchemaGrp                    : String;
      Waers                        : String;
      WitholdingTax                : String;
      RecipientType                : String;
      WitholdTaxcode               : String;
      TaxNumCat                    : String;
      ChkDoubleInv                 : String;
      ClrWthCust                   : String;
      SubWitholdingTax             : String;
      GrBasedInv                   : String;
      SerBasedInv                  : String;
      WorkingHours                 : String;
      WeeklyHolidays               : String;
      ExecutiveName                : String;
      ExecutiveContactDuringWork   : String(10);
      ExecutiveContactAfterWork    : String(10);
      NatureOfIndustry             : String;
      YearOfEstablishment          : String;
      CoveredAreaOfFactory         : String;
      TotalCapitalInvestment       : String;
      WorkingCapital               : String;
      TurnOverYear1                : String;
      TurnOverYear2                : String;
      TurnOverYear3                : String;
      SSINo                        : String;
      SSIDate                      : String;
      ISO9001Certification         : String;
      IATF16949Certification       : String;
      ISO14001Certification        : String;
      ISO45001Certification        : String;
      VDA63Certification           : String;
      SuppCurrency                 : String;
      SuppPaymentTerm              : String;
      MACEGreen                    : String;
      WorkingTowardsCertifications : String;
      ProbableCertificationDate    : String;
      CentralExciseDutyApplicable  : String;
      AssociateCompanyName         : String;
      AssociateCompanyAddr         : String;
      BankerName                   : String;
      BankerAddress                : String;
      MachineDetails               : String;
      MachineName                  : String;
      EquipmentDetails             : String;
      EquipmentName                : String;
      CaptivePower                 : String;
      CaptivePowerFileName         : String;
      CaptivePowerDetails          : String;
      InstalledCapacity            : String;
      SpareCapacity                : String;
      SpareCapacityName            : String;
      ProductCustomerName          : String;
      Total                        : String;
      Permanent                    : String;
      DailyWages                   : String;
      QualityControl               : String;
      ProductsManufactured         : String;
      OverallRating                : String;
      SystemAuditRating            : String;
      AdditionalInformation        : String;
      Date                         : String;
      Name                         : String;
      VendorDesignation            : String;
      Attachment1                  : String;
      Attachment1Name              : String;
      Attachment2                  : String;
      Attachment2Name              : String;
      RiskAssessment               : String;
      SystemAuditCheck             : String;
      ISO9001Attachment            : String;
      IATF16949Attachment          : String;
      ISO14001Attachment           : String;
      ISO45001Attachment           : String;
      VDA63Attachment              : String;
      MACEGreenAttachment          : String;
      GroupType                    : String;
      BalanceSheet                 : String;
      ProductSafety                : String;
      MineralSurvey                : String;
      LegalRequirement             : String;
      Union                        : String;
      ProdDesign                   : String;
      SoftwareCapabilities         : String;
      BusinessContinuity           : String;
      LogisticCustomer             : String;
      ISO9001ValidFrom             : String;
      ISO9001ValidTo               : String;
      IATF16949ValidFrom           : String;
      IATF16949ValidTo             : String;
      ISO14001ValidFrom            : String;
      ISO14001ValidTo              : String;
      ISO45001ValidFrom            : String;
      ISO45001ValidTo              : String;
      VDA63ValidFrom               : String;
      VDA63ValidTo                 : String;
      MACEGreenValidFrom           : String;
      MACEGreenValidTo             : String;
      SupplierAssessment           : String;
      IATFAttachment               : String;
      RiskRatingRemark             : String;
      ActionPlanAttachment         : String;
      VDAAssessment                : String;
      VDAAssessmentStatus          : String;
      VDAAssessmentAttachment      : String;
      RelatedParty                 : Boolean default false;
      RelatedPartyName             : String;
      RelatedPartyDesignation      : String;
      RelatedPartyContact          : String;
      Products                     : Composition of many ProductInfo
                                       on Products.Vendor = $self;
}

entity ProductInfo {
  key Vendor               : Association to VendorForm;
  key SrNo                 : Integer;
      ProductName          : String;
      CustomerName         : String;
      CustomerLoc          : String;
      QtyAvgLastYear       : String;
      RejectionPPMLastYear : String;
      DeliveryPerformance  : String;
}
