import * as React from "react";
import {ReactElement} from "react";
import {SideBarDef} from "ag-grid-community";
import * as PropTypes from "prop-types";
import {AgGridColumn} from "./agGridColumn";

export type SideBarOptions = true | 'columns' | 'filters' | SideBarDef;

export interface AgSideBarProps {
    sideBar?: SideBarOptions;
}

export class AgSideBar extends React.Component<AgSideBarProps, {}> {
    static _type = 'AgSideBar';

    constructor(public props: any, public state: any) {
        super(props, state);
    }

    public static getSideBarConfiguration(sideBar: any) {
        let toolPanels = null;
        if (React.Children.count(sideBar.props.children) > 0) {
            toolPanels = React.Children.map(sideBar.props.children, (toolPanel: ReactElement<AgToolPanel>) => {
                return AgToolPanel.toToolPanel(toolPanel.props);
            });
        }

        let x = {
            "position": "left",
            "defaultToolPanel": "filters",
            "toolPanels": [
                {
                    "id": "columns",
                    "labelDefault": "App Columns"
                },
                {
                    "id": "filters",
                    "labelDefault": "App Filters"
                }
            ]
        };
        let result = {};
        AgGridColumn.assign(result, sideBar.props);
        delete (<any>result).children;
        if (toolPanels) {
            (result as any)['toolPanels'] = toolPanels;
        }

        if (Object.keys(result).length === 0) {
            result = true;
        }

        return result;
    }

    static isSideBar(child: any) {
        return child && child.type && child.type._type && child.type._type === AgSideBar._type;
    }

    render() {
        return null;
    }
}

(AgSideBar as any)['sideBar'] = PropTypes.object;

export interface AgToolPanelProps {
}

export class AgToolPanel extends React.Component<AgToolPanelProps, {}> {
    static _type = 'AgToolPanel';

    constructor(public props: any, public state: any) {
        super(props, state);
    }

    render() {
        return null;
    }

    public static toToolPanel(props: any) {
        let toolPanel = {};
        AgGridColumn.assign(toolPanel, props);
        delete (<any>toolPanel).children;
        return toolPanel;
    }
}
