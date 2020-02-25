import {ReactElement} from "react";

interface IReleasePattern {
    start_build: {name: string, id: string};
    build_mask: string;
}
export interface IRelease {
    id: string;
    name: string;
    description: string;
    release_date: string;
    builds: string[];
    release_pattern: IReleasePattern;
}

export interface IBuild {
    id: string;
    name: string;
    description: string;
    url: string;
    release_notes: string;
    release_date: string;
}

export interface BuildOrRelease extends IRelease, IBuild {

}

interface ITableCell {
    key: string;
    content: ReactElement | string;
}
export interface ITableRow {
    key: string;
    cells: ITableCell[];
}

export interface ISelectValue {
    value: string;
    label: string;
}

export interface IFlagProps {
    description: string;
    title: string;
    id: string;
    key: string;
}

export interface IUser {
    isAdmin: string;
    firstName: string;
    lastName: string;
    token: string;
}
