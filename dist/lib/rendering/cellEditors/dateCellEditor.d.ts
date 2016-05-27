// Type definitions for ag-grid v4.2.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "../../widgets/component";
import { ICellEditor } from "./iCellEditor";
export declare class DateCellEditor extends Component implements ICellEditor {
    private popupService;
    private static TEMPLATE;
    private eText;
    private eButton;
    constructor();
    getValue(): any;
    onBtPush(): void;
    afterGuiAttached(): void;
}
