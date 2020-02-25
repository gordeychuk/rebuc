import React, { Component } from 'react';
import { GlobalItem } from '@atlaskit/navigation-next';
import AppSwitcherIcon from '@atlaskit/icon/glyph/app-switcher';
import Drawer, {DrawerItem, DrawerItemGroup} from '@atlaskit/drawer';
import BitbucketPipelinesIcon from '@atlaskit/icon/glyph/bitbucket/pipelines';
import JiraLabsIcon from '@atlaskit/icon/glyph/jira/labs';
import MediaServicesSpreadsheetIcon from '@atlaskit/icon/glyph/media-services/spreadsheet';

interface IAppSwitcherState {
    isOpen: boolean;
    redirectTo: string;
}

export class AppSwitcher extends Component<IAppSwitcherState> {
    state = {
        isOpen: false,
    };

    open = () => this.setState({isOpen: true});
    close = () => this.setState({isOpen: false});

    render() {
        return (
            <div css={{ padding: '2rem' }}>
                <Drawer
                    onClose={this.close}
                    isOpen={this.state.isOpen}
                    width='narrow'
                >
                    <DrawerItemGroup title='Applications' isCompact={true}>
                        <DrawerItem
                            elemBefore={((<BitbucketPipelinesIcon label=''/>) as unknown) as Node}
                            onClick={this.close}
                        >
                            Release build configuration
                        </DrawerItem>
                    </DrawerItemGroup>
                </Drawer>
                <GlobalItem
                    icon={AppSwitcherIcon}
                    id='appSwitcher'
                    onClick={this.open}
                />
            </div>
        );
    }
}
