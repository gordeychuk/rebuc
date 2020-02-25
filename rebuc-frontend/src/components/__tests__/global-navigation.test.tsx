import React from 'react';
import { render } from '@testing-library/react';
import { MainGlobalNavigation } from "../global-navigation";

const checkMainMenu = (text: string) => {
  const { findAllByText } = render(<MainGlobalNavigation />);
  findAllByText(text)
      .then(resp => {
        expect(resp.length).toBeTruthy();
      });
};

test('renders releases main menu', () => {
  checkMainMenu('Releases')
});

test('renders builds main menu', () => {
  checkMainMenu('Builds')
});

test('renders rest api main menu', () => {
  checkMainMenu('REST API')
});
