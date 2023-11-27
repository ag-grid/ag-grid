import { RichSelectParams } from "./agRichSelect";
import { Component } from "./component";
export declare class RichSelectRow<TValue> extends Component {
    private readonly params;
    private readonly wrapperEl;
    private value;
    private parsedValue;
    private userComponentFactory;
    constructor(params: RichSelectParams<TValue>, wrapperEl: HTMLElement);
    private postConstruct;
    setState(value: TValue): void;
    highlightString(matchString: string): void;
    updateHighlighted(highlighted: boolean): void;
    private populateWithoutRenderer;
    private renderValueWithoutRenderer;
    private populateWithRenderer;
    private onMouseUp;
}
