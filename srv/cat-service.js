const cds = require('@sap/cds');
const axios = require('axios').default;
const { panOptions, gstOptions, bankOptions } = require('./apiConfig');
const FormData = require('form-data');
const { on } = require('events');
const { Console } = require('console');

const sdmCredentials = {
    "clientid": "sb-af5ed0ac-6872-41a0-956e-ec2fea18c139!b26649|sdm-di-DocumentManagement-sdm_integration!b247",
    "clientsecret": "vORif9806WxSm8azpmw6Fuj99Ro=",
    "url": "https://impautosuppdev.authentication.ap10.hana.ondemand.com",
    "ecmserviceurl": "https://api-sdm-di.cfapps.ap10.hana.ondemand.com/",
    "repositoryId": "Vendor_Onboading"
}

module.exports = cds.service.impl(async function () {
    const { AccessInfo } = cds.entities;

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

    this.after('READ', 'VenOnboard', async (req) => {
        let today = new Date();
        req.filter(item => today.toISOString() >= item.VenValidTo).map(item => item.ResetValidity = "X");
    });

    this.before('READ', 'VenOnboard', async (req) => {
        if(req._queryOptions && req._queryOptions.venfilter == 'true'){
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

    //Email trigger
    this.on('sendEmail', async (req) => {
        const { vendorName, subject, content, toAddress, ccAddress } = req.data;
        console.log(req.data)

        const payload = {
            Subject: subject,
            Content: `Dear ${vendorName}, ${content} | | Regards | ImperialAuto`,
            Seperator: "|",
            ToAddress: toAddress,
            CCAddress: ccAddress,
            BCCAddress: "",
            CreatedBy: "Manikandan"
        };

        try {
            // Make the API request
            const response = await axios.post('https://imperialauto.co:84/IAIAPI.asmx/SendMail', payload, {
                headers: {
                    'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                return `Email sent successfully.`;
            } else {
                console.error('Error:', response.data);
                throw new Error('Failed to send email');
            }
        } catch (error) {
            console.error('Error:', error);
            throw new Error('Failed to send email');
        }
    });

    //Country Data
    this.on('READ', 'Country', async () => {
        return getCountries();
    });

    //State Data
    this.on('READ', 'States', async (req) => {
        const country = req._queryOptions.country;
        return getStates(country);
    });

    //City Data
    this.on('READ', 'City', async (req) => {
        const { country, state } = req._queryOptions
        return getCities(country, state);
    });

    //UnitCode data
    this.on('READ', 'UnitCodes', async () => {
        return getUnitCodes();
    });

    //SupplierMaster
    this.on('submitFormData', async (req) => {
        const formDataString = req.data.data;
        const formDatapar = JSON.parse(formDataString);
        const formData = JSON.stringify(formDatapar, null, 2)
        return await postFormData(formData);
    });

    //GetSupplierCodeList
    this.on('GetSupplierAccountCodeList', async (req) => {
        const { unitCode } = req.data
        return getSupplierAccountCodeList(unitCode)
    })

    //GetDocumentList
    this.on('GetDocumentList', async (req) => {
        const { unitCode } = req.data
        return getDocumentList(unitCode);
    })

    //TransportersList
    this.on('GetSupplierTransportersList', async (req) => {
        const { unitCode } = req.data
        return getSupplierTransportersList(unitCode);
    })

    //LocationList
    this.on('GetSupplierLocationList', async (req) => {
        const { unitCode } = req.data
        return getSupplierLocationList(unitCode);
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

async function getCountries() {
    try {
        const response = await axios({
            method: 'get',
            url: "https://imperialauto.co:84/IAIAPI.asmx/GetCountryList?RequestBy='Manikandan'",
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });

        const countries = JSON.parse(response.data.d);
        countries.sort((a, b) => a.Country.localeCompare(b.Country));

        return countries.map(country => ({
            code: country.Country
        }));

    } catch (error) {
        console.error("Error fetching country data:", error);
        //throw new Error("Failed to fetch country data");
    }
}

async function getStates(country) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://imperialauto.co:84/IAIAPI.asmx/GetStateList?RequestBy='Manikandan'&Country='${country}'`,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });

        const states = JSON.parse(response.data.d);

        return states.map(state => ({
            name: state.State
        }));
    } catch (error) {
        console.error("Error fetching state data:", error);
        //throw new Error("Failed to fetch state data");
    }
}

async function getCities(country, state) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://imperialauto.co:84/IAIAPI.asmx/GetCityList?RequestBy='Manikandan'&Country='${country}'&State='${state}'`,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });

        const cities = JSON.parse(response.data.d);

        return cities.map(city => ({
            name: city.City
        }));
    } catch (error) {
        console.error("Error fetching city data:", error);
        //throw new Error("Failed to fetch city data");
    }
}

async function getUnitCodes() {
    try {
        const response = await axios({
            method: 'get',
            url: "https://imperialauto.co:84/IAIAPI.asmx/GetUnitCodeList?RequestBy='UnitCode'",
            headers: {
                'Authorization': 'Bearer aum4c9qG+6+0GZmSd3co9Q==',
                'Content-Type': 'application/json'
            },
            data: {}
        });

        const unitCodes = JSON.parse(response.data.d);
        return unitCodes.map(unitCode => ({
            code: unitCode.UnitCode,
            addressCode: unitCode.AddressCode
        }));

    } catch (error) {
        console.error("Error fetching unit code data:", error);
        //throw new Error("Failed to fetch unit code data");
    }
}

async function postFormData(formData) {
    try {
        const response = await axios({
            method: 'POST',
            url: "https://imperialauto.co:84/IAIAPI.asmx/PostSupplierMaster",
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
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
        //throw new Error("Failed to submit form data");
    }
}

async function getSupplierAccountCodeList(unitCode) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://imperialauto.co:84/IAIAPI.asmx/GetSupplierAccountCodeList?RequestBy='Manikandan'&UnitCode='${unitCode}'`,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });

        const accountData = JSON.parse(response.data.d);
        return accountData.map(item => ({
            AcctCode: item.AcctCode,
            AcctName: item.AcctName
        }));

    } catch (error) {
        console.error("Error fetching account data:", error);
        //throw new Error("Failed to fetch account data");
    }
}

async function getDocumentList(unitCode) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://imperialauto.co:84/IAIAPI.asmx/GetDocumentList?RequestBy='Manikandan'&UnitCode='${unitCode}'`,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });
        const documentList = JSON.parse(response.data.d);
        return documentList.map(document => ({
            DocumentsCode: document.DocumentsCode,
            DocumentsName: document.DocumentsName
        }));
    } catch (error) {
        console.error("Error fetching document data:", error);
        //throw new Error("Failed to fetch document data");
    }
}

async function getSupplierTransportersList(unitCode) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://imperialauto.co:84/IAIAPI.asmx/GetSupplierTransportersList?RequestBy='Manikandan'&UnitCode='${unitCode}'`,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });
        const transportersList = JSON.parse(response.data.d);
        return transportersList.map(transporter => ({
            TransportersCode: transporter.TranportersCode,
            TransportersName: transporter.TranportersName
        }));
    } catch (error) {
        console.error("Error fetching transporters data:", error);
        //throw new Error("Failed to fetch transporters data");
    }
}

async function getSupplierLocationList(unitCode) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://imperialauto.co:84/IAIAPI.asmx/GetSupplierLocationList?RequestBy='Manikandan'&UnitCode='${unitCode}'`,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });
        const locationList = JSON.parse(response.data.d);
        return locationList.map(location => ({
            LocationCode: location.LocationCode,
            LocationName: location.LocationName
        }));
    } catch (error) {
        console.error("Error fetching location data:", error);
        //throw new Error("Failed to fetch location data");
    }
}


