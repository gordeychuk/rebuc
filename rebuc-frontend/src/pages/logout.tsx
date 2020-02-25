import React, { useEffect } from 'react';
// import { loginView } from '../views/login-view';
import Button from '@atlaskit/button';
import { useAuth } from '../context/auth';
import { withNavigationViewController } from '@atlaskit/navigation-next';
import {releasesView} from "../views/releases-view";

interface ILogoutProps {
    navigationViewController: any;
    history: any;
}

const Logout = (props: ILogoutProps) => {
    const { setUser } = useAuth();

    useEffect(() => {
        props.navigationViewController.setView(releasesView.id);
    }, [props.navigationViewController]);

    function logOut() {
        setUser(undefined);
        localStorage.removeItem('user_rebuc');
        props.history.push('/');
    }

    return (
        <div>
            <h2>Log out</h2>
            <Button onClick={logOut}>Log out</Button>
        </div>
    );
};

export const logoutRoute = withNavigationViewController(Logout);
