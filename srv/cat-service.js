const cds = require('@sap/cds');
const axios = require('axios').default;
const { panOptions, gstOptions, bankOptions } = require('./apiConfig');
const FormData = require('form-data');
const transporter = require('./emailTransporter');

const sdmCredentials = {
    "clientid": "sb-af5ed0ac-6872-41a0-956e-ec2fea18c139!b26649|sdm-di-DocumentManagement-sdm_integration!b247",
    "clientsecret": "vORif9806WxSm8azpmw6Fuj99Ro=",
    "url": "https://impautosuppdev.authentication.ap10.hana.ondemand.com",
    "ecmserviceurl": "https://api-sdm-di.cfapps.ap10.hana.ondemand.com/",
    "repositoryId": "Vendor_Onboading"
}

module.exports = cds.service.impl(async function () {

    this.before('CREATE', 'VenOnboard', async (req) => {

        req.data.Status = "INITIATED";

        const records = await cds.run(cds.parse.cql("Select VendorMail, Vendor from db.VenOnboard.VenOnboardHeader")),
            duplicate = records.filter(item => item.VendorMail === req.data.VendorMail);

        if (duplicate.length > 0) {
            req.reject(400, 'Email id ' + req.data.VendorMail + ' already exist for supplier ' + duplicate[0].Vendor);
        }

        const connJwtToken = await _fetchJwtToken(sdmCredentials.url, sdmCredentials.clientid, sdmCredentials.clientsecret);

        // Creating dms folder
        await _createFolder(sdmCredentials.ecmserviceurl, connJwtToken, sdmCredentials.repositoryId, req.data.VendorId);
    });

    this.before("CREATE", 'Attachments', async (req) => {

        const reqData = req.data.Filename.split("/");

        const connJwtToken = await _fetchJwtToken(sdmCredentials.url, sdmCredentials.clientid, sdmCredentials.clientsecret);

        req.data.ObjectId = await _uploadAttachment(sdmCredentials.ecmserviceurl, connJwtToken, sdmCredentials.repositoryId, reqData[0], reqData[1]);
        req.data.VendorId = reqData[0];
        req.data.Filename = reqData[1];
        req.data.Venfiletype = reqData[2];

    });

    this.before("DELETE", 'Attachments', async (req) => {

        const connJwtToken = await _fetchJwtToken(sdmCredentials.url, sdmCredentials.clientid, sdmCredentials.clientsecret);

        await _deleteAttachment(sdmCredentials.ecmserviceurl, connJwtToken, sdmCredentials.repositoryId, req.data.VendorId, req.data.ObjectId);
    });

    this.on('verifyPANDetails', async (req) => {
        const panNumber = req.data.panNumber;
        const apiReqConfig = { ...panOptions };
        apiReqConfig.data = {
          task: 'fetch',
          essentials: { number: panNumber }
        };
    
        try {
          const apiResponse = await axios.request(apiReqConfig);
          return apiResponse.data;
        } catch (error) {
            const statusCode = error.response ? error.response.status : 'Unknown status code';
            const errorMessage = error.message ? error.message : 'Unknown error';
            return { isValid: false, statusCode: statusCode, errorMessage: errorMessage };
        }
    });
    
    this.on('verifyGSTDetails', async (req) => {
        const gstin = req.data.gstin;
    
        const apiReqConfig = { ...gstOptions };
        apiReqConfig.data = {
            task: 'gstinSearch',
            essentials: { gstin: gstin }
        };
    
        try {
            const apiResponse = await axios.request(apiReqConfig);
            if (apiResponse.status === 200) {
                return { isValid: true, statusCode: 200 };
            } else {
                return { isValid: false, statusCode: apiResponse.status };
            }
        } catch (error) {
            const statusCode = error.response ? error.response.status : 'Unknown status code';
            const errorMessage = error.message ? error.message : 'Unknown error';
            return { isValid: false, statusCode: statusCode, errorMessage: errorMessage };
        }
    });

    this.on('verifyBankAccount', async (req) => {
        const { beneficiaryAccount, beneficiaryIFSC } = req.data;
    
        const apiReqConfig = { ...bankOptions };
        apiReqConfig.data = {
            task: 'bankTransfer',
            essentials: {
                beneficiaryAccount: beneficiaryAccount,
                beneficiaryIFSC: beneficiaryIFSC
            }
        };
    
        try {
            const apiResponse = await axios.request(apiReqConfig);
            if (apiResponse.status === 200 && apiResponse.data.result.active === "yes") {
                return { isValid: true, statusCode: 200 };
            } else {
                return { isValid: false, statusCode: apiResponse.status, errorMessage: "Bank account is not active" };
            }
        } catch (error) {
            const statusCode = error.response ? error.response.status : 'Unknown status code';
            const errorMessage = error.message ? error.message : 'Unknown error';
            return { isValid: false, statusCode: statusCode, errorMessage: errorMessage };
        }
    });

    this.on('sendMail', async (req) => {
        const { to, subject, text } = req.data;
    
        const mailOptions = {
            to: to,
            subject: subject,
            text: text
        };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                    console.log("Error in email: ", error)
                } else {
                    resolve(`Email sent: ${info.response}`);
                }
            });
        });
    });
    

});

const _fetchJwtToken = async function (oauthUrl, oauthClient, oauthSecret) {

    return new Promise((resolve, reject) => {
        const tokenUrl = oauthUrl + '/oauth/token?grant_type=client_credentials&response_type=token'
        const config = {
            headers: {
                Authorization: "Basic " + Buffer.from(oauthClient + ':' + oauthSecret).toString("base64")
            }
        }
        axios.get(tokenUrl, config)
            .then(response => {
                resolve(response.data.access_token)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// create a new folder for every vendor & add their respective attachments in that folder
const _createFolder = async function (sdmUrl, jwtToken, repositoryId, folderName) {
    return new Promise((resolve, reject) => {
        const folderCreateURL = sdmUrl + "browser/" + repositoryId + "/root";

        const formData = new FormData();
        formData.append("cmisaction", "createFolder");
        formData.append("propertyId[0]", "cmis:name");
        formData.append("propertyValue[0]", folderName);
        formData.append("propertyId[1]", "cmis:objectTypeId");
        formData.append("propertyValue[1]", "cmis:folder");
        formData.append("succinct", 'true');

        let headers = formData.getHeaders();
        headers["Authorization"] = "Bearer " + jwtToken;

        const config = {
            headers: headers
        }

        axios.post(folderCreateURL, formData, config)
            .then(response => {
                resolve(response.data.succinctProperties["cmis:objectId"])
            })
            .catch(error => {
                reject(error)
            })
    })
}

const _uploadAttachment = async function (sdmUrl, jwtToken, repositoryId, folderName, fileName) {
    return new Promise((resolve, reject) => {
        const url = sdmUrl + "browser/" + repositoryId + "/root/" + folderName;

        const formData = new FormData();
        formData.append("cmisaction", "createDocument");
        formData.append("propertyId[0]", "cmis:name");
        formData.append("propertyValue[0]", fileName);
        formData.append("propertyId[1]", "cmis:objectTypeId");
        formData.append("propertyValue[1]", "cmis:document");
        formData.append("succinct", 'true');
        formData.append("filename", fileName);
        formData.append("media", 'binary');

        let headers = formData.getHeaders();
        headers["Authorization"] = "Bearer " + jwtToken;

        const config = {
            headers: headers
        }

        axios.post(url, formData, config)
            .then(response => {
                resolve(response.data.succinctProperties["cmis:objectId"])
            })
            .catch(error => {
                reject(error)
            })
    })
}

const _deleteAttachment = async function (sdmUrl, jwtToken, repositoryId, folderName, objectId) {
    return new Promise((resolve, reject) => {
        const url = sdmUrl + "browser/" + repositoryId + "/root/" + folderName;

        const formData = new FormData();
        formData.append("cmisaction", "delete");
        formData.append("objectId", objectId);

        let headers = formData.getHeaders();
        headers["Authorization"] = "Bearer " + jwtToken;

        const config = {
            headers: headers
        }

        axios.post(url, formData, config)
            .then(response => {
                resolve()
            })
            .catch(error => {
                reject(error)
            })
    })
}
