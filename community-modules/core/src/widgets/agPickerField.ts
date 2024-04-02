import { AgAbstractField, AgFieldParams } from "./agAbstractField";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { setAriaExpanded, setAriaRole } from "../utils/aria";
import { createIconNoSpan } from "../utils/icon";
import { setElementWidth, getAbsoluteWidth, getInnerHeight, formatSize } from "../utils/dom";
import { KeyCode } from '../constants/keyCode';
import { AddPopupParams, PopupService } from "./popupService";
import { Autowired } from "../context/context";
import { Events } from "../eventKeys";

export interface AgPickerFieldParams extends AgFieldParams {
    pickerType: string;
    pickerGap?: number;
    /**
     * If true, will set min-width and max-width (if present), and will set width to wrapper element width.
     * If false, will set min-width, max-width and width to maxPickerWidth or wrapper element width.
     */
    variableWidth?: boolean;
    minPickerWidth?: number | string;
    maxPickerWidth?: number | string;
    maxPickerHeight?: number | string;
    pickerAriaLabelKey: string;
    pickerAriaLabelValue: string;
    template?: string;
    className?: string;
    pickerIcon?: string;
    ariaRole?: string;
    modalPicker?: boolean;
    inputWidth?: number | 'flex';
}

const TEMPLATE = /* html */`
    <div class="ag-picker-field" role="presentation">
        <div ref="eLabel"></div>
            <div ref="eWrapper" class="ag-wrapper ag-picker-field-wrapper ag-picker-collapsed">
            <div ref="eDisplayField" class="ag-picker-field-display"></div>
            <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
        </div>
    </div>`;

export abstract class AgPickerField<TValue, TConfig extends AgPickerFieldParams = AgPickerFieldParams, TComponent extends Component = Component> extends AgAbstractField<TValue, TConfig> {

    protected abstract createPickerComponent(): TComponent;

    protected pickerComponent: TComponent | undefined;
    protected isPickerDisplayed: boolean = false;

    protected maxPickerHeight: string | undefined;
    protected variableWidth: boolean;
    protected minPickerWidth: string | undefined;
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

        const { pickerGap, maxPickerHeight, variableWidth, minPickerWidth, maxPickerWidth } = config;

        if (pickerGap != null) {
            this.pickerGap = pickerGap;
        }

        this.variableWidth = !!variableWidth;

        if (maxPickerHeight != null) {
            this.setPickerMaxHeight(maxPickerHeight);
        }

        if (minPickerWidth != null) {
            this.setPickerMinWidth(minPickerWidth);
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
        this.addManagedListener(ariaEl, 'keydown', this.onKeyDown.bind(this));

        this.addManagedListener(this.eLabel, 'mousedown', this.onLabelOrWrapperMouseDown.bind(this));
        this.addManagedListener(this.eWrapper, 'mousedown', this.onLabelOrWrapperMouseDown.bind(this));

        const { pickerIcon, inputWidth } = this.config;

        if (pickerIcon) {
            const icon = createIconNoSpan(pickerIcon, this.gos);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }

        if (inputWidth != null) {
            this.setInputWidth(inputWidth);
        }
    }

    protected setupAria(): void {
        const ariaEl = this.getAriaElement();
        
        ariaEl.setAttribute('tabindex', (this.gos.get('tabIndex')).toString());

        setAriaExpanded(ariaEl, false);

        if (this.ariaRole) {
            setAriaRole(ariaEl, this.ariaRole);
        }
    }

    private onLabelOrWrapperMouseDown(e?: MouseEvent): void {
        if (e) {
            const focusableEl = this.getFocusableElement();
            // if the focusableEl is not the wrapper and the mousedown
            // targets the focusableEl, we should not expand/collapse the picker.
            // Note: this will happen when AgRichSelect is set with `allowTyping=true`
            if (focusableEl !== this.eWrapper && e?.target === focusableEl) {
                return;
            }

            // this prevents a BUG where MouseDown causes the element to be focused
            // after the picker is shown and focus ends up being lost.
            e.preventDefault();
            this.getFocusableElement().focus();
        }

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
        const eDocument = this.gos.getDocument();
        const ePicker = this.pickerComponent!.getGui();

        if (!this.gos.get('suppressScrollWhenPopupsAreOpen')) {
            this.destroyMouseWheelFunc = this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, () => {
                this.hidePicker();
            });
        }

        const translate = this.localeService.getLocaleTextFunc();

        const { pickerAriaLabelKey, pickerAriaLabelValue, modalPicker = true } = this.config;

        const popupParams: AddPopupParams = {
            modal: modalPicker,
            eChild: ePicker,
            closeOnEsc: true,
            closedCallback: () => {
                const activeEl = this.gos.getActiveDomElement()
                const shouldRestoreFocus = !activeEl || activeEl === eDocument.body;
                this.beforeHidePicker();

                if (shouldRestoreFocus && this.isAlive()) {
                    this.getFocusableElement().focus();
                }
            },
            ariaLabel: translate(pickerAriaLabelKey, pickerAriaLabelValue),
        }

        const addPopupRes = this.popupService.addPopup(popupParams);

        const { maxPickerHeight, minPickerWidth, maxPickerWidth, variableWidth } = this;

        if (variableWidth) {
            if (minPickerWidth) {
                ePicker.style.minWidth = minPickerWidth;
            }
            ePicker.style.width = formatSize(getAbsoluteWidth(this.eWrapper));
            if (maxPickerWidth) {
                ePicker.style.maxWidth = maxPickerWidth;
            }
        } else {
            setElementWidth(ePicker, maxPickerWidth ?? getAbsoluteWidth(this.eWrapper));
        }

        const maxHeight = maxPickerHeight ?? `${getInnerHeight(this.popupService.getPopupParent())}px`;

        ePicker.style.setProperty('max-height', maxHeight);
        ePicker.style.position = 'absolute';

        this.alignPickerToComponent();

        return addPopupRes.hideFunc;
    }

    protected alignPickerToComponent(): void {
        if (!this.pickerComponent) { return; } 

        const { pickerType } = this.config;
        const { pickerGap } = this;

        const alignSide = this.gos.get('enableRtl') ? 'right' : 'left';

        this.popupService.positionPopupByComponent({
            type: pickerType,
            eventSource: this.eWrapper,
            ePopup: this.pickerComponent.getGui(),
            position: 'under',
            alignSide,
            keepWithinBounds: true,
            nudgeY: pickerGap
        });
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

    public setPickerMinWidth(width?: number | string): this {
        if (typeof width === 'number') {
            width = `${width}px`;
        }
        this.minPickerWidth = width == null ? undefined : width;
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
