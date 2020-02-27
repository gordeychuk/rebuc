import React from 'react';
import { render, fireEvent, configure, queryByAttribute, waitForElement } from '@testing-library/react';
import {CreateUpdateReleaseModal} from "../add-edit-release-modal";
import {act} from "react-dom/test-utils";
import { AuthContext } from '../../../context/auth';
import * as apiReleases from "../../../api-helpers/api-releases";

configure({testIdAttribute: 'data-cy'});
jest.mock("../../../api-helpers/api-builds");
jest.mock("../../../api-helpers/api-releases");

const DOWN_ARROW = { keyCode: 40 };
const testRelease = {
    id: '0',
    name: 'test',
    description: 'testdesc',
    release_date: '2020-01-02',
    builds: [],
    release_pattern: {build_mask: '1.x', start_build: {id: '1', name: '1.0.0'}}
};

const renderCreateModal = () => {
    return render(
        <AuthContext.Provider value={{user: 'user', setUser: () => {}}}>
            <CreateUpdateReleaseModal isEdit={false} callback={() => {}} addErrorFlag={() => {}}/>
        </AuthContext.Provider>
        );
};

const renderEditModal = () => {
    return render(
        <AuthContext.Provider value={{user: 'user', setUser: () => {}}}>
            <CreateUpdateReleaseModal
                isEdit={true}
                callback={() => {}}
                addErrorFlag={() => {}}
                instance={testRelease}
                trigger={<button>test</button>}/>
        </AuthContext.Provider>
        );
};

const openReleaseModal = (modal: any) => {
    act(() => {
        fireEvent.click(modal.getByTestId('openAddRelease'));
    });
};

const submitReleaseModal = (modal: any) => {
    act(() => {
        fireEvent.click(modal.getByTestId('confirmReleaseModal'));
    });
};

const selectBuild = async (modal: any) => {
    const buildSelect = modal.getByTestId('releaseStartBuild').querySelector('#buildSelect');
    if (buildSelect) {
        fireEvent.keyDown(buildSelect, DOWN_ARROW);
    }

    const option = await waitForElement(() => modal.getByText('1.0.0'));
    fireEvent.click(option);
};

test('opens create release modal', () => {
    const modal = renderCreateModal();
    act(() => {
        fireEvent.click(modal.getByTestId('openAddRelease'));
    });
    expect(modal.getByTestId('releaseModal')).toBeInTheDocument();
});

test('opens edit release modal', () => {
    const modal = renderEditModal();
    openReleaseModal(modal);

    expect(modal.getByTestId('releaseModal')).toBeInTheDocument();
    expect(modal.getByText(testRelease.name)).toBeInTheDocument();
    expect(modal.getByDisplayValue(testRelease.description)).toBeInTheDocument();
    expect(modal.getByDisplayValue(testRelease.release_date)).toBeInTheDocument();
    expect(modal.getByDisplayValue(testRelease.release_pattern.build_mask)).toBeInTheDocument();
    expect(modal.getByText(testRelease.release_pattern.start_build.name)).toBeInTheDocument();
});

test('shows create release modal validation errors empty name', async () => {
    const modal = renderCreateModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.0.x'}});
    await selectBuild(modal);
    submitReleaseModal(modal);
    expect(modal.queryByText('Build mask cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build cannot be empty.')).toBeNull();
    expect(modal.queryByText('Release name cannot be empty.')).toBeInTheDocument();
    expect(modal.queryByText('Start build doesn\'t fit instance mask')).toBeNull();
});

test('shows edit release modal validation errors empty name', async () => {
    const modal = renderEditModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseName'), {target: {value: ''}});
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.0.x'}});
    await selectBuild(modal);
    submitReleaseModal(modal);
    expect(modal.queryByText('Build mask cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build cannot be empty.')).toBeNull();
    expect(modal.queryByText('Release name cannot be empty.')).toBeInTheDocument();
    expect(modal.queryByText('Start build doesn\'t fit instance mask')).toBeNull();
});

test('shows create release modal validation errors empty start build', () => {
    const modal = renderCreateModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseName'), {target: {value: '1.0.0'}});
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.0.x'}});
    submitReleaseModal(modal);
    expect(modal.queryByText('Build mask cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build cannot be empty.')).toBeInTheDocument();
    expect(modal.queryByText('Release name cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build doesn\'t fit instance mask')).toBeNull();
});

test('shows create release modal validation errors empty build mask', async () => {
    const modal = renderCreateModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseName'), {target: {value: '1.0.0'}});
    await selectBuild(modal);
    submitReleaseModal(modal);
    expect(modal.queryByText('Build mask cannot be empty.')).toBeInTheDocument();
    expect(modal.queryByText('Start build cannot be empty.')).toBeNull();
    expect(modal.queryByText('Release name cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build doesn\'t fit instance mask')).toBeNull();
});

test('shows edit release modal validation errors empty build mask', async () => {
    const modal = renderEditModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: ''}});
    // await selectBuild(modal);
    submitReleaseModal(modal);
    expect(modal.queryByText('Build mask cannot be empty.')).toBeInTheDocument();
    expect(modal.queryByText('Start build cannot be empty.')).toBeNull();
    expect(modal.queryByText('Release name cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build doesn\'t fit instance mask')).toBeNull();
});

test('shows create release modal validation errors build doesn\'t fit the mask', async () => {
    const modal = renderCreateModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseName'), {target: {value: '1.0.0'}});
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.x'}});
    await selectBuild(modal);
    submitReleaseModal(modal);
    expect(modal.queryByText('Build mask cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build cannot be empty.')).toBeNull();
    expect(modal.queryByText('Release name cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build doesn\'t fit instance mask')).toBeInTheDocument();
});

test('shows edit release modal validation errors build doesn\'t fit the mask', async () => {
    const modal = renderEditModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.x'}});
    submitReleaseModal(modal);
    expect(modal.queryByText('Build mask cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build cannot be empty.')).toBeNull();
    expect(modal.queryByText('Release name cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build doesn\'t fit instance mask')).toBeInTheDocument();
});

test('submit create release modal', async () => {
    const modal = renderCreateModal();
    const mockPostRelease = jest.spyOn(apiReleases, 'postRelease');
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseName'), {target: {value: '1.0.0'}});
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.0.x'}});
    await selectBuild(modal);
    submitReleaseModal(modal);
    expect(mockPostRelease).toBeCalledTimes(1);
    expect(modal.queryByText('Build mask cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build cannot be empty.')).toBeNull();
    expect(modal.queryByText('Release name cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build doesn\'t fit instance mask')).toBeNull();
});

test('submit edit release modal', async () => {
    const modal = renderEditModal();
    const mockPostRelease = jest.spyOn(apiReleases, 'putRelease');
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseName'), {target: {value: '1.0.0'}});
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.0.x'}});
    await selectBuild(modal);
    submitReleaseModal(modal);
    expect(mockPostRelease).toBeCalledTimes(1);
    expect(modal.queryByText('Build mask cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build cannot be empty.')).toBeNull();
    expect(modal.queryByText('Release name cannot be empty.')).toBeNull();
    expect(modal.queryByText('Start build doesn\'t fit instance mask')).toBeNull();
});
