// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
export declare class AgAutocompleteRow extends Component {
    private value;
    private hasHighlighting;
    constructor();
    setState(value: string, selected: boolean): void;
    updateSelected(selected: boolean): void;
    setSearchString(searchString: string): void;
    private render;
}
