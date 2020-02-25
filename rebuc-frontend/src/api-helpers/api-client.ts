import axios  from 'axios';
import axiosRetry from 'axios-retry';

const headersOptions = {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
            'Content-Type': 'application/json',
};

export const axClient = axios.create({ baseURL: 'http://localhost:8002/api-v1/', headers: headersOptions});
axClient.defaults.headers.common.Authorization = '';

axiosRetry(axClient, {retries: 3, retryCondition: ((error: any) => {
    return error.message === 'Network Error';
})});

export function addTokenToHeaders(token: string) {
    axClient.defaults.headers.common.Authorization = token ? 'Token ' + token : '';
}
