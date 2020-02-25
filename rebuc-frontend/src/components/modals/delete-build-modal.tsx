import React from "react";
import {ConfirmationModal} from "./confimation-modal";
import {IBuild} from "../../types/types";
import {deleteBuild} from "../../api-helpers/api-builds";

interface IDeleteBuildProps {
    trigger: JSX.Element;
    callback: () => void;
    instance: IBuild;
    addErrorFlag: (title: string, description: string) => void;
}

export const DeleteBuildModal = (props: IDeleteBuildProps) => {
    const sendDeleteBuild = () => {
        deleteBuild(props.instance.id)
            .then((resp) => console.log('success'))
            .catch((error) => {
                let errorMessage = error.response.data;
                if (errorMessage.includes('Cannot delete some instances of model \'Build\' because they are referenced' +
                    ' through a protected foreign key')) {
                    errorMessage = 'Build cannot be removed because it serves as start build for some release.'
                }
                props.addErrorFlag(
                "Build delete error", JSON.stringify(errorMessage))

            })
    };

    return (
        <ConfirmationModal
            callback={sendDeleteBuild}
            heading={"Delete instance"}
            trigger={props.trigger}
            description={"Are you sure you want to delete bild " + props.instance.name}
            refresher={props.callback}
        />
    )
};
