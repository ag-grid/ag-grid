import { AgAbstractField } from "./agAbstractField";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { setAriaLabelledBy, setAriaLabel, setAriaDescribedBy, setAriaExpanded } from "../utils/aria";
import { createIconNoSpan } from "../utils/icon";
import { exists } from "../utils/generic";
import { setElementWidth, isVisible, getAbsoluteWidth, getInnerHeight, FOCUSABLE_EXCLUDE } from "../utils/dom";
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

    protected abstract createPickerComponent(): TComponent;

    protected pickerComponent: TComponent | undefined;
    protected isPickerDisplayed: boolean = false;
    private skipClick: boolean = false;

    private hideCurrentPicker: (() => void) | null = null;
    private destroyMouseWheelFunc: (() => null) | undefined;
    
    protected value: TValue;

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
                    class="ag-wrapper ag-picker-field-wrapper ag-picker-collapsed"
                    tabIndex="-1"
                    aria-expanded="false"
                    ${ariaRole ? `role="${ariaRole}"` : ''}
                >
                    <div ref="eDisplayField" class="ag-picker-field-display"></div>
                    <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                </div>
            </div>`, className);

        this.onPickerFocusIn = this.onPickerFocusIn.bind(this);
        this.onPickerFocusOut = this.onPickerFocusOut.bind(this);
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

        const focusEl = this.getFocusableElement();

        this.addManagedListener(eGui, 'keydown', this.onKeyDown.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.clickHandler.bind(this));
        this.addManagedListener(focusEl, 'click', this.clickHandler.bind(this));

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
                e.preventDefault();
                this.clickHandler();
                break;
            case KeyCode.ESCAPE:
                if (this.isPickerDisplayed) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.hideCurrentPicker) {
                        this.hideCurrentPicker();
                    }
                }
                break;
        }
    }

    public showPicker() {
        this.isPickerDisplayed = true;

        if (!this.pickerComponent) {
            this.pickerComponent = this.createPickerComponent();
        }

        const pickerGui = this.pickerComponent.getGui();
        pickerGui.addEventListener('focusin', this.onPickerFocusIn);
        pickerGui.addEventListener('focusout', this.onPickerFocusOut);

        this.hideCurrentPicker = this.renderAndPositionPicker();

        this.toggleExpandedStyles(true);
    }

    protected renderAndPositionPicker(): (() => void) {
        const eDocument = this.gridOptionsService.getDocument();
        const ePicker = this.pickerComponent!.getGui();

        if (!this.gridOptionsService.is('suppressScrollWhenPopupsAreOpen')) {
            this.destroyMouseWheelFunc = this.addManagedListener(eDocument.body, 'wheel', (e: MouseEvent) => {
                if (!ePicker.contains(e.target as HTMLElement)) {
                    this.hidePicker();
                }
            });
        }

        const translate = this.localeService.getLocaleTextFunc();

        const { pickerType, pickerAriaLabelKey, pickerAriaLabelValue } = this.config;

        const popupParams: AddPopupParams = {
            modal: true,
            eChild: ePicker,
            closeOnEsc: true,
            closedCallback: () => {
                this.beforeHidePicker();

                if (this.isAlive()) {
                    this.getFocusableElement().focus();
                }
            },
            ariaLabel: translate(pickerAriaLabelKey, pickerAriaLabelValue),
        }

        const addPopupRes = this.popupService.addPopup(popupParams);

        setElementWidth(ePicker, getAbsoluteWidth(this.eWrapper));
        ePicker.style.maxHeight = `${getInnerHeight(this.popupService.getPopupParent())}px`;
        ePicker.style.position = 'absolute';

        this.popupService.positionPopupByComponent({
            type: pickerType,
            eventSource: this.eWrapper,
            ePopup: ePicker,
            position: 'under',
            keepWithinBounds: true
        });

        return addPopupRes.hideFunc;
    }

    protected beforeHidePicker(): void {
        if (this.destroyMouseWheelFunc) {
            this.destroyMouseWheelFunc();
            this.destroyMouseWheelFunc = undefined;
        }

        this.toggleExpandedStyles(false);

        const pickerGui = this.pickerComponent!.getGui();

        pickerGui.removeEventListener('focusin', this.onPickerFocusIn);
        pickerGui.removeEventListener('focusout', this.onPickerFocusOut);

        this.isPickerDisplayed = false;
        this.pickerComponent = undefined;
        this.hideCurrentPicker = null;
    }

    protected toggleExpandedStyles(expanded: boolean): void {
        if (!this.isAlive()) { return; }
        setAriaExpanded(this.eWrapper, expanded);
        this.eWrapper.classList.toggle('ag-picker-expanded', expanded);
        this.eWrapper.classList.toggle('ag-picker-collapsed', !expanded);
    }

    private onPickerFocusIn(): void {
        this.togglePickerHasFocus(true);
    }

    private onPickerFocusOut(e: FocusEvent): void {
        if (!this.pickerComponent?.getGui().contains(e.relatedTarget as Element)) {
            this.togglePickerHasFocus(false);
        }
    }

    private togglePickerHasFocus(focused: boolean): void {
        if (!this.pickerComponent) { return; }

        this.eWrapper.classList.toggle('ag-picker-has-focus', focused);
    }

    public hidePicker(): void {
        if (this.hideCurrentPicker) {
            this.hideCurrentPicker();
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
