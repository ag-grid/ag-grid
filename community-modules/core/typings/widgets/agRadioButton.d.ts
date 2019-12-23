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
