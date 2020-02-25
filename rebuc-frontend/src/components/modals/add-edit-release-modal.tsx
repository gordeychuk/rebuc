import React, {useState} from 'react';
import Button from '@atlaskit/button';
import ModalDialog, { ModalFooter, ModalTransition } from '@atlaskit/modal-dialog';
import AddIcon from '@atlaskit/icon/glyph/add';
import {useAuth} from "../../context/auth";
import {StyledTextField} from "../elements/styled-text-field";
import {StyledElement} from "../elements/styled-element";
import { DatePicker } from '@atlaskit/datetime-picker';
import {IRelease, ISelectValue} from "../../types/types";
import {BuildsSelect} from "../elements/builds-select";
import {postRelease, putRelease} from "../../api-helpers/api-releases";
import {StyledTextArea} from "../elements/styled-text-area";


interface IFooterProps {
    onClose: any;
    showKeyline: boolean;
}

interface IReleaseModalProps {
    isEdit: boolean;
    callback: () => void;
    trigger?: any;
    instance?: IRelease;
    addErrorFlag: (title: string, description: string) => void;
}

interface IValidation {
    name: boolean;
    buildMask: boolean;
    startBuild: boolean;
}

export const CreateUpdateReleaseModal = (props: IReleaseModalProps) => {
    const {user} = useAuth();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [isNameValid, setIsNameValid] = useState<boolean>(true);
    const [description, setDescription] = useState<string>('');
    const [releaseDate, setReleaseDate] = useState<string>( '');
    const [startBuild, setStartBuild] = useState<ISelectValue | undefined>();
    const [isStartBuildValid, setIsStartBuildValid] = useState<boolean>(true);
    const [startBuildError, setStartBuildError] = useState<string>('');
    const [buildMask, setBuildMask] = useState<string>( '');
    const [buildMaskError, setBuildMaskError] = useState<string>('');
    const [isBuildMaskValid, setIsBuildMaskValid] = useState<boolean>(true);
    const dropdownBuildsRef: any = React.createRef();

    const open = () => {
        if (props.instance) {
            setName(props.instance.name);
            setDescription(props.instance.description);
            setReleaseDate(props.instance.release_date);
            setStartBuild({
                label: props.instance.release_pattern.start_build.name,
                value: props.instance.release_pattern.start_build.id
            });
            setBuildMask(props.instance.release_pattern.build_mask);
        }
        setIsOpen(true);
    };
    const close = () => {
        setIsOpen(false);
        resetState();
    };


    const validateBuildMask = () => {
        if (buildMask) {
            const buildMaskLowered = buildMask.toLowerCase();
            if (!buildMaskLowered.includes('x')) {
                setBuildMaskError('Please specify variable octet as \'x\'.');
                return false;
            } else {
                if ((buildMaskLowered.match(/x/g) || []).length > 1) {

                    setBuildMaskError('Too many \'x\' octets.');
                    return false;
                } else {
                    const maskSplitted = buildMaskLowered.split('.');
                    for (let letter of maskSplitted) {
                        if (letter !== 'x') {
                            if (!(/[0-9]+/.test(letter))) {
                                setBuildMaskError('Mixed \'x\' and numbers.');
                                return false;
                            }
                            if ((letter.match(/x/g) || []).length > 0) {
                                setBuildMaskError('Please specify variable octet as \'x\'.');
                                return false;
                            }
                        }
                    }
                    return true;
                }
            }
        }
        setBuildMaskError('Build mask cannot be empty.');
        return false;
    };

    const validateStartBuild = () => {
        if (startBuild) {
            if (buildMask) {
                const maskSplitted = buildMask.split('.');
                const buildSplitted = startBuild.label.split('.');
                if (maskSplitted.length !== buildSplitted.length) {
                    setStartBuildError('Start instance doesn\'t fit instance mask');
                    return false;
                }

                for (let i = 0; i < maskSplitted.length; i++) {
                    if (maskSplitted[i].toLowerCase() !== 'x') {
                        if (maskSplitted[i] !== buildSplitted[i]) {
                            setStartBuildError('Start instance doesn\'t fit instance mask');
                            return false;
                        }
                    }
                }
                return true;
            } else {
                return true;
            }
        }
        setStartBuildError('Start instance cannot be empty');
        return false;
    };

    const parseBuildMask = () => {
        const maskSplitted = buildMask.split('.');
        let fixedValues = [];
        let variableOctet = 0;
        for (let i = 0; i < maskSplitted.length; i++) {
            if (maskSplitted[i].toLowerCase() !== 'x') {
                fixedValues.push(Number(maskSplitted[i]))
            } else {
                variableOctet = i;
            }
        }
        return {
            variable_octet: variableOctet,
            octets: maskSplitted.length,
            fixed_values: fixedValues,
        }
    };

    const sendReqestRelease = (isPut: boolean) => {
        if (name && startBuild) {
            const dataToPost = {
                name: name,
                description: description,
                release_date: releaseDate,
                release_pattern: {
                    start_build: {id: startBuild.value},
                    build_mask: parseBuildMask()
                }
            };
            if (!isPut) {
                postRelease(dataToPost)
                    .then((resp: any) => {
                        props.callback();
                    })
                    .catch((error: any) => {
                        props.addErrorFlag('Release error', JSON.stringify(error.response.data))
                    });
            } else {
                if (props.instance) {
                    putRelease(props.instance.id, dataToPost)
                        .then((resp: any) => {
                            props.callback();
                        })
                        .catch((error: any) => {
                            props.addErrorFlag('Release error', JSON.stringify(error.response.data))
                        });
                }
            }
        }
    } ;

    const resetState = () => {
        setName('');
        setIsNameValid(true);
        setBuildMask('');
        setIsBuildMaskValid(true);
        setStartBuild(undefined);
        setIsStartBuildValid(true);
    };

    const isFormValid = () => {
        let validation: IValidation = {
            name: isNameValid,
            buildMask: isBuildMaskValid,
            startBuild: isStartBuildValid,
        };

        if (name.length === 0) {
            setIsNameValid(false);
            validation.name = false;
        } else {
            setIsNameValid(true);
            validation.name = true;
        }

        if (!validateBuildMask()) {
            setIsBuildMaskValid(false);
            validation.buildMask = false;
        } else {
            setIsBuildMaskValid(true);
            validation.buildMask = true;
        }

        if (!validateStartBuild()) {
            setIsStartBuildValid(false);
            validation.startBuild = false
        } else {
            setIsStartBuildValid(true);
            validation.startBuild = true
        }

        return validation.name && validation.buildMask && validation.startBuild;
    };

    const handleCreate = () => {
        if (isFormValid()) {
            sendReqestRelease(false);
            resetState();
            close();
        }
    };

    const handleEdit = () => {
        if (isFormValid()) {
            sendReqestRelease(true);
            resetState();
            close();
        }
    };

    const handleName = (e: any) => {
        setName(e.target.value);
        setIsNameValid(true);
    };

    const handleDescription = (e: any) => {
        setDescription( e.target.value);
    };

    const handleReleaseDate = (value: string) => {
        setReleaseDate(value)
    };

    const handleStartBuild = (e: any) => {
        setStartBuild(e);
        setIsStartBuildValid(true);
    };

    const handleBuildMask = (e: any) => {
        if (!e.target.value) {
            setIsBuildMaskValid(false);
        } else {
            setBuildMask(e.target.value);
            setIsBuildMaskValid(true);
        }
    };

    const onKeyDownBuildMask = (e: any) => {
        if (e.keyCode === 13) {
            handleKeyDown(e, undefined);
        }
        if (![8, 9, 13, 16, 37, 38, 39, 49, 91].includes(e.keyCode)) {
            if (!'0123456789.xX'.includes(e.key)) {
                e.preventDefault();
            }
        }
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

    const keyDownForBuilds = (e: any) => handleKeyDown(e, dropdownBuildsRef);

    const footer: React.ElementType = (footerProps: IFooterProps) => (
        <ModalFooter showKeyline={footerProps.showKeyline}>
            <span />
            <span style={{paddingRight: 3}}>
                <Button
                    appearance='primary'
                    data-cy='confirmReleaseModal'
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
        <span>
            {props.isEdit ? <span onClick={open}>
                {props.trigger}
            </span> :
                <Button
                    onClick={open}
                    appearance='primary'
                    iconBefore={<AddIcon label=''/>}
                    isDisabled={!user}
                >
                    Add release
                </Button>}
            <ModalTransition>
                {isOpen && (
                    <ModalDialog
                        onClose={close}
                        heading={props.isEdit ? 'Update release' : 'Create release'}
                        width='500px'
                        components={{
                            Footer: footer,
                        }}
                    >
                        <StyledTextField
                            onChange={handleName}
                            placeholder={'Enter name'}
                            description={'Release name'}
                            incorrectMessage={'Release name cannot be empty.'}
                            isValid={isNameValid}
                            width={212}
                            onKeyDown={handleKeyDown}
                            isDisabled={false}
                            defaultValue={props.instance ? props.instance.name : undefined}
                            withRightPadding={true}
                        />
                        <StyledElement
                            targetElement={
                                <DatePicker
                                    onChange={handleReleaseDate}
                                    placeholder={"Pick release date"}
                                    defaultValue={props.instance ? props.instance.release_date : undefined}
                                />
                            }
                            description={'Release date'}
                            incorrectMessage={''}
                            isValid={true}

                            width={212}
                            withRightPadding={false}
                        />
                        <StyledTextArea
                            onChange={handleDescription}
                            placeholder={'Enter description'}
                            description={'Description'}
                            incorrectMessage={''}
                            isValid={true}
                            width={446}
                            isDisabled={false}
                            defaultValue={props.instance ? props.instance.description : undefined}
                            withRightPadding={false}
                        />
                        <StyledTextField
                            onChange={handleBuildMask}
                            placeholder={'Enter build mask'}
                            description={'Build mask'}
                            incorrectMessage={buildMaskError}
                            isValid={isBuildMaskValid}
                            width={212}
                            isDisabled={false}
                            onKeyDown={onKeyDownBuildMask}
                            defaultValue={props.instance ? props.instance.release_pattern.build_mask : undefined}
                            withRightPadding={true}
                        />
                        <StyledElement
                            targetElement={
                                <BuildsSelect
                                    onChange={handleStartBuild}
                                    value={startBuild}
                                    ref={dropdownBuildsRef}
                                    onKeyDown={keyDownForBuilds}
                                    defaultValue={props.instance ? {
                                        label: props.instance.release_pattern.start_build.name,
                                        value: props.instance.release_pattern.start_build.id
                                    } : undefined}
                                />}
                            description={"Start build"}
                            incorrectMessage={startBuildError}
                            isValid={isStartBuildValid}
                            width={212}
                            withRightPadding={false}
                        />
                    </ModalDialog>
                )}
            </ModalTransition>
        </span>
    )
};
