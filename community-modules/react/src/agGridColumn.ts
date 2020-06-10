import * as React from "react";
import {Component, ReactElement} from "react";
import * as PropTypes from "prop-types";
import * as AgGrid from "@ag-grid-community/core";
import {ColDef, ColGroupDef} from "@ag-grid-community/core";

export interface AgGridColumnProps extends ColDef {
}

export interface AgGridColumnGroupProps extends ColGroupDef {
}

export class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {
    static _type = 'AgGridColumn';

    constructor(public props: any, public state: any) {
        super(props, state);
    }

    render() {
        return null;
    }

    public static mapChildColumnDefs(columnProps: any) {
        return React.Children.map(columnProps.children, (child: ReactElement<any>) => {
            return AgGridColumn.toColDef(child.props);
        })
    }

    public static toColDef(columnProps: any): ColDef {
        let colDef: ColDef = AgGridColumn.createColDefFromGridColumn(columnProps);
        if (AgGridColumn.hasChildColumns(columnProps)) {
            (<any>colDef)["children"] = AgGridColumn.getChildColDefs(columnProps.children);
        }
        return colDef;
    }

    public static hasChildColumns(gridOrColumnProps: any): boolean {
        return React.Children.count(gridOrColumnProps.children) > 0;
    }

    private static getChildColDefs(columnChildren: any) {
        return React.Children.map(columnChildren, (child: ReactElement<any>) => {
            return AgGridColumn.createColDefFromGridColumn(child.props)
        });
    };

    private static createColDefFromGridColumn(columnProps: any): ColDef {
        let colDef = {};
        AgGridColumn.assign(colDef, columnProps);
        delete (<any>colDef).children;
        return colDef;
    };

    public static assign(colDef: any, from: AgGridColumn): ColDef {
        // effectively Object.assign - here for IE compatibility
        return [from].reduce(function (r, o) {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, colDef);
    }


    public static isColumn(child: any) {
        return child && child.type && child.type._type && child.type._type === AgGridColumn._type;
    }
}

addProperties(AgGrid.ColDefUtil.BOOLEAN_PROPERTIES, PropTypes.bool);
addProperties(AgGrid.ColDefUtil.STRING_PROPERTIES, PropTypes.string);
addProperties(AgGrid.ColDefUtil.OBJECT_PROPERTIES, PropTypes.object);
addProperties(AgGrid.ColDefUtil.ARRAY_PROPERTIES, PropTypes.array);
addProperties(AgGrid.ColDefUtil.NUMBER_PROPERTIES, PropTypes.number);
addProperties(AgGrid.ColDefUtil.FUNCTION_PROPERTIES, PropTypes.func);

function addProperties(listOfProps: string[], propType: any) {
    listOfProps.forEach((propKey: string) => {
        AgGridColumn[propKey] = propType;
    });
}
