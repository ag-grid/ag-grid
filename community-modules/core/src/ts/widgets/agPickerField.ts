import { RefSelector } from "./componentAnnotations";
import { Autowired } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgAbstractField } from "./agAbstractField";
import { _ } from "../utils";
import { Component } from "./component";

export abstract class AgPickerField<T, K> extends AgAbstractField<K> {
    protected TEMPLATE =
        `<div class="ag-picker-field">
            <label ref="eLabel"></label>
            <div ref="eWrapper" class="ag-wrapper ag-picker-field-wrapper">
                <%displayField% ref="eDisplayField" class="ag-picker-field-display"></%displayField%>
                <button ref="eButton" class="ag-picker-field-button"> </button>
            </div>
        </div>`;

    protected abstract showPicker(): Component;
    protected abstract pickerIcon: string;
    protected value: K;
    protected isDestroyingPicker: boolean = false;
    private skipClick: boolean = false;
    private pickerComponent: Component;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eWrapper') protected eWrapper: HTMLElement;
    @RefSelector('eDisplayField') protected eDisplayField: T;
    @RefSelector('eButton') private eButton: HTMLButtonElement;

    protected postConstruct() {
        super.postConstruct();

        const clickHandler = () => {
            if (this.skipClick) {
                this.skipClick = false;
                return;
            }
            this.pickerComponent = this.showPicker();
        };

        const eGui = this.getGui();

        this.addDestroyableEventListener(eGui, 'mousedown', (e: MouseEvent) => {
            if (
                !this.skipClick &&
                this.pickerComponent &&
                this.pickerComponent.isAlive() &&
                _.isVisible(this.pickerComponent.getGui()) &&
                eGui.contains(e.target as HTMLElement)
            ) {
                this.skipClick = true;
            }
        });

        this.addDestroyableEventListener(this.eWrapper, 'click', clickHandler);
        this.addDestroyableEventListener(this.eLabel, 'click', clickHandler);

        if (this.pickerIcon) {
            this.eButton.appendChild(_.createIconNoSpan(this.pickerIcon, this.gridOptionsWrapper, null));
        }
    }

    public setInputWidth(width: number | 'flex'): this {
        _.setElementWidth(this.eWrapper, width);
        return this;
    }
}