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
