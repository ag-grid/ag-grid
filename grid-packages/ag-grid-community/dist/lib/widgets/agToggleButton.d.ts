import { AgCheckbox } from './agCheckbox';
import { IInputField } from './agAbstractInputField';
export declare class AgToggleButton extends AgCheckbox {
    constructor(config?: IInputField);
    setValue(value: boolean, silent?: boolean): this;
}
