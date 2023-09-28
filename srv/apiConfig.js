const API_BASE_URL = 'https://preproduction.signzy.tech/api/v2/patrons/650a8f2bab5b3c002231b131';
const COMMON_HEADERS = {
    'Accept-Language': 'en-US,en;q=0.8',
    'Accept': '*/*'
};
const AUTHORIZATION_KEY = 'HbvdGH6Ulx4eLkBhE4ohGweCtM2stZEga6cW7YzMCHzjM9JHWC4nNwDNteBtzn4Z';

module.exports = {
    panOptions: {
        method: 'POST',
        url: `${API_BASE_URL}/panv2`,
        headers: {
            ...COMMON_HEADERS,
            'Authorization': AUTHORIZATION_KEY
        }
    },
    gstOptions: {
        method: 'POST',
        url: `${API_BASE_URL}/gstns`,
        headers: {
            ...COMMON_HEADERS,
            'Content-Type': 'application/json',
            'Authorization': AUTHORIZATION_KEY
        }
    },
    bankOptions: {
        method: 'POST',
        url: `${API_BASE_URL}/bankaccountverifications`,
        headers: {
            ...COMMON_HEADERS,
            'Content-Type': 'application/json',
            'Authorization': AUTHORIZATION_KEY
        }
    }
};
