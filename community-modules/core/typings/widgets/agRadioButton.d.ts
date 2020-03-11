import { AgCheckbox } from './agCheckbox';
export declare class AgRadioButton extends AgCheckbox {
    protected className: string;
    protected inputType: string;
    protected isSelected(): boolean;
    toggle(): void;
    setName(name: string): this;
}
