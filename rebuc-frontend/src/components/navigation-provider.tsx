import React from 'react';
import { HashRouter } from 'react-router-dom';
import { LayoutManagerWithNavViewController } from './layout-manager';
import {
    NavigationProvider,
} from '@atlaskit/navigation-next';
import { useAuth } from '../context/auth';

export const MainNavigation = () => {
    const { user } = useAuth();

    return (
        <HashRouter>
            <NavigationProvider>
                <LayoutManagerWithNavViewController user={user} />
            </NavigationProvider>
        </HashRouter>
    );
};
