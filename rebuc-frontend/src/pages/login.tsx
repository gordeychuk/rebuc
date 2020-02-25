import React, { useEffect, useState } from 'react';
import { withNavigationViewController } from '@atlaskit/navigation-next';
import { StyledTextField } from '../components/elements/styled-text-field';
import Button from '@atlaskit/button';
import { useAuth } from '../context/auth';
import { postLogin } from '../api-helpers/api-auth';
import { addTokenToHeaders } from '../api-helpers/api-client';
import {releasesView} from "../views/releases-view";
import { errorStyle } from '../style/styles';

interface ILoginProps {
    navigationViewController: any;
    history: any;
}

const LoginBase = (props: ILoginProps) => {
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean>(true);
    const { setUser } = useAuth();

    useEffect(() => {
        props.navigationViewController.setView(releasesView.id);
    }, [props.navigationViewController]);

    const handleSave = () => {
        postLogin(login, password)
            .then((resp: any) => {
                addTokenToHeaders(resp.data.token);
                setUser({
                    avatarUrl: resp.data.avatar_url,
                    firstName: resp.data.first_name,
                    isAdmin: resp.data.is_admin,
                    lastName: resp.data.last_name,
                    token: resp.data.token,
                });
                props.history.push('/');
            })
            .catch(() => setIsValid(false));

    };

    const handleLogin = (e: any) => {
        setLogin(e.target.value);
    };

    const handlePassword = (e: any) => {
        setPassword(e.target.value);
    };

    const handleKeyDown = (e: any) => {
        if (e.keyCode === 13) {
            handleSave();
        }
    };

    const handleLoginFunc = (e: any) => handleLogin(e);
    const handlePasswordFunc = (e: any) => handlePassword(e);
    const handleKeyDownFunc = (e: any) => handleKeyDown(e);
    const handleSaveFunc = () => handleSave();

    return (
        <div style={{padding: 20}}>
            <h2>Login page</h2>
            <br/>
            {!isValid && (<p style={errorStyle}>Incorrect username and password.</p>)}
            <StyledTextField
                onChange={handleLoginFunc}
                value={login}
                placeholder='Enter login'
                description='Login'
                incorrectMessage='Incorrect login'
                isValid={true}
                width={300}
                isDisabled={false}
                autoFocus={true}
                withRightPadding={true}
            />
            <br/>
            <StyledTextField
                onChange={handlePasswordFunc}
                value={password}
                placeholder='Enter password'
                description='Password'
                incorrectMessage='Incorrect password'
                isValid={true}
                width={300}
                isDisabled={false}
                type='password'
                onKeyDown={handleKeyDownFunc}
                withRightPadding={true}
            />
            <br/>
            <br/>
            <Button appearance='primary' onClick={handleSaveFunc}>
                Login
            </Button>

        </div>
    );
};

export const loginRoute = withNavigationViewController(LoginBase);
