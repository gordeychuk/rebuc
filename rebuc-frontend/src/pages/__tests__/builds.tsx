import React from 'react';
import { render, configure, wait} from '@testing-library/react';
import * as apiBuilds from "../../api-helpers/api-builds";
import { BuildsRouteBase } from "../builds";
import {AxiosResponse} from "axios";
import {HashRouter} from "react-router-dom";

configure({testIdAttribute: 'data-cy'});
jest.mock("../../api-helpers/api-releases");

const setup = () => {
    return {
        navController: {setView: (view: string) => {}},
    }
};

test('builds page renders with builds', async () => {
    const { navController } = setup();
    const mockApi = jest.spyOn(apiBuilds, 'getBuildsWithoutRelease');
    const testBuilds: AxiosResponse = {
        status: 200,
        statusText: '',
        config: {},
        headers: {},
        data: [
            {
                id: 1, name: 'Build 1', release_date: '2020-01-01', description: 'test', url: 'testUrl',
                release_notes: 'release notes'
            }
    ]};
    mockApi.mockResolvedValueOnce(testBuilds);
    const releases = render(
        <HashRouter>
            <BuildsRouteBase navigationViewController={navController} location={{}}/>
        </HashRouter>

    );
    expect(mockApi).toHaveBeenCalled();
    await wait(() => {
        expect(releases.getByText(testBuilds.data[0].name)).toBeInTheDocument();
        expect(releases.getByText(testBuilds.data[0].release_date)).toBeInTheDocument();
        expect(releases.getByText(testBuilds.data[0].description)).toBeInTheDocument();
        expect(releases.getByText(testBuilds.data[0].release_notes)).toBeInTheDocument();
        expect(releases.getByText(testBuilds.data[0].url)).toBeInTheDocument();
    });
});
