import { AgAbstractField } from "./agAbstractField";
import { Autowired } from "../context/context";
import { Component } from "./component";
import { Constants } from "../constants";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";

export abstract class AgPickerField<T, K> extends AgAbstractField<K> {
    protected TEMPLATE =
        `<div class="ag-picker-field" role="presentation">
            <label ref="eLabel"></label>
            <div ref="eWrapper" class="ag-wrapper ag-picker-field-wrapper" tabIndex="-1">
                <%displayField% ref="eDisplayField" class="ag-picker-field-display"></%displayField%>
                <div ref="eIcon" class="ag-picker-field-icon"></div>
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
    @RefSelector('eIcon') private eIcon: HTMLButtonElement;

    protected postConstruct() {
        super.postConstruct();

        const clickHandler = () => {
            if (this.skipClick) {
                this.skipClick = false;
                return;
            }
            if (this.isDisabled()) { return; }
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

        this.addDestroyableEventListener(eGui, 'keydown', (e: KeyboardEvent) => {
            switch (e.keyCode) {
                case Constants.KEY_DOWN:
                case Constants.KEY_ENTER:
                case Constants.KEY_SPACE:
                    clickHandler();
                case Constants.KEY_ESCAPE:
                    e.preventDefault();
                    break;
            }
        });

        this.addDestroyableEventListener(this.eWrapper, 'click', clickHandler);
        this.addDestroyableEventListener(this.eLabel, 'click', clickHandler);

        if (this.pickerIcon) {
            this.eIcon.appendChild(_.createIconNoSpan(this.pickerIcon, this.gridOptionsWrapper, null));
        }
    }

    public setInputWidth(width: number | 'flex'): this {
        _.setElementWidth(this.eWrapper, width);
        return this;
    }

    public getFocusableElement(): HTMLElement {
        return this.eWrapper;
    }
}