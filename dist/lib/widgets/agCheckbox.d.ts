// Type definitions for ag-grid v5.0.0-alpha.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "./component";
export declare class AgCheckbox extends Component {
    static EVENT_CHANGED: string;
    private static TEMPLATE;
    private gridOptionsWrapper;
    private eChecked;
    private eUnchecked;
    private eIndeterminate;
    private eLabel;
    private selected;
    constructor();
    private init();
    private onClick();
    isSelected(): boolean;
    toggle(): void;
    setSelected(selected: boolean): void;
    private updateIcons();
}
