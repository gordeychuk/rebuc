import React from 'react';
import { render, fireEvent, configure, wait} from '@testing-library/react';
import { ApiRouteBase } from "../restapi";

configure({testIdAttribute: 'data-cy'});

const setup = () => {
    return {
        navController: {setView: (view: string) => {}},
    }
};


test('rest api page renders without api', async () => {
    const { navController } = setup();
    const restapi = render(<ApiRouteBase navigationViewController={navController} />);
    await wait(() => {
        expect(restapi.getByText('Failed to load API definition.')).toBeInTheDocument(); // best test ever :/
    })
});
