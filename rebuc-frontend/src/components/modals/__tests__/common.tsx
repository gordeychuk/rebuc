import React from "react";
import {fireEvent, waitForElement} from "@testing-library/react";

export const DOWN_ARROW = { keyCode: 40 };

export const selectBuild = async (modal: any) => {
    const buildSelect = modal.getByTestId('releaseStartBuild').querySelector('#buildSelect');
    if (buildSelect) {
        fireEvent.keyDown(buildSelect, DOWN_ARROW);
    }

    const option = await waitForElement(() => modal.getByText('1.0.0'));
    fireEvent.click(option);
};
