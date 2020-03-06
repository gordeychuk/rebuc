import React from 'react';
import { render, fireEvent, configure } from '@testing-library/react';
import {CreateUpdateReleaseModal} from "../add-edit-release-modal";
import {act} from "react-dom/test-utils";
import { AuthContext } from '../../../context/auth';
import * as apiReleases from "../../../api-helpers/api-releases";
import {selectBuild} from "../__tests_helpers__/common";

configure({testIdAttribute: 'data-cy'});
jest.mock("../../../api-helpers/api-builds");
jest.mock("../../../api-helpers/api-releases");


const testRelease = {
    id: '0',
    name: 'Release 1',
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

const checkWarnings = (
    modal: any, nameEmpty: boolean, maskEmpty: boolean, maskInvalid: boolean, startBuildEmpty: boolean) => {
    const errorMessages = {
        'Release name cannot be empty.': nameEmpty,
        'Build mask cannot be empty.': maskEmpty,
        'Start build doesn\'t fit instance mask': maskInvalid,
        'Start build cannot be empty.': startBuildEmpty
    };

    for (let [message, value] of Object.entries(errorMessages)) {
        if (value) {
            expect(modal.queryByText(message)).toBeNull();
        } else {
            expect(modal.queryByText(message)).toBeInTheDocument();
        }
    }
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
    expect(modal.getByPlaceholderText('Enter name').getAttribute('value')).toEqual(testRelease.name);
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
    checkWarnings(modal, false, true, true, true);
});

test('shows edit release modal validation errors empty name', async () => {
    const modal = renderEditModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseName'), {target: {value: ''}});
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.0.x'}});
    await selectBuild(modal);
    submitReleaseModal(modal);
    checkWarnings(modal, false, true, true, true);
});

test('shows create release modal validation errors empty start build', () => {
    const modal = renderCreateModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseName'), {target: {value: '1.0.0'}});
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.0.x'}});
    submitReleaseModal(modal);
    checkWarnings(modal, true, true, true, false);
});

test('shows create release modal validation errors empty build mask', async () => {
    const modal = renderCreateModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseName'), {target: {value: '1.0.0'}});
    await selectBuild(modal);
    submitReleaseModal(modal);
    checkWarnings(modal, true, false, true, true);
});

test('shows edit release modal validation errors empty build mask', async () => {
    const modal = renderEditModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: ''}});
    submitReleaseModal(modal);
    checkWarnings(modal, true, false, true, true);
});

test('shows create release modal validation errors build doesn\'t fit the mask', async () => {
    const modal = renderCreateModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseName'), {target: {value: '1.0.0'}});
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.x'}});
    await selectBuild(modal);
    submitReleaseModal(modal);
    checkWarnings(modal, true, true, false, true);
});

test('shows edit release modal validation errors build doesn\'t fit the mask', async () => {
    const modal = renderEditModal();
    openReleaseModal(modal);
    fireEvent.change(modal.getByTestId('releaseBuildMask'), {target: {value: '1.x'}});
    submitReleaseModal(modal);
    checkWarnings(modal, true, true, false, true);
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
    checkWarnings(modal, true, true, true, true);
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
    checkWarnings(modal, true, true, true, true);
});
