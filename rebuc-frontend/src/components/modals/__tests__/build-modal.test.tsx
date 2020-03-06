import React from 'react';
import { render, fireEvent, configure } from '@testing-library/react';
import {CreateUpdateBuildModal} from "../add-edit-build-modal";
import {act} from "react-dom/test-utils";
import { AuthContext } from '../../../context/auth';
import * as apiBuilds from "../../../api-helpers/api-builds";
import {DOWN_ARROW, ENTER, selectBuild, selectRelease} from "../__tests_helpers__/common";

configure({testIdAttribute: 'data-cy'});
jest.mock("../../../api-helpers/api-builds");
jest.mock("../../../api-helpers/api-releases");


const testBuild = {
    id: '0',
    name: 'v1.1',
    description: 'testdesc',
    release_date: '2020-01-02',
    release_notes: 'test_notes',
    url: 'test.com',
    release: 'Release 1'
};

const testReleaseSelectValue = {
    label: 'Release 1',
    value: '1'
};

const renderCreateModal = () => {
    return render(
        <AuthContext.Provider value={{user: 'user', setUser: () => {}}}>
            <CreateUpdateBuildModal isEdit={false} release={testReleaseSelectValue}
                                    callback={() => {}} addErrorFlag={() => {}}/>
        </AuthContext.Provider>
        );
};

const renderEditModal = () => {
    return render(
        <AuthContext.Provider value={{user: 'user', setUser: () => {}}}>
            <CreateUpdateBuildModal
                isEdit={true}
                callback={() => {}}
                addErrorFlag={() => {}}
                instance={testBuild}
                trigger={<button>test</button>}
                release={testReleaseSelectValue}
            />

        </AuthContext.Provider>
        );
};

const openBuildModal = (modal: any) => {
    act(() => {
        fireEvent.click(modal.getByTestId('openAddBuild'));
    });
};

const submitBuildModal = (modal: any) => {
    act(() => {
        fireEvent.click(modal.getByTestId('confirmBuildModal'));
    });
};

const checkWarnings = (
    modal: any, nameEmpty: boolean, releaseDateEmpty: boolean, urlEmpty: boolean) => {
    const errorMessages = {
        'Build name cannot be empty.': nameEmpty,
        'Release date cannot be empty.': releaseDateEmpty,
        'URL cannot be empty': urlEmpty,
    };

    for (let [message, value] of Object.entries(errorMessages)) {
        if (value) {
            expect(modal.queryByText(message)).toBeNull();
        } else {
            expect(modal.queryByText(message)).toBeInTheDocument();
        }
    }
};

const selectReleaseDate = (modal: any) => {
    const input = modal.getByTestId('releaseDate').querySelector('[name="releaseDateName"]');
    if (input) {
        fireEvent.keyDown(input, DOWN_ARROW);
        fireEvent.keyDown(input, DOWN_ARROW);
        fireEvent.keyDown(input, ENTER);
    }
};
test('opens create build modal', () => {
    const modal = renderCreateModal();
    act(() => {
        fireEvent.click(modal.getByTestId('openAddBuild'));
    });
    expect(modal.getByTestId('buildModal')).toBeInTheDocument();
});

test('opens edit build modal', () => {
    const modal = renderEditModal();
    openBuildModal(modal);
    expect(modal.getByTestId('buildModal')).toBeInTheDocument();
    expect(modal.getByPlaceholderText('Enter name').getAttribute('value')).toEqual(testBuild.name);
    expect(modal.getByDisplayValue(testBuild.description)).toBeInTheDocument();
    expect(modal.getByDisplayValue(testBuild.release_date)).toBeInTheDocument();
    expect(modal.getByDisplayValue(testBuild.release_notes)).toBeInTheDocument();
    expect(modal.getByDisplayValue(testBuild.url)).toBeInTheDocument();
    expect(modal.getByText(testBuild.release)).toBeInTheDocument();
});

test('shows create build modal validation errors empty name', async () => {
    const modal = renderCreateModal();
    openBuildModal(modal);
    fireEvent.change(modal.getByTestId('buildUrl'), {target: {value: 'test.com'}});
    selectReleaseDate(modal);
    await selectRelease(modal);
    submitBuildModal(modal);
    modal.debug();
    checkWarnings(modal, false, true, true);
});

test('shows edit build modal validation errors empty name', async () => {
    const modal = renderEditModal();
    openBuildModal(modal);
    fireEvent.change(modal.getByTestId('buildName'), {target: {value: ''}});
    fireEvent.change(modal.getByTestId('buildUrl'), {target: {value: 'test.com'}});
    selectReleaseDate(modal);
    await selectRelease(modal);
    submitBuildModal(modal);
    modal.debug();
    checkWarnings(modal, false, true, true);
});

test('shows create build modal validation errors empty url', async () => {
    const modal = renderCreateModal();
    openBuildModal(modal);
    fireEvent.change(modal.getByTestId('buildName'), {target: {value: 'v1.0'}});
    selectReleaseDate(modal);
    await selectRelease(modal);
    submitBuildModal(modal);
    checkWarnings(modal, true, true, false);
});

test('shows create build modal validation errors empty release date', async () => {
    const modal = renderCreateModal();
    openBuildModal(modal);
    fireEvent.change(modal.getByTestId('buildName'), {target: {value: 'v1.0'}});
    fireEvent.change(modal.getByTestId('buildUrl'), {target: {value: 'test.com'}});
    await selectRelease(modal);
    submitBuildModal(modal);
    checkWarnings(modal, true, false, true);
});

test('shows edit build modal validation errors empty url', async () => {
    const modal = renderEditModal();
    openBuildModal(modal);
    fireEvent.change(modal.getByTestId('buildUrl'), {target: {value: ''}});
    submitBuildModal(modal);
    checkWarnings(modal, true, true, false);
});

test('submit create build modal', async () => {
    const modal = renderCreateModal();
    const mockPostBuild = jest.spyOn(apiBuilds, 'postBuilds');
    openBuildModal(modal);
    fireEvent.change(modal.getByTestId('buildName'), {target: {value: 'v1.0'}});
    fireEvent.change(modal.getByTestId('buildUrl'), {target: {value: 'test.com'}});
    selectReleaseDate(modal);
    await selectRelease(modal);
    submitBuildModal(modal);
    expect(mockPostBuild).toBeCalledTimes(1);
    checkWarnings(modal, true, true, true);
});

test('submit edit release modal', async () => {
    const modal = renderEditModal();
    const mockPostRelease = jest.spyOn(apiBuilds, 'putBuild');
    openBuildModal(modal);
    fireEvent.change(modal.getByTestId('buildName'), {target: {value: 'v1.0.1'}});
    fireEvent.change(modal.getByTestId('buildUrl'), {target: {value: 'tests.com'}});
    selectReleaseDate(modal);
    await selectRelease(modal);
    submitBuildModal(modal);
    expect(mockPostRelease).toBeCalledTimes(1);
    checkWarnings(modal, true, true, true);
});
