import { ColDef, ColGroupDef, IAggFunc } from "./colDef";

export const DefaultColumnTypes: { [key: string]: ColDef } = {
    numericColumn: {
        headerClass: "ag-numeric-header",
        cellClass: "ag-numeric-cell"
    }
};
