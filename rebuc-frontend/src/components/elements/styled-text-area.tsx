import React, { Component } from 'react';
import { StyledElement } from './styled-element';
import TextArea from "@atlaskit/textarea";

interface IStyledTextAreaProps {
    onChange: any;
    value?: any;
    placeholder: string;
    description: string;
    incorrectMessage: string;
    isValid: boolean;
    width: number;
    isDisabled: boolean;
    dataCy?: string;
    pattern?: any;
    defaultValue?: any;
    withRightPadding: boolean;
}

export class StyledTextArea extends Component<IStyledTextAreaProps> {
    render() {
        return (
            <StyledElement
                targetElement={(<TextArea
                    onChange={this.props.onChange}
                    placeholder={this.props.placeholder}
                    value={this.props.value ? this.props.value : undefined}
                    isDisabled={this.props.isDisabled}
                    data-cy={this.props.dataCy}
                    isInvalid={!this.props.isValid}
                    defaultValue={this.props.defaultValue ? this.props.defaultValue : undefined}

                />)}
                description={this.props.description}
                incorrectMessage={this.props.incorrectMessage}
                isValid={this.props.isValid}
                width={this.props.width}
                withRightPadding={this.props.withRightPadding}
            />
        );
    }
}
