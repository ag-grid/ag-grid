import { ColDef } from "ag-grid-community";

export class AgGridColumn {
    static hasChildColumns(slots: any) {
        return slots && slots.default && slots.default.length > 0;
    }

    static mapChildColumnDefs(slots: any) {
        return slots.default.map((column: any) => {
            return AgGridColumn.toColDef(column);
        })
    }

    public static toColDef(column: any): ColDef {
        let colDef: ColDef = AgGridColumn.createColDefFromGridColumn(column);
        if (column.children && column.children.length > 0) {
            (<any>colDef)["children"] = AgGridColumn.getChildColDefs(column.children);
        }
        return colDef;
    }

    private static getChildColDefs(columnChildren: any) {
        return columnChildren.map((column: any) => {
            return AgGridColumn.createColDefFromGridColumn(column)
        });
    };

    private static createColDefFromGridColumn(column: any): ColDef {
        let colDef = {};
        AgGridColumn.assign(colDef, column.data.attrs);
        delete (<any>colDef).children;
        return colDef;
    };

    private static assign(colDef: any, from: AgGridColumn): ColDef {
        // effectively Object.assign - here for IE compatibility
        return [from].reduce(function(r, o) {
            Object.keys(o).forEach(function(k) {
                r[k] = (o as any)[k];
            });
            return r;
        }, colDef);
    }

}