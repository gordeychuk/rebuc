import { axClient } from './api-client';
import {AxiosResponse} from "axios";

export const getReleases = () => {
    return axClient.get('releases/')
        .then((resp: AxiosResponse) => resp);
};

export const postRelease = (data: any) => {
    return axClient.post('releases/', data)
        .then((resp: AxiosResponse) => resp);
};

export const putRelease = (releaseId: string, data: any) => {
    return axClient.put(`releases/${releaseId}/`, data)
        .then((resp: AxiosResponse) => resp);
};

export const deleteRelease = (releaseId: any) => {
    return axClient.delete('releases/' + releaseId + '/')
        .then((resp: AxiosResponse) => resp);
};
