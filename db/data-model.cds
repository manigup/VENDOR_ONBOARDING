namespace my.onboarding;

using {managed} from '@sap/cds/common';

entity VenOnboardHeader : managed {
  key Vendor     : String(10);
      VendorName : String;
      VendorType : String(10);
      Department : String;
      Telephone  : Integer;
      City       : String;
      VendorMail : String;
}
