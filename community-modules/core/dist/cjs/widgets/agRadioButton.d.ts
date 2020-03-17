// Type definitions for @ag-grid-community/core v23.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgCheckbox } from './agCheckbox';
export declare class AgRadioButton extends AgCheckbox {
    protected className: string;
    protected inputType: string;
    protected isSelected(): boolean;
    toggle(): void;
    setName(name: string): this;
}
