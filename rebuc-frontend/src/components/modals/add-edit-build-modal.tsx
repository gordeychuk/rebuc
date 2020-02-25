import React, {useState} from 'react';
import Button from '@atlaskit/button';
import ModalDialog, { ModalFooter, ModalTransition } from '@atlaskit/modal-dialog';
import AddIcon from '@atlaskit/icon/glyph/add';
import {useAuth} from "../../context/auth";
import {StyledTextField} from "../elements/styled-text-field";
import {StyledElement} from "../elements/styled-element";
import { DatePicker } from '@atlaskit/datetime-picker';
import {IBuild, ISelectValue} from "../../types/types";
import {ReleasesSelect} from "../elements/releases-select";
import { Checkbox } from '@atlaskit/checkbox';
import {
    postBuilds,
    putBuild,
} from "../../api-helpers/api-builds";
import {StyledTextArea} from "../elements/styled-text-area";


interface IFooterProps {
    onClose: any;
    showKeyline: boolean;
}

interface IBuildModalProps {
    isEdit: boolean;
    callback: () => void;
    trigger?: any;
    instance?: IBuild;
    release: ISelectValue;
    addErrorFlag: (title: string, description: string) => void;
}

interface IValidation {
    name: boolean;
    url: boolean;
    releaseDate: boolean;
}

export const CreateUpdateBuildModal = (props: IBuildModalProps) => {
    const {user} = useAuth();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>(props.instance ? props.instance.name : '');
    const [isNameValid, setIsNameValid] = useState<boolean>(true);
    const [description, setDescription] = useState<string>(props.instance ? props.instance.description : '');
    const [releaseDate, setReleaseDate] = useState<string>(props.instance ? props.instance.release_date : '');
    const [isReleaseDateValid, setIsReleaseDateValid] = useState<boolean>(true);
    const [releaseNotes, setReleaseNotes] = useState<string>(props.instance ? props.instance.release_notes: '');
    const [url, setUrl] = useState<string>(props.instance ? props.instance.url: '');
    const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
    const [release, setRelease] = useState<ISelectValue>(props.release);
    const [isAutoDetect, setIsAutoDetect] = useState<boolean>(false);
    const dropdownReleaseRef: any = React.createRef();

    const open = () => {
        setIsOpen(true);
        if (props.instance) {
            setRelease(props.release);
            setName(props.instance.name);
            setReleaseDate(props.instance.release_date);
            setUrl(props.instance.url);
            setReleaseNotes(props.instance.release_notes);
            setDescription(props.instance.description);
        }
    };

    const close = () => {
        setIsOpen(false);
        resetState();
    };

    const sendReqestBuild = (isPut: boolean) => {
        if (name) {
            let dataToPost = {
                name: name,
                description: description,
                release_date: releaseDate,
                release_notes: releaseNotes,
                url: url,
                release_id: '0'
            };

            if (release) {
                dataToPost.release_id = release.value;
            }

            let targetMethod;
            if (props.instance && isPut) {
                const buildId = props.instance.id;
                targetMethod = () => putBuild(dataToPost, buildId);
            } else {
                targetMethod = () => postBuilds(dataToPost);
            }

            targetMethod()
                .then(resp => {
                    props.callback();
                })
                .catch(error => {
                    props.addErrorFlag('Build error', JSON.stringify(error.response.data))
                });
        }
    } ;

    const resetState = () => {
        setName('');
        setIsNameValid(true);
        setDescription('');
        setReleaseDate('');
        setReleaseNotes('');
        setUrl('');
        setIsUrlValid(true);
        setIsAutoDetect(false);
        setIsNameValid(true);
        setIsUrlValid(true);
        setIsReleaseDateValid(true);
    };

    const isFormValid = () => {
        let validation: IValidation = {
            name: isNameValid,
            url: isUrlValid,
            releaseDate: isReleaseDateValid,
        };

        if (name.length === 0) {
            setIsNameValid(false);
            validation.name = false;
        } else {
            setIsNameValid(true);
            validation.name = true;
        }

        if (url.length === 0) {
            setIsUrlValid(false);
            validation.url = false;
        } else {
            setIsUrlValid(true);
            validation.url = true;
        }

        if (!releaseDate) {
            setIsReleaseDateValid(false);
            validation.releaseDate = false;
        } else {
            setIsReleaseDateValid(true);
            validation.releaseDate = true;
        }

        return validation.name && validation.url && validation.releaseDate;
    };

    const handleCreate = () => {
        if (isFormValid()) {
            sendReqestBuild(false);
            resetState();
            close();
        }
    };

    const handleEdit = () => {
        if (isFormValid()) {
            sendReqestBuild(true);
            resetState();
            close();
        }
    };

    const handleName = (e: any) => {
        setName(e.target.value);
        setIsNameValid(true);
    };

    const handleDescription = (e: any) => {
        setDescription(e.target.value);
    };

    const handleReleaseNotes = (e: any) => {
        setReleaseNotes(e.target.value);
    };

    const handleUrl = (e: any) => {
        setUrl(e.target.value);
        setIsUrlValid(true);
    };

    const handleReleaseDate = (value: string) => {
        setReleaseDate(value);
        setIsReleaseDateValid(true);
    };

    const handleReleaseSelect = (value: ISelectValue) => {
        setRelease(value);
    };

    const handleKeyDown = (e: any, ref: any) => {
        let menuIsOpen = false;
        if (e.keyCode === 13) {
            if (ref) {
                if (ref.current) {
                    menuIsOpen = ref.current.getMenuIsOpen();
                }
            }
            if (menuIsOpen) {
                return;
            }
            if (props.isEdit) {
                handleEdit();
            } else {
                handleCreate();
            }
        }
    };

    const handleAutoDetect = () => {setIsAutoDetect(!isAutoDetect)};

    const keyDownForReleases = (e: any) => handleKeyDown(e, dropdownReleaseRef);

    const footer: React.ElementType = (footerProps: IFooterProps) => (
        <ModalFooter showKeyline={footerProps.showKeyline}>
            <span />
            <span style={{paddingRight: 3}}>
                <Button
                    appearance='primary'
                    data-cy='confirmBuildModal'
                    onClick={props.isEdit ? handleEdit : handleCreate}
                >
                    {props.isEdit ? 'Update' : 'Create'}
                </Button>
                <Button appearance='subtle' onClick={close}>
                    Cancel
                </Button>
            </span>
        </ModalFooter>
    );

    return (
        <div>
            {props.isEdit ? <span onClick={open}>
                {props.trigger}
            </span> :
                <Button
                    onClick={open}
                    appearance='primary'
                    iconBefore={<AddIcon label=''/>}
                    isDisabled={!user}
                >
                    Add build
                </Button>}
            <ModalTransition>
                {isOpen && (
                    <ModalDialog
                        onClose={close}
                        heading={props.isEdit ? 'Update build' : 'Create build'}
                        width='600px'
                        components={{
                            Footer: footer,
                        }}
                    >
                        <StyledTextField
                            onChange={handleName}
                            placeholder={'Enter name'}
                            description={'Build name'}
                            incorrectMessage={'Build name cannot be empty.'}
                            isValid={isNameValid}
                            width={362}
                            onKeyDown={handleKeyDown}
                            isDisabled={false}
                            defaultValue={props.instance ? props.instance.name : undefined}
                            withRightPadding={true}
                        />
                        <StyledElement
                            targetElement={
                                <DatePicker
                                    onChange={handleReleaseDate}
                                    placeholder={"Pick a date"}
                                    defaultValue={props.instance ? props.instance.release_date : undefined}
                                    isInvalid={!isReleaseDateValid}
                                />
                            }
                            description={'Release date'}
                            incorrectMessage={'Release date cannot be empty.'}
                            isValid={true}
                            width={162}
                            withRightPadding={false}
                        />
                        <StyledTextArea
                            onChange={handleDescription}
                            placeholder={'Enter description'}
                            description={'Description'}
                            incorrectMessage={''}
                            isValid={true}
                            width={546}
                            isDisabled={false}
                            defaultValue={props.instance ? props.instance.description : undefined}
                            withRightPadding={false}
                        />
                        <StyledTextField
                            onChange={handleReleaseNotes}
                            placeholder={'Enter notes'}
                            description={'Release notes'}
                            incorrectMessage={''}
                            isValid={true}
                            width={546}
                            isDisabled={false}
                            onKeyDown={handleKeyDown}
                            defaultValue={props.instance ? props.instance.release_notes : undefined}
                            withRightPadding={false}
                        />
                        <StyledElement
                            targetElement={
                                <ReleasesSelect
                                    onChange={handleReleaseSelect}
                                    value={release}
                                    ref={dropdownReleaseRef}
                                    onKeyDown={keyDownForReleases}
                                    isDisabled={isAutoDetect}
                                    defaultValue={props.release}
                                />}
                            description={"Release"}
                            incorrectMessage={""}
                            isValid={true}
                            width={162}
                            withRightPadding={true}
                        />
                        <StyledTextField
                            onChange={handleUrl}
                            placeholder={'Enter URL'}
                            description={'URL'}
                            incorrectMessage={'URL cannot be empty'}
                            isValid={isUrlValid}
                            width={362}
                            isDisabled={false}
                            onKeyDown={handleKeyDown}
                            defaultValue={props.instance ? props.instance.url : undefined}
                            withRightPadding={false}
                        />
                        <Checkbox
                            isChecked={isAutoDetect}
                            label="Detect release automatically"
                            onChange={handleAutoDetect}
                            name="checkbox-auto-detect"
                        />
                    </ModalDialog>
                )}
            </ModalTransition>
        </div>
    )
};
