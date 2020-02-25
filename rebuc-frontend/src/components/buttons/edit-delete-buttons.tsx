import React from "react";
import EditIcon from '@atlaskit/icon/glyph/edit';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import styled from "styled-components";
import {useAuth} from "../../context/auth";
import { colors } from '@atlaskit/theme';
import {CreateUpdateReleaseModal} from "../modals/add-edit-release-modal";
import {BuildOrRelease, ISelectValue} from "../../types/types";
import {DeleteReleaseModal} from "../modals/delete-release-modal";
import {CreateUpdateBuildModal} from "../modals/add-edit-build-modal";
import {DeleteBuildModal} from "../modals/delete-build-modal";

interface IEditDeleteButtonsProps {
    editModal: typeof CreateUpdateReleaseModal | typeof CreateUpdateBuildModal;
    instance: BuildOrRelease;
    callback: () => void;
    deleteModal: typeof DeleteReleaseModal | typeof DeleteBuildModal;
    release?: ISelectValue;
    addErrorFlag: (title: string, description: string) => void;
}

const IconHoverOpacity = styled.div`
    text-align: right;
    vertical-align: top;
    opacity: 0.5;
    padding: 1.5px;
    filter: alpha(opacity=40);
    display: inline-block;
    
    &:hover {
        opacity: 1.0;
        filter: alpha(opacity=100);
    }
`;

export const EditDeleteButtons = (props: IEditDeleteButtonsProps) => {
    const { user } = useAuth();

    return (
        <div>
            {user ?
                <div>
                    <IconHoverOpacity>
                        {props.editModal({
                            trigger: (<EditIcon primaryColor={colors.N500} label=''/>),
                            callback: props.callback,
                            isEdit: true,
                            instance: props.instance,
                            release: props.release ? props.release : {label: "Without release", value: "0"},
                            addErrorFlag: props.addErrorFlag
                        })}
                    </IconHoverOpacity>
                    <IconHoverOpacity>
                        {props.deleteModal({
                            trigger: (<CrossIcon primaryColor={colors.N500} label=''/>),
                            callback: props.callback,
                            instance: props.instance,
                            addErrorFlag: props.addErrorFlag
                        })}

                    </IconHoverOpacity>
                </div> : <div style={{padding: 15}}/>}
        </div>
    )
};
