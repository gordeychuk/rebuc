import React, { Component } from 'react';
import { AsyncSelect } from '@atlaskit/select';
import axios, { AxiosResponse } from 'axios';
import {IBuild} from "../../types/types";
import {getBuilds} from "../../api-helpers/api-builds";

interface ISelectState {
    options: any;
    value: string;
}

interface IBuildsSelectProps {
    onChange: any;
    value: any;
    defaultValue: any;
    ref?: any;
    onKeyDown?: any;
    styles?: any;
    isDisabled?: boolean;
}

export class BuildsSelect extends Component<IBuildsSelectProps, ISelectState> {
    isMountedCustom = false;
    selectRef = React.createRef();
    signal = axios.CancelToken.source();

    state: ISelectState = {
        options: [],
        value: '',
    };

    componentDidMount() {
        this.isMountedCustom = true;
        this.getList();
    }

    componentWillUnmount(): void {
        this.signal.cancel('API is being canceled');
    }

    filterBuildsList = (data: any) => {
        const releasesElements = [];
        if (data) {
            data.sort((a: any, b: any) =>
                (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
            for (const dataItem of data) {
                releasesElements.push(
                    { label: dataItem.name, value: dataItem.id },
                );
            }
        }
        if (this.isMountedCustom)  {
            this.setState({options: releasesElements});
        }
        return releasesElements;
    };

    filterBuild = (value: any) =>
        this.state.options.filter((i: any) => i.label.toLowerCase().includes(value.toLowerCase()));

    promiseOptions = (value: any) =>
      new Promise((resolve) => {
          resolve(this.filterBuild(value));
      });

    getList = () => {
        getBuilds()
            .then((resp: AxiosResponse<IBuild[]>) => this.filterBuildsList(resp.data))
            .catch((error) => {
                if (axios.isCancel(error)) {
                    return;
                } else {
                    throw error;
                }
            });
    };

    getMenuIsOpen = () => {
        // @ts-ignore
        return this.selectRef.select.select.state.menuIsOpen;
    };

    render() {
        const { options } = this.state;
        return (
            <AsyncSelect
                {...this.props}
                menuPortalTarget={document.body}
                cacheOptions={true}
                styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), ...this.props.styles}}
                defaultOptions={options}
                loadOptions={this.promiseOptions}
                options={options}
                ref={(ref: any) => {this.selectRef = ref; }}
                placeholder='Select a build'
                isDisabled={this.props.isDisabled}
                inputId={'buildSelect'}
            />
            );
    }
}
