// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgRadioButton } from "./agRadioButton";
export declare class AgToggleButton extends AgRadioButton {
    protected className: string;
    protected postConstruct(): void;
    protected updateIcons(): void;
    setValue(value: boolean, silent?: boolean): this;
}
