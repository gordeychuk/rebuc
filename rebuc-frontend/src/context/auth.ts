import { createContext, useContext } from 'react';
import { addTokenToHeaders } from '../api-helpers/api-client';

export const getLocalStorageUser = () => {
    const user = localStorage.getItem('user_rebuc');
    if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser) {
            addTokenToHeaders(parsedUser.token);
            return parsedUser;
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
};

export const AuthContext = createContext({
    setUser: (data: any) => {},
    user: getLocalStorageUser(),
});

export function useAuth() {
    return useContext(AuthContext);
}
