import type { BeanCollection, RichSelectParams } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class RichSelectRow<TValue> extends Component {
    private readonly params;
    private userComponentFactory;
    wireBeans(beans: BeanCollection): void;
    private value;
    private parsedValue;
    constructor(params: RichSelectParams<TValue>);
    setState(value: TValue): void;
    highlightString(matchString: string): void;
    updateSelected(selected: boolean): void;
    getValue(): TValue;
    toggleHighlighted(highlighted: boolean): void;
    private populateWithoutRenderer;
    private renderValueWithoutRenderer;
    private populateWithRenderer;
}
