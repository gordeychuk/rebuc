import React, {ReactElement, useEffect, useState} from 'react';
import { withNavigationViewController } from '@atlaskit/navigation-next';
import {releasesView} from '../views/releases-view';
import Helmet from 'react-helmet';
import {ReleasesSelect} from "../components/elements/releases-select";
import { ISelectValue, ITableRow } from "../types/types";
import { StyledElement } from "../components/elements/styled-element";
import DynamicTable from "@atlaskit/dynamic-table";
import { getBuildsForRelease, getBuildsWithoutRelease } from "../api-helpers/api-builds";
import {CreateUpdateBuildModal} from "../components/modals/add-edit-build-modal";
import {EditDeleteButtons} from "../components/buttons/edit-delete-buttons";
import {DeleteBuildModal} from "../components/modals/delete-build-modal";
import { ErrorFlag } from '../components/elements/failed-flag';
import { FlagGroup } from '@atlaskit/flag';
// import { useAuth } from '../context/auth';

interface IBuildsRouteBaseProps {
    navigationViewController: any;
    location: any;
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
            key: 'release-date',
            content: "Release Date",
            isSortable: true,
            width: 10
        },
        {
            key: 'url',
            content: "URL",
            width: 20,
        },
        {
            key: 'description',
            content: 'Description',
            isSortable: true
        },
        {
            key: 'instance-notes',
            content: 'Release Notes',
            isSortable: true,
            // width: 20
        },
        {
            key: 'actions',
            width: 10
        },

    ]
};

const BuildsRouteBase = (props: IBuildsRouteBaseProps) => {
    const [flagGroup, setFlagGroup] = useState<ReactElement[]>([]);
    const [flagCounter, setFlagCounter] = useState<number>(0);
    const [releaseSelection, setReleaseSelection] = useState<ISelectValue>(
        props.location.state ?
            { label: props.location.state.release.name,
                value: props.location.state.release.id }
                : { label: "Without release", value: "0" });
    const [isLoading, setIsLoding] = useState<boolean>(true);
    const [builds, setBuilds] = useState<ITableRow[]>();

    const fetchBuilds = () => {
        setIsLoding(true);
        const getTargetEndpoint = releaseSelection.value === "0" ? getBuildsWithoutRelease :
            () => getBuildsForRelease(releaseSelection.value);

        getTargetEndpoint()
            .then(resp => {
                let buildsTemp = [];
                for (let build of resp.data) {
                    buildsTemp.push({
                        key: `build-${build.id}`,
                        cells: [
                            {
                                key: `build-${build.id}-name`,
                                content: build.name
                            },
                            {
                                key: `build-${build.id}-release-date`,
                                content: build.release_date
                            },
                            {
                                key: `build-${build.id}-url`,
                                content: (<a href={build.url} target={'_blank noopener noreferrer'}>{build.url}</a>)
                            },
                            {
                                key: `build-${build.id}-description`,
                                content: build.description
                            },
                            {
                                key: `build-${build.id}-release-notes`,
                                content: build.release_notes
                            },
                            {
                                key: `build-${build.id}-actions`,
                                content: <EditDeleteButtons
                                    editModal={CreateUpdateBuildModal}
                                    instance={build}
                                    callback={fetchBuilds}
                                    deleteModal={DeleteBuildModal}
                                    release={releaseSelection.value === "0" ? undefined : releaseSelection}
                                    addErrorFlag={addErrorFlag}
                                />
                            },
                        ]
                    })
                }
                setBuilds(buildsTemp);
                setIsLoding(false);
            })
            // .catch(error => addErrorFlag('Error', error))
    };

    useEffect(() => {
        props.navigationViewController.setView(releasesView.id);
        setFlagGroup([]);
        fetchBuilds();
        // eslint-disable-next-line
    }, [props.navigationViewController]);

    // eslint-disable-next-line
    useEffect(() => {fetchBuilds();}, [releaseSelection]);

    const addErrorFlag = (title: string, description: string) => {
        const newFlagGroup = flagGroup.slice();
        setFlagCounter(flagCounter + 1);
        const flagId = flagCounter.toString();
        const newFlagElement = (
            <ErrorFlag
                description={description}
                title={title}
                id={flagId}
                key={'flag-' + flagId}
            />
        );

        newFlagGroup.push(newFlagElement);
        setFlagGroup(newFlagGroup);
        setTimeout(() => handleDismiss(), 7000);
    };

    const handleDismiss = () => {
        setFlagCounter(flagCounter - 1);
        setFlagGroup(flagGroup.slice(1));
    };

    const handleReleseSelect = (e: any) => {
        setReleaseSelection(e);
    };

    return (
            <div style={{ padding: 30 }} data-cy='buildsList'>
                <Helmet>
                    <title>Builds</title>
                </Helmet>
                <h2>Builds</h2>
                <div style={{paddingTop: 10, display: "flex", flexDirection: "row"}}>
                    <StyledElement
                        targetElement={
                            <ReleasesSelect
                                onChange={handleReleseSelect}
                                value={releaseSelection}
                                defaultValue={
                                    props.location.state ?
                                        { label: props.location.state.release.name,
                                            value: props.location.state.release.id }
                                        : { label: "Without instance", value: "0" }
                                }
                            />}
                        description={"Release"}
                        incorrectMessage={""}
                        isValid={true}
                        width={300}
                        withRightPadding={false}
                    />
                    <span style={{paddingLeft: 10, paddingTop: 10, alignSelf: "center"}}>
                        <CreateUpdateBuildModal isEdit={false}
                                                callback={fetchBuilds}
                                                release={releaseSelection}
                                                addErrorFlag={addErrorFlag}
                        />
                    </span>
                </div>
                <div style={{paddingTop: 10, wordBreak: "break-all"}}>
                    <DynamicTable
                        head={tableHeader}
                        rows={builds}
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

export const BuildsRoute = withNavigationViewController(BuildsRouteBase);
