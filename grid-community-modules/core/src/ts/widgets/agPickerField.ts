import { AgAbstractField } from "./agAbstractField";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { setAriaLabelledBy, setAriaLabel, setAriaDescribedBy, setAriaExpanded, setAriaRole } from "../utils/aria";
import { createIconNoSpan } from "../utils/icon";
import { setElementWidth, isVisible, getAbsoluteWidth, getInnerHeight } from "../utils/dom";
import { KeyCode } from '../constants/keyCode';
import { IAgLabelParams } from './agAbstractLabel';
import { AddPopupParams, PopupService } from "./popupService";
import { Autowired } from "../context/context";

export interface IPickerFieldParams extends IAgLabelParams {
    pickerType: string;
    pickerGap?: number;
    maxPickerWidth?: number | string;
    maxPickerHeight?: number | string;
    pickerAriaLabelKey: string;
    pickerAriaLabelValue: string;
    template?: string;
    className?: string;
    pickerIcon?: string;
    ariaRole?: string;
    modalPicker?: boolean
}

const TEMPLATE = /* html */`
    <div class="ag-picker-field" role="presentation">
        <div ref="eLabel"></div>
            <div ref="eWrapper" class="ag-wrapper ag-picker-field-wrapper ag-picker-collapsed">
            <div ref="eDisplayField" class="ag-picker-field-display"></div>
            <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
        </div>
    </div>`;

export abstract class AgPickerField<TValue, TConfig extends IPickerFieldParams = IPickerFieldParams, TComponent extends Component = Component> extends AgAbstractField<TValue, TConfig> {

    protected abstract createPickerComponent(): TComponent;

    protected pickerComponent: TComponent | undefined;
    protected isPickerDisplayed: boolean = false;

    protected maxPickerHeight: string | undefined;
    protected maxPickerWidth: string | undefined;
    protected value: TValue;


    private skipClick: boolean = false;
    private pickerGap: number = 4;

    private hideCurrentPicker: (() => void) | null = null;
    private destroyMouseWheelFunc: (() => null) | undefined;
    private ariaRole?: string;

    @Autowired('popupService') protected popupService: PopupService;

    @RefSelector('eLabel') protected readonly eLabel: HTMLElement;
    @RefSelector('eWrapper') protected readonly eWrapper: HTMLElement;
    @RefSelector('eDisplayField') protected readonly eDisplayField: HTMLElement;
    @RefSelector('eIcon') private readonly eIcon: HTMLButtonElement;

    constructor(config?: TConfig) {
        super(config, config?.template || TEMPLATE, config?.className);

        this.ariaRole = config?.ariaRole;
        this.onPickerFocusIn = this.onPickerFocusIn.bind(this);
        this.onPickerFocusOut = this.onPickerFocusOut.bind(this);

        if (!config) { return; }

        const { pickerGap, maxPickerHeight, maxPickerWidth } = config;

        if (pickerGap != null) {
            this.pickerGap = pickerGap;
        }

        if (maxPickerHeight != null) {
            this.setPickerMaxHeight(maxPickerHeight);
        }

        if (maxPickerWidth != null) {
            this.setPickerMaxWidth(maxPickerWidth);
        }
    }

    protected postConstruct() {
        super.postConstruct();

        this.setupAria();

        const displayId = `ag-${this.getCompId()}-display`;
        this.eDisplayField.setAttribute('id', displayId);

        const ariaEl = this.getAriaElement();
        setAriaDescribedBy(ariaEl, displayId);
        this.addManagedListener(ariaEl, 'keydown', this.onKeyDown.bind(this));

        this.addManagedListener(this.eLabel, 'mousedown', this.onLabelOrWrapperMouseDown.bind(this));
        this.addManagedListener(this.eWrapper, 'mousedown', this.onLabelOrWrapperMouseDown.bind(this));

        const { pickerIcon } = this.config;

        if (pickerIcon) {
            const icon = createIconNoSpan(pickerIcon, this.gridOptionsService);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }
    }


    protected setupAria(): void {
        const ariaEl = this.getAriaElement();
        
        ariaEl.setAttribute('tabindex', (this.gridOptionsService.getNum('tabIndex') || 0).toString());

        setAriaExpanded(ariaEl, false);

        if (this.ariaRole) {
            setAriaRole(ariaEl, this.ariaRole);
        }
    }

    protected refreshLabel() {
        const ariaEl = this.getAriaElement();

        setAriaLabelledBy(ariaEl, this.getLabelId() ?? '');

        super.refreshLabel();
    }

    private onLabelOrWrapperMouseDown(): void {
        if (this.skipClick) {
            this.skipClick = false;
            return;
        }

        if (this.isDisabled()) { return; }

        if (this.isPickerDisplayed) {
            this.hidePicker();
        } else {
            this.showPicker();
        }
    }

    protected onKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case KeyCode.UP:
            case KeyCode.DOWN:
            case KeyCode.ENTER:
            case KeyCode.SPACE:
                e.preventDefault();
                this.onLabelOrWrapperMouseDown();
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

        const { pickerType, pickerAriaLabelKey, pickerAriaLabelValue, modalPicker = true } = this.config;

        const popupParams: AddPopupParams = {
            modal: modalPicker,
            eChild: ePicker,
            closeOnEsc: true,
            closedCallback: () => {
                const shouldRestoreFocus = eDocument.activeElement === eDocument.body;
                this.beforeHidePicker();

                if (shouldRestoreFocus && this.isAlive()) {
                    this.getFocusableElement().focus();
                }
            },
            ariaLabel: translate(pickerAriaLabelKey, pickerAriaLabelValue),
        }

        const addPopupRes = this.popupService.addPopup(popupParams);

        const eWrapperWidth = getAbsoluteWidth(this.eWrapper);
        const { maxPickerHeight, maxPickerWidth, pickerGap } = this;

        setElementWidth(ePicker, maxPickerWidth || eWrapperWidth);

        const maxHeight = maxPickerHeight ?? `${getInnerHeight(this.popupService.getPopupParent())}px`;

        ePicker.style.setProperty('max-height', maxHeight);
        ePicker.style.position = 'absolute';

        const alignSide = this.gridOptionsService.is('enableRtl') ? 'right' : 'left';

        this.popupService.positionPopupByComponent({
            type: pickerType,
            eventSource: this.eWrapper,
            ePopup: ePicker,
            position: 'under',
            alignSide,
            keepWithinBounds: true,
            nudgeY: pickerGap
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

        const ariaEl = this.getAriaElement();

        setAriaExpanded(ariaEl, expanded);

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
        setAriaLabel(this.getAriaElement(), label);

        return this;
    }

    public setInputWidth(width: number | 'flex'): this {
        setElementWidth(this.eWrapper, width);
        return this;
    }

    public getFocusableElement(): HTMLElement {
        return this.eWrapper;
    }

    public setPickerGap(gap: number): this {
        this.pickerGap = gap;

        return this;
    }

    public setPickerMaxWidth(width?: number | string): this {
        if (typeof width === 'number') {
            width = `${width}px`;
        }
        this.maxPickerWidth = width == null ? undefined : width;
        return this;
    }

    public setPickerMaxHeight(height?: number | string): this {
        if (typeof height === 'number') {
            height = `${height}px`;
        }

        this.maxPickerHeight = height == null ? undefined : height;
        return this;
    }

    protected destroy(): void {
        this.hidePicker();
        super.destroy();
    }
}
