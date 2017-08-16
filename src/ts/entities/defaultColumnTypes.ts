import {ColDef, ColGroupDef, IAggFunc} from "./colDef";

export const defaultColumTypes: {[key: string]: ColDef} = {
    "numericColumn": {
        "headerClass": "ag-numeric-header",
        "cellClass": "ag-numeric-cell"
    }
};

