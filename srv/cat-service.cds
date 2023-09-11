using my.onboarding as db from '../db/data-model';

service CatalogService {

    entity VenOnboard as projection on db.VenOnboardHeader;
}
