import { ColDef } from "./colDef";

export const DefaultColumnTypes: { [key: string]: ColDef<unknown> } = {
    numericColumn: {
        headerClass: "ag-numeric-header",
        cellClass: "ag-numeric-cell"
    }
};
