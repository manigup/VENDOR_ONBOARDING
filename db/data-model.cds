namespace db.VenOnboard;

using {managed} from '@sap/cds/common';

entity VenOnboardHeader : managed {
  key Vendor     : String(10);
      VendorName : String;
      VendorType : String(5);
      Department : String;
      Telephone  : String(10);
      City       : String;
      VendorMail : String;
      Status     : String;
}
