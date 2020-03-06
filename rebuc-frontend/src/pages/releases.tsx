import React, {ReactElement, useEffect, useState} from 'react';
import { withNavigationViewController } from '@atlaskit/navigation-next';
import {releasesView} from '../views/releases-view';
import Helmet from 'react-helmet';
import { ErrorFlag } from '../components/elements/failed-flag';
import { FlagGroup } from '@atlaskit/flag';
import {ITableRow} from "../types/types";
import {getReleases} from "../api-helpers/api-releases";
import DynamicTable from "@atlaskit/dynamic-table";
import {Link} from "react-router-dom";
import {EditDeleteButtons} from "../components/buttons/edit-delete-buttons";
import {CreateUpdateReleaseModal} from "../components/modals/add-edit-release-modal";
import {DeleteReleaseModal} from "../components/modals/delete-release-modal";

interface IReleasesRouteBaseProps {
    navigationViewController: any;
}

const tableHeader = {
    cells: [
        {
            key: 'name',
            content: 'Name',
            isSortable: true,
            width: 10
        },
        {
            key: 'start_build',
            content: "Start build",
            isSortable: true,
            width: 10
        },
        {
            key: 'build_mask',
            content: "Build mask",
            width: 10
        },
        {
            key: 'description',
            content: 'Description',
            isSortable: true
        },
        {
            key: 'release-date',
            content: 'Release Date',
            isSortable: true,
            width: 10
        },
        {
            key: 'builds',
            content: 'Builds #',
            isSortable: true,
            width: 7
        },
        {
            key: 'actions',
            width: 8
        },

    ]
};

export const ReleasesRouteBase = (props: IReleasesRouteBaseProps) => {
    const [flagGroup, setFlagGroup] = useState<ReactElement[]>([]);
    const [flagCounter, setFlagCounter] = useState<number>(0);
    const [releases, setReleases] = useState<ITableRow[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchReleases = () => {
        setIsLoading(true);
        getReleases()
            .then((resp) => {
                let newReleases = [];
                for (let release of resp.data) {
                    newReleases.push({
                        key: `${release.name}-${release.id}`,
                        cells: [
                            {
                                key: `${release.name}-name-${release.id}`,
                                content: (<Link to={{
                                    pathname: '/builds',
                                    state: {
                                        release: release
                                    }
                                }}>{release.name}</Link>)
                            },
                            {
                                key: `${release.name}-start-build-${release.id}`,
                                content: release.release_pattern.start_build.name
                            },
                            {
                                key: `${release.name}-build-mask-${release.id}`,
                                content: release.release_pattern.build_mask
                            },
                            {
                                key: `${release.name}-description-${release.id}`,
                                content: release.description
                            },
                            {
                                key: `${release.name}-release-date-${release.id}`,
                                content: release.release_date
                            },
                            {
                                key: `${release.name}-builds-${release.id}`,
                                content: release.builds.length
                            },
                            {
                                key: `${release.name}-actions-${release.id}`,
                                content: (
                                    <EditDeleteButtons
                                        editModal={CreateUpdateReleaseModal}
                                        instance={release}
                                        callback={fetchReleases}
                                        deleteModal={DeleteReleaseModal}
                                        addErrorFlag={addErrorFlag}
                                    />
                                )
                            }
                        ]
                    });
                }
                setReleases(newReleases);
                setIsLoading(false);
        })
    };

    useEffect(() => {
        props.navigationViewController.setView(releasesView.id);
        setFlagGroup([]);
        fetchReleases();
        // eslint-disable-next-line
    }, [props.navigationViewController]);

    const addErrorFlag = (title: string, description: string) => {
        const newFlagGroup = flagGroup.slice();
        setFlagCounter(flagCounter + 1);
        const flagId = flagCounter.toString();
        const newFlagElement =
            <ErrorFlag
                description={description}
                title={title}
                id={flagId}
                key={'flag-' + flagId}
            />
        ;

        newFlagGroup.push(newFlagElement);
        setFlagGroup(newFlagGroup);
        setTimeout(() => handleDismiss(), 7000);
    };

    const handleDismiss = () => {
        setFlagCounter(flagCounter - 1);
        setFlagGroup(flagGroup.slice(1));
    };

    return (
            <div style={{ padding: 30 }} data-cy='releasesList'>
                <Helmet>
                    <title>Releases</title>
                </Helmet>
                <h2>Releases</h2>
                <div style={{paddingTop: 30}}>
                <CreateUpdateReleaseModal isEdit={false} callback={fetchReleases} addErrorFlag={addErrorFlag}/>
                </div>
                <div style={{paddingTop: 30, wordBreak: "break-all"}}>
                    <DynamicTable
                        head={tableHeader}
                        rows={releases}
                        isLoading={isLoading}
                        rowsPerPage={10}
                        defaultSortKey={'name'}
                        defaultSortOrder={'ASC'}
                    />
                </div>
                <FlagGroup>{flagGroup}</FlagGroup>
          </div>
        );
};

export const ReleasesRoute = withNavigationViewController(ReleasesRouteBase);
