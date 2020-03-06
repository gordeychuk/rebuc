import React from 'react';
import { render, fireEvent, configure } from '@testing-library/react';
import * as apiReleases from "../../../api-helpers/api-builds";
import {DeleteBuildModal} from "../delete-build-modal";
import {IBuild} from "../../../types/types";
import {AuthContext} from "../../../context/auth";

configure({testIdAttribute: 'data-cy'});
jest.mock("../../../api-helpers/api-builds");

afterEach(() => {jest.clearAllMocks()});

const setupDeleteBuildTest = () => {
    const testBuild: IBuild = {
            id: '1',
            name: 'Build 1',
            description: 'test',
            release_date: '2020-01-01',
            release_notes: 'test notes',
            url: 'test.com'
        };
    const modal = render(
        <AuthContext.Provider value={{user: 'user', setUser: () => {}}}>
            <DeleteBuildModal
                trigger={<button/>} callback={() => {}} instance={testBuild} addErrorFlag={() => {}}/>
        </AuthContext.Provider>
                );

    fireEvent.click(modal.getByTestId('openModal'));
    return modal;
};

test('delete build confirmed', () => {
    const modal = setupDeleteBuildTest();
    const releaseApiMock = jest.spyOn(apiReleases, 'deleteBuild');
    fireEvent.click(modal.getByTestId('confirmModal'));
    expect(releaseApiMock).toBeCalledTimes(1);
});


test('delete build canceled', () => {
    const modal = setupDeleteBuildTest();
    const releaseApiMock = jest.spyOn(apiReleases, 'deleteBuild');
    fireEvent.click(modal.getByTestId('cancelModal'));
    expect(releaseApiMock).toBeCalledTimes(0);
});
