// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgCheckbox } from './agCheckbox';
import { IInputField } from './agAbstractInputField';
export declare class AgToggleButton extends AgCheckbox {
    constructor(config?: IInputField);
    setValue(value: boolean, silent?: boolean): this;
}
