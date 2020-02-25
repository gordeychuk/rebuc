import React, { Component } from 'react';
import { AsyncSelect } from '@atlaskit/select';
import axios, { AxiosResponse } from 'axios';
import {IBuild} from "../../types/types";
import {getReleases} from "../../api-helpers/api-releases";

interface ISelectState {
    options: any;
    value: string;
}

interface IReleasesSelectProps {
    onChange: any;
    value: any;
    defaultValue: any;
    ref?: any;
    onKeyDown?: any;
    styles?: any;
    isDisabled?: boolean;
}

export class ReleasesSelect extends Component<IReleasesSelectProps, ISelectState> {
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

    filterReleasesList = (data: any) => {
        const releaseElements = [{label: "Without release", value: '0'}];
        if (data) {
            data.sort((a: any, b: any) =>
                (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
            for (const dataItem of data) {
                releaseElements.push(
                    { label: dataItem.name, value: dataItem.id },
                );
            }
        }
        if (this.isMountedCustom)  {
            this.setState({options: releaseElements});
        }
        return releaseElements;
    };

    filterRelease = (value: any) =>
        this.state.options.filter((i: any) => i.label.toLowerCase().includes(value.toLowerCase()));

    promiseOptions = (value: any) =>
      new Promise((resolve) => {
          resolve(this.filterRelease(value));
      });

    getList = () => {
        getReleases()
            .then((resp: AxiosResponse<IBuild[]>) => this.filterReleasesList(resp.data))
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
                placeholder='Select release'
                isDisabled={this.props.isDisabled}
            />
            );
    }
}
