import { axClient } from './api-client';

export const postLogin = (username: string, password: string) => {
    return axClient.post('login/', JSON.stringify({username, password}))
        .then(((resp: any) => resp));
};
