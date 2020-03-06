import React from 'react';
import { render, configure, wait} from '@testing-library/react';
import * as apiReleases from "../../api-helpers/api-releases";
import { ReleasesRouteBase } from "../releases";
import {AxiosResponse} from "axios";
import {HashRouter} from "react-router-dom";

configure({testIdAttribute: 'data-cy'});
jest.mock("../../api-helpers/api-releases");

const setup = () => {
    return {
        navController: {setView: (view: string) => {}},
    }
};


test('release page renders with releases', async () => {
    const { navController } = setup();
    const mockApi = jest.spyOn(apiReleases, 'getReleases');
    const testReleases: AxiosResponse = {
        status: 200,
        statusText: '',
        config: {},
        headers: {},
        data: [
            {id: 1, name: 'Release 1', release_date: '2020-01-01', description: 'test', builds: [],
                release_pattern: {start_build: {id: 1, name: '1.0'}, build_mask: '1.X'}}
    ]};
    mockApi.mockResolvedValueOnce(testReleases);
    const releases = render(
        <HashRouter>
            <ReleasesRouteBase navigationViewController={navController}/>
        </HashRouter>

    );
    expect(mockApi).toHaveBeenCalled();
    await wait(() => {
        expect(releases.getByText(testReleases.data[0].name)).toBeInTheDocument();
        expect(releases.getByText(testReleases.data[0].release_date)).toBeInTheDocument();
        expect(releases.getByText(testReleases.data[0].description)).toBeInTheDocument();
        expect(releases.getByText(testReleases.data[0].release_pattern.start_build.name)).toBeInTheDocument();
        expect(releases.getByText(testReleases.data[0].release_pattern.build_mask)).toBeInTheDocument();
    });
});
