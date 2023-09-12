using db.VenOnboard as db from '../db/data-model';

service CatalogService {
    
    entity VenOnboard as projection on db.VenOnboardHeader;

    entity Attachments as projection on db.Attachments;
}
