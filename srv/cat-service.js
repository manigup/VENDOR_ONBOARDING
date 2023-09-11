const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    this.before('CREATE', 'VenOnboard', async (req) => {

        req.data.Status = "INITIATED";

        const records = await cds.run(cds.parse.cql("Select VendorMail, Vendor from db.VenOnboard.VenOnboardHeader")),
            duplicate = records.filter(item => item.VendorMail === req.data.VendorMail);

        if (duplicate.length > 0) {
            req.reject(400, 'Email id ' + req.data.VendorMail + ' already exist for supplier ' + duplicate[0].Vendor);
        }
    });
});