import Flag from '@atlaskit/flag';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { colors } from '@atlaskit/theme';
import React, { Component } from 'react';
import { IFlagProps } from '../../types/types';

export class ErrorFlag extends Component<IFlagProps> {
    render() {
        return (
            <div style={{textOverflow: "ellipsis"}}>

                <Flag
                    icon={<ErrorIcon label='success' size='medium' primaryColor={colors.R400}/>}
                    id={this.props.id}
                    title={this.props.title}
                    // style={{}}
                    description={this.props.description}
                    appearance='normal'
                />
            {/*// </div>*/}
            </div>
        );
    }
}
