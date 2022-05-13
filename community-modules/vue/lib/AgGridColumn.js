import { ColDefUtil } from '@ag-grid-community/core';
export class AgGridColumn {
    static hasChildColumns(slots) {
        return slots && slots.default && slots.default.length > 0;
    }
    static mapChildColumnDefs(slots) {
        return slots.default.map((column) => {
            return AgGridColumn.toColDef(column);
        });
    }
    static toColDef(column) {
        const colDef = AgGridColumn.createColDefFromGridColumn(column);
        if (column.children && column.children.length > 0) {
            colDef.children = AgGridColumn.getChildColDefs(column.children);
        }
        return colDef;
    }
    static getChildColDefs(columnChildren) {
        return columnChildren.map((column) => {
            return AgGridColumn.createColDefFromGridColumn(column);
        });
    }
    static createColDefFromGridColumn(column) {
        const colDef = {};
        Object.assign(colDef, column.data.attrs);
        delete colDef.children;
        // booleans passed down just as is are here as property=""
        // convert boolean props to a boolean here
        ColDefUtil.BOOLEAN_PROPERTIES.forEach((property) => {
            const colDefAsAny = colDef;
            if (colDefAsAny[property] === '') {
                colDefAsAny[property] = true;
            }
        });
        return colDef;
    }
}
