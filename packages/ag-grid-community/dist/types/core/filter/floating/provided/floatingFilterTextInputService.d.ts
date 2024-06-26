import { BeanStub } from '../../../context/beanStub';
import type { AgInputTextFieldParams } from '../../../widgets/agInputTextField';
import type { FloatingFilterInputService } from './iFloatingFilterInputService';
export declare class FloatingFilterTextInputService extends BeanStub implements FloatingFilterInputService {
    private params?;
    private eFloatingFilterTextInput;
    private valueChangedListener;
    constructor(params?: {
        config?: AgInputTextFieldParams | undefined;
    } | undefined);
    setupGui(parentElement: HTMLElement): void;
    setEditable(editable: boolean): void;
    setAutoComplete(autoComplete: boolean | string): void;
    getValue(): string | null | undefined;
    setValue(value: string | null | undefined, silent?: boolean): void;
    setValueChangedListener(listener: (e: KeyboardEvent) => void): void;
    setParams(params: {
        ariaLabel: string;
        autoComplete?: boolean | string;
    }): void;
    private setAriaLabel;
}
