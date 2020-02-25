import GlobalNavigation from '@atlaskit/global-navigation';
import BitbucketPipelinesIcon from '@atlaskit/icon/glyph/bitbucket/pipelines';
import { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import React from 'react';
import { useAuth } from '../context/auth';
import { addTokenToHeaders } from '../api-helpers/api-client';
import { AppSwitcher } from './elements/app-switcher';

export const MainGlobalNavigation = () => {
    const {user, setUser} = useAuth();

    const LogOut = () => {
        setUser(undefined);
        localStorage.removeItem('user_rebuc');
        addTokenToHeaders('');
    };

    const ExampleDropdown = () => (
        <DropdownItemGroup title={user.firstName + ' ' + user.lastName}>
            <DropdownItem>
                <p onClick={LogOut}>Logout</p>
            </DropdownItem>
        </DropdownItemGroup>
    );

    return (
        <GlobalNavigation
            productIcon={BitbucketPipelinesIcon}
            productTooltip='Rebuc'
            productHref='#'
            appSwitcherComponent={AppSwitcher}
            appSwitcherTooltip='Switch to ...'
            loginHref='#login'
            profileItems={user ? ExampleDropdown : undefined}
            profileIconUrl={user ? user.avatarUrl : ''}
            onHelpClick={() => console.log('help clicked')}
            enableHelpDrawer={true}
        />);
};
