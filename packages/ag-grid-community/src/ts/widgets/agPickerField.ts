import { AgLabel } from "./agLabel";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";
import { Autowired } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";

export abstract class AgPickerField<T, K> extends AgLabel {
    protected TEMPLATE =
        `<div class="ag-picker-field">
            <label ref="eLabel"></label>
            <div ref="eWrapper" class="ag-wrapper">
                <%displayField% ref="eDisplayField"></%displayField%>
                <button ref="eButton" class="ag-picker-button"> </button>
            </div>
        </div>`;

    protected abstract showPicker(): void;
    protected abstract displayTag: string;
    protected abstract className: string;
    protected abstract pickerIcon: string;
    protected value: T;
    protected displayedPicker: boolean = false;
    abstract getValue(): any;
    abstract setValue(value: any): this;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eWrapper') protected eWrapper: HTMLElement;
    @RefSelector('eDisplayField') protected eDisplayField: K;
    @RefSelector('eButton') private eButton: HTMLButtonElement;

    protected postConstruct() {
        super.postConstruct();

        this.addDestroyableEventListener(this.eButton, 'click', () => {
            this.showPicker();
        });

        if (this.pickerIcon) {
            this.eButton.appendChild(_.createIconNoSpan(this.pickerIcon, this.gridOptionsWrapper, null));
        }
    }

    public setInputWidth(width: number | 'flex'): this {
        _.setElementWidth(this.eWrapper, width);
        return this;
    }

    public setWidth(width: number): this {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }

    public onValueChange(callbackFn: (newValue: T) => void): this {
        this.addDestroyableEventListener(this, 'valueChange', () => {
            callbackFn(this.value);
        });
        return this;
    }
}