import React, { PureComponent, ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom';

import {
    LayoutManagerWithViewController,
    withNavigationViewController,
} from '@atlaskit/navigation-next';
import { MainGlobalNavigation } from './global-navigation';
import { releasesView } from '../views/releases-view';
import { loginRoute } from '../pages/login';
import { logoutRoute } from '../pages/logout';
import {ReleasesRoute} from "../pages/releases";
import {BuildsRoute} from "../pages/builds";
import {IUser} from "../types/types";
import {ApiRoute} from "../pages/restapi";

interface ILayoutManagerProps {
    navigationViewController: any;
    user: IUser | undefined;
}

interface ILayoutManagerState {
    flagGroup: ReactElement[];
}

class LayoutManager extends PureComponent<ILayoutManagerProps, ILayoutManagerState> {

    componentDidMount(): void {
        const { navigationViewController } = this.props;
        navigationViewController.addView(releasesView);
    }

    render() {

        return (
            <LayoutManagerWithViewController
                globalNavigation={MainGlobalNavigation}
                collapseToggleTooltipContent=''
            >
                <Switch>
                    <Route path={'/login'} component={loginRoute} />
                    <Route path={'/logout'} component={logoutRoute} />
                    <Route path={'/builds'} component={BuildsRoute} />
                    <Route path={'/restapi'} component={ApiRoute} />
                    <Route path={'/'} render={ReleasesRoute} />
                </Switch>

            </LayoutManagerWithViewController>
        );
    }

}

export const LayoutManagerWithNavViewController = withNavigationViewController(LayoutManager);
