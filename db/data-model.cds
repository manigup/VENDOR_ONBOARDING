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

entity Attachments : managed {
  key Vendor    : String(10);
  key ObjectId  : String;

      @Core.MediaType                  : Mediatype
      @Core.ContentDisposition.Filename: Filename
      Data      : LargeBinary;

      @Core.IsMediaType
      Mediatype : String;
      Filename  : String;
}
