import { AgCheckbox, AgCheckboxParams } from './agCheckbox';
export interface AgToggleButtonParams extends AgCheckboxParams {
}
export declare class AgToggleButton extends AgCheckbox<AgToggleButtonParams> {
    constructor(config?: AgToggleButtonParams);
    setValue(value: boolean, silent?: boolean): this;
}
