// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgRadioButton } from './agRadioButton';
export declare class AgToggleButton extends AgRadioButton {
    protected className: string;
    protected inputType: string;
    setValue(value: boolean, silent?: boolean): this;
}
