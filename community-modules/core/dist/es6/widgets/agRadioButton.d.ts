// Type definitions for @ag-grid-community/core v22.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgCheckbox } from './agCheckbox';
export declare class AgRadioButton extends AgCheckbox {
    protected className: string;
    protected nativeInputClassName: string;
    protected inputType: string;
    protected iconMap: {
        selected: string;
        unselected: string;
    };
    toggle(): void;
    protected getIconName(): string;
}
