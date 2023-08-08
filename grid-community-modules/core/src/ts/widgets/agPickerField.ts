import { AgAbstractField } from "./agAbstractField";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { setAriaLabelledBy, setAriaLabel, setAriaDescribedBy, setAriaExpanded } from "../utils/aria";
import { createIconNoSpan } from "../utils/icon";
import { exists } from "../utils/generic";
import { setElementWidth, isVisible, getAbsoluteWidth, getInnerHeight } from "../utils/dom";
import { KeyCode } from '../constants/keyCode';
import { IAgLabelParams } from './agAbstractLabel';
import { AddPopupParams, PopupService } from "./popupService";
import { Autowired } from "../context/context";

export interface IPickerFieldParams extends IAgLabelParams {
    pickerType: string;
    pickerAriaLabelKey: string;
    pickerAriaLabelValue: string;
}

export abstract class AgPickerField<TValue, TConfig extends IPickerFieldParams = IPickerFieldParams, TComponent extends Component = Component> extends AgAbstractField<TValue, TConfig> {

    protected abstract getPickerComponent(): TComponent;
    protected value: TValue;
    protected isPickerDisplayed: boolean = false;
    protected isDestroyingPicker: boolean = false;
    private skipClick: boolean = false;
    protected pickerComponent: Component | undefined;
    private hidePopupCallback: (() => void) | null = null;
    private destroyMouseWheelFunc: (() => null) | undefined;

    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eLabel') protected readonly eLabel: HTMLElement;
    @RefSelector('eWrapper') protected readonly eWrapper: HTMLElement;
    @RefSelector('eDisplayField') protected readonly eDisplayField: HTMLElement;
    @RefSelector('eIcon') private readonly eIcon: HTMLButtonElement;

    constructor(config?: TConfig, className?: string, private readonly pickerIcon?: string, ariaRole?: string) {
        super(config,
            /* html */ `<div class="ag-picker-field" role="presentation">
                <div ref="eLabel"></div>
                <div ref="eWrapper"
                    class="ag-wrapper ag-picker-field-wrapper"
                    tabIndex="-1"
                    aria-expanded="false"
                    ${ariaRole ? `role="${ariaRole}"` : ''}
                >
                    <div ref="eDisplayField" class="ag-picker-field-display"></div>
                    <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                </div>
            </div>`, className);
    }

    protected postConstruct() {
        super.postConstruct();

        const displayId = `ag-${this.getCompId()}-display`;

        this.eDisplayField.setAttribute('id', displayId);
        setAriaDescribedBy(this.eWrapper, displayId);

        const eGui = this.getGui();

        this.addManagedListener(eGui, 'mousedown', (e: MouseEvent) => {
            if (
                !this.skipClick &&
                this.pickerComponent?.isAlive() &&
                isVisible(this.pickerComponent.getGui()) &&
                eGui.contains(e.target as HTMLElement)
            ) {
                this.skipClick = true;
            }
        });

        this.addManagedListener(eGui, 'keydown', this.onKeyDown.bind(this));
        this.addManagedListener(this.eWrapper, 'click', this.clickHandler.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.clickHandler.bind(this));

        if (this.pickerIcon) {
            const icon = createIconNoSpan(this.pickerIcon, this.gridOptionsService);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }
    }

    protected refreshLabel() {
        if (exists(this.getLabel())) {
            setAriaLabelledBy(this.eWrapper, this.getLabelId());
        } else {
            this.eWrapper.removeAttribute('aria-labelledby');
        }

        super.refreshLabel();
    }

    private clickHandler(): void {
        if (this.skipClick) {
            this.skipClick = false;
            return;
        }

        if (this.isDisabled()) { return; }
        this.showPicker();
    }

    protected onKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case KeyCode.UP:
            case KeyCode.DOWN:
            case KeyCode.ENTER:
            case KeyCode.SPACE:
                this.clickHandler();
            case KeyCode.ESCAPE:
                if (this.isPickerDisplayed) {
                    e.preventDefault();
                }
                break;
        }
    }

    public showPicker() {
        if (!this.pickerComponent) {
            this.pickerComponent = this.getPickerComponent();
        }

        const eDocument = this.gridOptionsService.getDocument();
        const ePicker = this.pickerComponent.getGui();

        this.destroyMouseWheelFunc = this.addManagedListener(eDocument.body, 'wheel', (e: MouseEvent) => {
            if (!ePicker.contains(e.target as HTMLElement)) {
                this.hidePicker();
            }
        });

        const translate = this.localeService.getLocaleTextFunc();

        const { pickerType, pickerAriaLabelKey, pickerAriaLabelValue } = this.config;

        const popupParams: AddPopupParams = {
            modal: true,
            eChild: ePicker,
            closeOnEsc: true,
            closedCallback: () => {
                this.beforeHidePicker();
            },
            ariaLabel: translate(pickerAriaLabelKey, pickerAriaLabelValue)
        }

        const addPopupRes = this.popupService.addPopup(popupParams);

        this.isPickerDisplayed = true;

        setElementWidth(ePicker, getAbsoluteWidth(this.eWrapper));
        setAriaExpanded(this.eWrapper, true);

        ePicker.style.maxHeight = getInnerHeight(this.popupService.getPopupParent()) + 'px';
        ePicker.style.position = 'absolute';

        this.popupService.positionPopupByComponent({
            type: pickerType,
            eventSource: this.eWrapper,
            ePopup: ePicker,
            position: 'under',
            keepWithinBounds: true
        });

        this.hidePopupCallback = addPopupRes.hideFunc;
    }

    protected beforeHidePicker(): void {
        if (this.destroyMouseWheelFunc) {
            this.destroyMouseWheelFunc();
            this.destroyMouseWheelFunc = undefined;
        }

        this.isPickerDisplayed = false;
        this.pickerComponent = undefined;
        this.hidePopupCallback = null;
    }

    public hidePicker(): void {
        if (this.hidePopupCallback) {
            this.hidePopupCallback();
        }
    }

    public setAriaLabel(label: string): this {
        setAriaLabel(this.eWrapper, label);

        return this;
    }

    public setInputWidth(width: number | 'flex'): this {
        setElementWidth(this.eWrapper, width);
        return this;
    }

    public getFocusableElement(): HTMLElement {
        return this.eWrapper;
    }

    protected destroy(): void {
        this.hidePicker();
        super.destroy();
    }
}
