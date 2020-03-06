import React from 'react';
import { render, fireEvent, configure } from '@testing-library/react';
import * as apiReleases from "../../../api-helpers/api-releases";
import {DeleteReleaseModal} from "../delete-release-modal";
import {IRelease} from "../../../types/types";
import {AuthContext} from "../../../context/auth";

configure({testIdAttribute: 'data-cy'});
jest.mock("../../../api-helpers/api-releases");

afterEach(() => {jest.clearAllMocks()});

const setupDeleteReleaseTest = () => {
    const testRelease: IRelease = {
            id: '1',
            name: 'Release 1',
            builds: [],
            description: 'test',
            release_date: '2020-01-01',
            release_pattern: {
                start_build: {id: '1', name: '1.0'},
                build_mask: '1.x'
            }
        };
    const modal = render(
        <AuthContext.Provider value={{user: 'user', setUser: () => {}}}>
            <DeleteReleaseModal
                trigger={<button/>} callback={() => {}} instance={testRelease} addErrorFlag={() => {}}/>
        </AuthContext.Provider>
                );

    fireEvent.click(modal.getByTestId('openModal'));
    return modal;
};

test('delete release confirmed', () => {
    const modal = setupDeleteReleaseTest();
    const releaseApiMock = jest.spyOn(apiReleases, 'deleteRelease');
    fireEvent.click(modal.getByTestId('confirmModal'));
    expect(releaseApiMock).toBeCalledTimes(1);
});


test('delete release canceled', () => {
    const modal = setupDeleteReleaseTest();
    const releaseApiMock = jest.spyOn(apiReleases, 'deleteRelease');
    fireEvent.click(modal.getByTestId('cancelModal'));
    expect(releaseApiMock).toBeCalledTimes(0);
});
