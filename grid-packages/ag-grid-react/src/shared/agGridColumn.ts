import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as AgGrid from 'ag-grid-community';
import { ColDef, ColGroupDef } from 'ag-grid-community';

export interface AgGridColumnProps extends ColDef {
}

export interface AgGridColumnGroupProps extends ColGroupDef {
}

export class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {

    render() {
        return null;
    }

    public static mapChildColumnDefs(children: any) {
        return React.Children.map(children, child => !!child ?  AgGridColumn.toColDef(child.props) : null);
    }

    public static toColDef(columnProps: any): ColDef {
        const { children, ...colDef } = columnProps;

        if (AgGridColumn.hasChildColumns(children)) {
            colDef.children = AgGridColumn.mapChildColumnDefs(children);
        }

        return colDef;
    }

    public static hasChildColumns(children: any): boolean {
        return React.Children.count(children) > 0;
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
        // @ts-ignore
        AgGridColumn[propKey] = propType;
    });
}
