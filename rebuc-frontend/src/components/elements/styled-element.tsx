import React, { Component } from 'react';
import { errorStyle, headerStyle } from '../../style/styles';

interface IStyledTextFieldProps {
    targetElement: any;
    description: string;
    incorrectMessage: string;
    isValid: boolean;
    width: number;
    divId?: string;
    divDataCy?: string;
    withRightPadding: boolean;
}

export class StyledElement extends Component<IStyledTextFieldProps> {
    render() {
        const widthValue = this.props.width;
        const { withRightPadding } = this.props;
        const divStyle = {
            display: 'inline-block',
            paddingBottom: 15,
            paddingLeft: 2,
            paddingRight: withRightPadding ? 20 : 0,
            width: widthValue,
            verticalAlign: "top"
        };

        return (
            <div style={divStyle} id={this.props.divId} data-cy={this.props.divDataCy}>
                <p style={headerStyle}>
                    {this.props.description}
                </p>
                {this.props.targetElement}

                {!this.props.isValid &&
                <p style={errorStyle}>
                    {this.props.incorrectMessage}
                </p>}
            </div>
        );
    }
}
