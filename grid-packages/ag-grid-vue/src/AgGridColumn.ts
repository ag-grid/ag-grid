import { ColDef, ColDefUtil } from 'ag-grid-community';

export class AgGridColumn {
    public static hasChildColumns(slots: any) {
        return slots && slots.default && slots.default.length > 0;
    }

    public static mapChildColumnDefs(slots: any) {
        return slots.default.map((column: any) => {
            return AgGridColumn.toColDef(column);
        });
    }

    public static toColDef(column: any): ColDef {
        const colDef: ColDef = AgGridColumn.createColDefFromGridColumn(column);
        if (column.children && column.children.length > 0) {
            (colDef as any).children = AgGridColumn.getChildColDefs(column.children);
        }
        return colDef;
    }

    private static getChildColDefs(columnChildren: any) {
        return columnChildren.map((column: any) => {
            return AgGridColumn.createColDefFromGridColumn(column);
        });
    }

    private static createColDefFromGridColumn(column: any): ColDef {
        const colDef: ColDef = {};
        Object.assign(colDef, column.data.attrs);
        delete (colDef as any).children;

        // booleans passed down just as is are here as property=""
        // convert boolean props to a boolean here
        ColDefUtil.BOOLEAN_PROPERTIES.forEach((property) => {
            const colDefAsAny = colDef as any;
            if (colDefAsAny[property] === '') {
                colDefAsAny[property] = true;
            }
        });

        return colDef;
    }

}
