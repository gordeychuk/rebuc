import React, { Component } from 'react';
import Textfield from '@atlaskit/textfield';
import { StyledElement } from './styled-element';

interface IStyledTextFieldProps {
    onChange: any;
    value?: any;
    placeholder: string;
    description: string;
    incorrectMessage: string;
    isValid: boolean;
    type?: string;
    width: number;
    isDisabled: boolean;
    onKeyDown?: any;
    dataCy?: string;
    autoFocus?: boolean;
    pattern?: any;
    defaultValue?: any;
    withRightPadding: boolean;
}

export class StyledTextField extends Component<IStyledTextFieldProps> {
    render() {
        return (
            <StyledElement
                targetElement={(<Textfield
                    onChange={this.props.onChange}
                    placeholder={this.props.placeholder}
                    value={this.props.value ? this.props.value : undefined}
                    type={this.props.type}
                    isDisabled={this.props.isDisabled}
                    onKeyDown={this.props.onKeyDown}
                    data-cy={this.props.dataCy}
                    isInvalid={!this.props.isValid}
                    autoFocus={this.props.autoFocus}
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
