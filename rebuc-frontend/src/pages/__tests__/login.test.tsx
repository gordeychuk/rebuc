import React from 'react';
import { render, fireEvent, configure, cleanup } from '@testing-library/react';
import { LoginBase } from "../login";
import * as apiAuth from "../../api-helpers/api-auth";
import {act} from "react-dom/test-utils";

configure({testIdAttribute: 'data-cy'});
jest.mock("../../api-helpers/api-auth");

const setup = () => {
    return {
        fakeHistory: {push: (path: string) => {} },
        navControllers: {setView: (view: string) => {}},
    }
};

afterEach(() => {jest.clearAllMocks()});

test('login page renders', () => {
    const {fakeHistory, navControllers } = setup();
    const { getByRole } = render(<LoginBase  history={fakeHistory} navigationViewController={navControllers}/>);
    const loginButton = getByRole('button');
    expect(loginButton).toHaveTextContent('Login');
});

test('login invalid fields', async () => {
    const mockPostLogin = jest.spyOn(apiAuth, 'postLogin');
    const {fakeHistory, navControllers } = setup();
    const { getByRole } = render(<LoginBase history={fakeHistory} navigationViewController={navControllers}/>);
    await act(async () => {
        fireEvent.click(getByRole('button'));
    });
    expect(mockPostLogin).toBeCalledTimes(1);
});

test('login submit', async () => {
    const mockPostLogin = jest.spyOn(apiAuth, 'postLogin');
    const {fakeHistory, navControllers } = setup();
    const { getByRole, getByTestId } = render(<LoginBase history={fakeHistory} navigationViewController={navControllers}/>);
    const testLogin = 'testLogin';
    const testPassword = 'testPassword';
    fireEvent.change(getByTestId('loginInput'), {target: {value: testLogin}});
    fireEvent.change(getByTestId('passwordInput'), {target: {value: testPassword}});
    await act(async () => {
        fireEvent.click(getByRole('button'));
    });
    expect(mockPostLogin).toBeCalledTimes(1);
    expect(mockPostLogin).toBeCalledWith(testLogin, testPassword);
});
