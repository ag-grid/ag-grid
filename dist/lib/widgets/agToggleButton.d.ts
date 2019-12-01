import { AgRadioButton } from "./agRadioButton";
export declare class AgToggleButton extends AgRadioButton {
    protected className: string;
    protected postConstruct(): void;
    protected updateIcons(): void;
    setValue(value: boolean, silent?: boolean): this;
}
