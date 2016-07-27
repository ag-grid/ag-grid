// Type definitions for ag-grid v5.0.6
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { AbstractColDef } from "../entities/colDef";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
export declare class CssClassApplier {
    static addHeaderClassesFromCollDef(abstractColDef: AbstractColDef, eHeaderCell: HTMLElement, gridOptionsWrapper: GridOptionsWrapper): void;
}
