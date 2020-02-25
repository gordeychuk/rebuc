import React from "react";
import {ConfirmationModal} from "./confimation-modal";
import {deleteRelease} from "../../api-helpers/api-releases";
import {IRelease} from "../../types/types";

interface IDeleteReleaseProps {
    trigger: JSX.Element;
    callback: () => void;
    instance: IRelease;
    addErrorFlag: (title: string, description: string) => void;
}

export const DeleteReleaseModal = (props: IDeleteReleaseProps) => {
    const sendDeleteRelease = () => {
        deleteRelease(props.instance.id)
            .then((resp) => console.log('success'))
            .catch((error) => {props.addErrorFlag(
                "Release not deleted.", JSON.stringify(error.response.data))})
    };

    return (
        <ConfirmationModal
            callback={sendDeleteRelease}
            heading={"Delete instance"}
            trigger={props.trigger}
            description={"Are you sure you want to delete instance " + props.instance.name}
            refresher={props.callback}
        />
    )
};
