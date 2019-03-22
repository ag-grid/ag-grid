// Type definitions for ag-grid-community v20.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { SerializedFilter } from "./iFilter";
export interface SerializedSetFilter extends SerializedFilter {
    values: string[] | null;
}
