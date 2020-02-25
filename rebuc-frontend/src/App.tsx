import React, { useState } from 'react';
import { MainNavigation } from './components/navigation-provider';
import '@atlaskit/css-reset';
import Helmet from 'react-helmet';
import { AuthContext, getLocalStorageUser } from './context/auth';

export const App = () => {
    const [user, setUser] = useState(getLocalStorageUser());

    const setStateUser = (data: any) => {
        if (data) {
            localStorage.setItem('user_rebuc', JSON.stringify(data));
        }
        setUser(data);
    };

    return (
        <div>
            <Helmet>
                <title>Rebuc</title>
            </Helmet>
            <AuthContext.Provider value={{ user, setUser: setStateUser}}>
                <MainNavigation />
            </AuthContext.Provider>
        </div>

    );
};

export default App;
