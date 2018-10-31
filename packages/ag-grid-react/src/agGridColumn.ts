import * as React from "react";
import {Component, ReactElement} from "react";
import * as PropTypes from "prop-types";
import * as AgGrid from "ag-grid-community";
import {ColDef, ColGroupDef} from "ag-grid-community";

export interface AgGridColumnProps extends ColDef {
}

export interface AgGridColumnGroupProps extends ColGroupDef {
}

export class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {
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

    public static hasChildColumns(columnProps: any): boolean {
        return Array.isArray(columnProps.children) && React.Children.count(columnProps.children) > 0;
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

    private static assign(colDef: any, from: AgGridColumn): ColDef {
        // effectively Object.assign - here for IE compatibility
        return [from].reduce(function (r, o) {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, colDef);
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
