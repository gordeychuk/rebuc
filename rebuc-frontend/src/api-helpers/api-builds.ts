import { axClient } from './api-client';
import {AxiosResponse} from "axios";

export const getBuilds = () => {
    return axClient.get('builds/')
        .then(((resp: AxiosResponse) => resp));
};

export const postBuilds = (data: any) => {
    return axClient.post('builds/', data)
        .then(((resp: AxiosResponse) => resp));
};

export const putBuild = (data: any, buildId: string) => {
    return axClient.put(`builds/${buildId}/`, data)
        .then(((resp: AxiosResponse) => resp));
};

export const getBuildsForRelease = (releaseId: string) => {
    return axClient.get(`builds?release_id=${releaseId}/`)
        .then(((resp: AxiosResponse) => resp));
};

export const getBuildsWithoutRelease = () => {
    return axClient.get(`builds?release_id=0/`)
        .then(((resp: AxiosResponse) => resp));
};

export const deleteBuild = (buildId: string) => {
    return axClient.delete(`builds/${buildId}/`)
        .then(((resp: AxiosResponse) => resp));
};

