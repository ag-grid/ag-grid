import { AgCheckbox } from './agCheckbox';
import { IInputField } from './agAbstractInputField';
export declare class AgRadioButton extends AgCheckbox {
    constructor(config?: IInputField);
    protected isSelected(): boolean;
    toggle(): void;
    protected addInputListeners(): void;
    /**
     * This ensures that if another radio button in the same named group is selected, we deselect this radio button.
     * By default the browser does this for you, but we are managing classes ourselves in order to ensure input
     * elements are styled correctly in IE11, and the DOM 'changed' event is only fired when a button is selected,
     * not deselected, so we need to use our own event.
     */
    private onChange;
}
