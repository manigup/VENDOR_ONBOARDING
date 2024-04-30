const cds = require('@sap/cds');
const axios = require('axios').default;
const { panOptions, gstOptions, bankOptions } = require('./apiConfig');
const FormData = require('form-data');
// const { on } = require('events');
// const { Console } = require('console');

const ecmserviceurl = "https://api-sdm-di.cfapps.ap10.hana.ondemand.com/";
const devSdm = {
    "clientid": "sb-af5ed0ac-6872-41a0-956e-ec2fea18c139!b26649|sdm-di-DocumentManagement-sdm_integration!b247",
    "clientsecret": "vORif9806WxSm8azpmw6Fuj99Ro=",
    "url": "https://impautosuppdev.authentication.ap10.hana.ondemand.com",
    "repositoryId": "Vendor_Onboading"
}, prdSdm = {
    "clientid": "sb-75d68fc2-fdc0-4ee1-ac19-572a35f46864!b36774|sdm-di-DocumentManagement-sdm_integration!b247",
    "clientsecret": "5LcakzQRIAEeMZpjCSUPd6NhKRE=",
    "url": "https://supplier-portal.authentication.ap10.hana.ondemand.com",
    "repositoryId": "ZDMS_SUPP"
};

module.exports = cds.service.impl(async function () {
    const { AccessInfo, VendorForm } = cds.entities;

    this.before('CREATE', 'VenOnboard', async (req) => {

        req.data.Status = "INITIATED";

        const records = await cds.run(cds.parse.cql("Select VendorMail, Vendor from db.VenOnboard.VenOnboardHeader")),
            duplicate = records.filter(item => item.VendorMail === req.data.VendorMail);

        if (duplicate.length > 0) {
            req.reject(400, 'Email id ' + req.data.VendorMail + ' already exist for supplier ' + duplicate[0].Vendor);
        }

        let connJwtToken;
        if (req.headers.origin.includes("port") || req.headers.origin.includes("impautosuppdev")) {
            connJwtToken = await _fetchJwtToken(devSdm.url, devSdm.clientid, devSdm.clientsecret);

            // Creating dms folder
            await _createFolder(ecmserviceurl, connJwtToken, devSdm.repositoryId, req.data.VendorId);
        } else {

            connJwtToken = await _fetchJwtToken(prdSdm.url, prdSdm.clientid, prdSdm.clientsecret);

            // Creating dms folder
            await _createFolder(prdSdm.ecmserviceurl, connJwtToken, prdSdm.repositoryId, req.data.VendorId);
        }
    });

    this.before(['CREATE', 'UPDATE'], VendorForm, async (data, req) => {
        data.RelatedParty = data.RelatedParty === 'true';
        return data;
    });

    this.after('READ', 'VenOnboard', async (req) => {
        let today = new Date();
        req.filter(item => today.toISOString() >= item.VenValidTo).map(item => item.ResetValidity = "X");
    });

    this.before('READ', 'VenOnboard', async (req) => {
        if (req._queryOptions && req._queryOptions.venfilter == 'true') {
            let userID = req.user.id;
            if (req.user.id === "anonymous") {
                userID = "manishgupta8@kpmg.com";
            }
            const { Access } = await SELECT.one.from(AccessInfo).where({ email: userID }).columns('Access');
            req.query.where(`VenApprovalPending = '${Access}' or initiatedBy = '${userID}'`)
        }
    })


    this.before("CREATE", 'Attachments', async (req) => {

        const reqData = req.data.Filename.split("/");

        let connJwtToken;
        if (req.headers.origin.includes("port") || req.headers.origin.includes("impautosuppdev")) {

            connJwtToken = await _fetchJwtToken(devSdm.url, devSdm.clientid, devSdm.clientsecret);

            req.data.ObjectId = await _uploadAttachment(ecmserviceurl, connJwtToken, devSdm.repositoryId, reqData[0], reqData[1]);

        } else {

            connJwtToken = await _fetchJwtToken(prdSdm.url, prdSdm.clientid, prdSdm.clientsecret);

            req.data.ObjectId = await _uploadAttachment(ecmserviceurl, connJwtToken, prdSdm.repositoryId, reqData[0], reqData[1]);
        }

        req.data.VendorId = reqData[0];
        req.data.Filename = reqData[1];
        req.data.Venfiletype = reqData[2];

    });

    this.before("DELETE", 'Attachments', async (req) => {

        let connJwtToken;
        if (req.headers.origin.includes("port") || req.headers.origin.includes("impautosuppdev")) {

            connJwtToken = await _fetchJwtToken(devSdm.url, devSdm.clientid, devSdm.clientsecret);

            await _deleteAttachment(ecmserviceurl, connJwtToken, devSdm.repositoryId, req.data.VendorId, req.data.ObjectId);

        } else {

            connJwtToken = await _fetchJwtToken(prdSdm.url, prdSdm.clientid, prdSdm.clientsecret);

            await _deleteAttachment(ecmserviceurl, connJwtToken, prdSdm.repositoryId, req.data.VendorId, req.data.ObjectId);
        }
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

    //Email trigger
    this.on('sendEmail', async (req) => {
        const { vendorName, subject, content, toAddress, ccAddress } = req.data;
        const loginid = req.headers.loginid || "NewSupplier";
        console.log(req.data)

        const payload = {
            Subject: subject,
            Content: `Dear ${vendorName}, ${content} | | Regards | ImperialAuto`,
            Seperator: "|",
            ToAddress: toAddress,
            CCAddress: ccAddress,
            BCCAddress: "",
            CreatedBy: loginid
        };

        try {
            // Make the API request
            const token = await generateToken(loginid),
                legApi = await cds.connect.to('Legacy'),
                response = await legApi.send({
                    query: `POST SendMail`,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    data: payload
                });

            if (response.ErrorCode) {
                return "Error sending email";
            } else {
                return "Email sent successfully";
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    //Country Data
    this.on('READ', 'Country', async (req) => {
        const loginid = req.headers.loginid || "NewSupplier";
        return getCountries(loginid);
    });

    //State Data
    this.on('READ', 'States', async (req) => {
        const country = req._queryOptions.country;
        const loginid = req.headers.loginid || "NewSupplier";
        return getStates(country, loginid);
    });

    //City Data
    this.on('READ', 'City', async (req) => {
        const { country, state } = req._queryOptions
        const loginid = req.headers.loginid || "NewSupplier";
        return getCities(country, state, loginid);
    });

    //UnitCode data
    this.on('READ', 'UnitCodes', async (req) => {
        const loginid = req.headers.loginid || "NewSupplier";
        return getUnitCodes(loginid);
    });

    this.on('GetSupplierList', async (req) => {
        try {
            const token = await generateToken(req.headers.loginid),
                legApi = await cds.connect.to('Legacy'),
                response = await legApi.send({
                    query: `GET GetSupplierList?RequestBy='${req.headers.loginid}'`,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

            if (response.d) {
                return JSON.parse(response.d);
            } else {
                req.reject(500, `Error parsing response: ${response.data}`);
            }
        } catch (error) {
            req.reject(500, "Unable to fetch Supplier List");
        }
    });

    //SupplierMaster
    this.on('submitFormData', async (req) => {
        const formDataString = req.data.data;
        const formDatapar = JSON.parse(formDataString);
        const formData = JSON.stringify(formDatapar, null, 2)
        const loginid = req.headers.loginid;
        try {
            return await postFormData(formData, loginid);
        } catch (error) {
            console.error('Error submitting form data:', error);
            req.reject(400, `Error creationg BP: ${error.message}`);
        }
    });

    //GetSupplierCodeList
    this.on('GetSupplierAccountCodeList', async (req) => {
        const { unitCode } = req.data
        const loginid = req.headers.loginid || "NewSupplier";
        return getSupplierAccountCodeList(unitCode, loginid)
    })

    //GetDocumentList
    this.on('GetDocumentList', async (req) => {
        const { unitCode } = req.data
        const loginid = req.headers.loginid || "NewSupplier";
        return getDocumentList(unitCode, loginid);
    })

    //TransportersList
    this.on('GetSupplierTransportersList', async (req) => {
        const { unitCode } = req.data
        const loginid = req.headers.loginid || "NewSupplier";
        return getSupplierTransportersList(unitCode, loginid);
    })

    //LocationList
    this.on('GetSupplierLocationList', async (req) => {
        const { unitCode } = req.data
        const loginid = req.headers.loginid || "NewSupplier";
        return getSupplierLocationList(unitCode, loginid);
    })
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

async function getCountries(loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GET GetCountryList?RequestBy='${loginid}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {}
            });

        const countries = JSON.parse(response.d);
        countries.sort((a, b) => a.Country.localeCompare(b.Country));

        return countries.map(country => ({
            code: country.Country
        }));

    } catch (error) {
        console.error("Error fetching country data:", error);
        //throw new Error("Failed to fetch country data");
    }
}

async function getStates(country, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GETGetStateList?RequestBy='${loginid}'&Country='${country}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {}
            });

        const states = JSON.parse(response.d);

        return states.map(state => ({
            name: state.State
        }));
    } catch (error) {
        console.error("Error fetching state data:", error);
        //throw new Error("Failed to fetch state data");
    }
}

async function getCities(country, state, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GET GetCityList?RequestBy='${loginid}'&Country='${country}'&State='${state}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {}
            });

        const cities = JSON.parse(response.d);

        return cities.map(city => ({
            name: city.City
        }));
    } catch (error) {
        console.error("Error fetching city data:", error);
        //throw new Error("Failed to fetch city data");
    }
}

async function getUnitCodes(loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GET GetUnitCodeList?RequestBy='${loginid}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {}
            });

        const unitCodes = JSON.parse(response.d);
        return unitCodes.map(unitCode => ({
            code: unitCode.UnitCode,
            addressCode: unitCode.AddressCode,
            unitDescription: unitCode.UnitDescription
        }));

    } catch (error) {
        console.error("Error fetching unit code data:", error);
        //throw new Error("Failed to fetch unit code data");
    }
}

async function postFormData(formData, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `POST PostSupplierMaster`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: formData
            });

        if (response.status === 200) {
            return 'Form data submitted successfully';
        } else {
            throw new Error(`Failed to submit form data: ${response.statusText}`);
        }

    } catch (error) {
        console.error("Error submitting form data:", error);
        throw error;
    }
}

async function getSupplierAccountCodeList(unitCode, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GET GetSupplierAccountCodeList?RequestBy='${loginid}'&UnitCode='${unitCode}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {}
            });

        const accountData = JSON.parse(response.d);
        return accountData.map(item => ({
            AcctCode: item.AcctCode,
            AcctName: item.AcctName
        }));

    } catch (error) {
        console.error("Error fetching account data:", error);
        //throw new Error("Failed to fetch account data");
    }
}

async function getDocumentList(unitCode, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GET GetDocumentList?RequestBy='${loginid}'&UnitCode='${unitCode}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {}
            });
        const documentList = JSON.parse(response.d);
        return documentList.map(document => ({
            DocumentsCode: document.DocumentsCode,
            DocumentsName: document.DocumentsName
        }));
    } catch (error) {
        console.error("Error fetching document data:", error);
        //throw new Error("Failed to fetch document data");
    }
}

async function getSupplierTransportersList(unitCode, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GET GetSupplierTransportersList?RequestBy='${loginid}'&UnitCode='${unitCode}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {}
            });
        const transportersList = JSON.parse(response.d);
        return transportersList.map(transporter => ({
            TransportersCode: transporter.TranportersCode,
            TransportersName: transporter.TranportersName
        }));
    } catch (error) {
        console.error("Error fetching transporters data:", error);
        //throw new Error("Failed to fetch transporters data");
    }
}

async function getSupplierLocationList(unitCode, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GET GetSupplierLocationList?RequestBy='${loginid}'&UnitCode='${unitCode}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {}
            });
        const locationList = JSON.parse(response.d);
        return locationList.map(location => ({
            LocationCode: location.LocationCode,
            LocationName: location.LocationName
        }));
    } catch (error) {
        console.error("Error fetching location data:", error);
        //throw new Error("Failed to fetch location data");
    }
}

async function generateToken(username) {
    try {
        const legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `POST GenerateToken`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "InputKey": username
                }
            });

        if (response.d) {
            return response.d;
        } else {
            console.error('Error parsing token response:', response.data);
            throw new Error('Error parsing the token response from the API.');
        }
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Unable to generate token.');
    }
}

