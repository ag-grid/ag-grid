import {
    RefPlaceholder,
    _addManagedElementListeners,
    _clearElement,
    _getActiveDomElement,
    _observeResize,
    _setAriaControls,
    _setAriaDisabled,
    _setAriaLabel,
} from 'ag-stack';

import type { ElementParams, IconName } from 'ag-grid-community';
import { Component, KeyCode, _createIconNoSpan } from 'ag-grid-community';

/** Pixels the border moves for one arrow key press or one Widen / Narrow click. */
const RESIZE_STEP = 20;

const AgHorizontalResizeElement: ElementParams = {
    tag: 'div',
    cls: 'ag-tool-panel-resizer',
    children: [
        {
            tag: 'div',
            ref: 'eResizeBar',
            cls: 'ag-tool-panel-horizontal-resize',
            role: 'separator',
            attrs: { 'aria-orientation': 'vertical' },
        },
        {
            tag: 'div',
            ref: 'eButtons',
            cls: 'ag-tool-panel-resize-buttons',
            children: [
                {
                    tag: 'button',
                    ref: 'eWidenButton',
                    cls: 'ag-button ag-tool-panel-resize-button',
                    attrs: { type: 'button' },
                },
                {
                    tag: 'button',
                    ref: 'eNarrowButton',
                    cls: 'ag-button ag-tool-panel-resize-button',
                    attrs: { type: 'button' },
                },
            ],
        },
    ],
};

/**
 * The tool panel's resize border: dragged, moved with Left / Right Arrow, or, after a click or tap,
 * moved with the Widen and Narrow buttons it reveals.
 */
export class AgHorizontalResize extends Component {
    private readonly eResizeBar: HTMLElement = RefPlaceholder;
    private readonly eButtons: HTMLElement = RefPlaceholder;
    private readonly eWidenButton: HTMLButtonElement = RefPlaceholder;
    private readonly eNarrowButton: HTMLButtonElement = RefPlaceholder;

    private startingWidth: number;
    /** True when the border is on the panel's visual right edge. */
    private inverted: boolean;
    private minWidth: number = 100;
    private maxWidth: number | null = null;
    /** Set between a press on the border and its click, so a pointer focus does not reveal the buttons. */
    private pointerPressed = false;
    /** Set once a press on the border turns into a drag, so the click that ends it does not reveal the buttons. */
    private dragged = false;

    constructor(private readonly elementToResize: HTMLElement) {
        super(AgHorizontalResizeElement);
    }

    public postConstruct(): void {
        const { eResizeBar, eWidenButton, eNarrowButton, elementToResize } = this;
        const finishedWithResizeFunc = this.beans.horizontalResizeSvc!.addResizeBar({
            eResizeBar,
            dragStartPixels: 1,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this),
            onResizeEnd: this.onResizeEnd.bind(this),
        });

        this.addDestroyFunc(finishedWithResizeFunc);
        // the panel is not laid out when it first opens, so its width arrives here
        this.addDestroyFunc(_observeResize(this.beans, elementToResize, () => this.refreshValue()));
        this.setInverted(this.gos.get('enableRtl'));

        this.activateTabIndex([eResizeBar, eWidenButton, eNarrowButton]);
        _setAriaControls(eResizeBar, elementToResize.id);
        const translate = this.getLocaleTextFunc();
        _setAriaLabel(eWidenButton, translate('ariaToolPanelWiden', 'Widen Panel'));
        _setAriaLabel(eNarrowButton, translate('ariaToolPanelNarrow', 'Narrow Panel'));
        this.refreshWidthLimits();
        this.setButtonsDisplayed(false);

        _addManagedElementListeners(this, eResizeBar, {
            pointerdown: () => {
                this.pointerPressed = true;
                this.dragged = false;
            },
            click: this.onResizeBarClick.bind(this),
            focus: () => {
                this.refreshValue();
                if (!this.pointerPressed) {
                    this.setButtonsDisplayed(true);
                }
            },
            keydown: this.onResizeBarKeyDown.bind(this),
        });

        for (const [eButton, widthChange] of [
            [eWidenButton, RESIZE_STEP],
            [eNarrowButton, -RESIZE_STEP],
        ] as const) {
            _addManagedElementListeners(this, eButton, {
                // keep focus where it is, as Safari would otherwise drop it and the buttons would hide
                mousedown: (e: MouseEvent) => e.preventDefault(),
                // the buttons stay in the Tab order while hidden, so Shift+Tab from the panel reaches them
                focus: () => this.setButtonsDisplayed(true),
                click: () => this.resizeBy(widthChange),
            });
        }

        const eGui = this.getGui();
        _addManagedElementListeners(this, eGui, {
            keydown: (e: KeyboardEvent) => {
                if (e.key === KeyCode.ESCAPE && this.isButtonsDisplayed()) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.hideButtons();
                }
            },
            focusout: (e: FocusEvent) => {
                if (!eGui.contains(e.relatedTarget as Node | null)) {
                    this.setButtonsDisplayed(false);
                }
            },
        });
    }

    public setLabel(label: string): void {
        _setAriaLabel(this.eResizeBar, label);
    }

    public setWidthLimits(minWidth: number | undefined, maxWidth: number | undefined): void {
        if (minWidth != null) {
            this.minWidth = minWidth;
        }
        if (maxWidth != null) {
            this.maxWidth = maxWidth;
        }
        this.refreshWidthLimits();
    }

    public setInverted(inverted: boolean): void {
        this.inverted = inverted;
        // each arrow points the way its button moves the border
        this.setButtonIcon(this.eWidenButton, inverted ? 'menuMoveRight' : 'menuMoveLeft');
        this.setButtonIcon(this.eNarrowButton, inverted ? 'menuMoveLeft' : 'menuMoveRight');
    }

    public onPanelDisplayedChanged(displayed: boolean): void {
        if (displayed) {
            this.refreshValue();
        } else {
            this.setButtonsDisplayed(false);
        }
    }

    /** Reads the panel's width into `aria-valuenow`, once the panel is laid out. */
    private refreshValue(): void {
        const width = this.elementToResize.offsetWidth;
        if (width > 0) {
            this.setValue(width);
        }
    }

    private setButtonIcon(eButton: HTMLButtonElement, iconName: IconName): void {
        _clearElement(eButton);
        const icon = _createIconNoSpan(iconName, this.beans);
        if (icon) {
            eButton.appendChild(icon);
        }
    }

    private refreshWidthLimits(): void {
        const { eResizeBar, minWidth, maxWidth } = this;
        eResizeBar.setAttribute('aria-valuemin', String(minWidth));
        if (maxWidth == null) {
            eResizeBar.removeAttribute('aria-valuemax');
        } else {
            eResizeBar.setAttribute('aria-valuemax', String(maxWidth));
        }
    }

    private setValue(width: number): void {
        const { eResizeBar, minWidth, maxWidth } = this;
        eResizeBar.setAttribute('aria-valuenow', String(width));
        _setAriaDisabled(this.eWidenButton, maxWidth != null && width >= maxWidth);
        _setAriaDisabled(this.eNarrowButton, width <= minWidth);
    }

    private isButtonsDisplayed(): boolean {
        return this.getGui().classList.contains('ag-tool-panel-resizer-active');
    }

    private setButtonsDisplayed(displayed: boolean): void {
        this.toggleCss('ag-tool-panel-resizer-active', displayed);
    }

    /** Hides the buttons, first moving focus off them so it is not lost. */
    private hideButtons(): void {
        if (this.eButtons.contains(_getActiveDomElement(this.beans))) {
            this.eResizeBar.focus({ preventScroll: true });
        }
        this.setButtonsDisplayed(false);
    }

    private onResizeBarClick(): void {
        this.pointerPressed = false;
        if (this.dragged) {
            return;
        }
        this.eResizeBar.focus({ preventScroll: true });
        this.setButtonsDisplayed(true);
    }

    private onResizeBarKeyDown(e: KeyboardEvent): void {
        const { key } = e;
        if (key !== KeyCode.LEFT && key !== KeyCode.RIGHT) {
            return;
        }
        e.preventDefault();
        // the border follows the arrow, so the panel widens when the border moves away from it
        const borderMove = key === KeyCode.LEFT ? -RESIZE_STEP : RESIZE_STEP;
        this.resizeBy(-borderMove * this.getDirection());
    }

    /** Resizes by one step, firing `toolPanelSizeChanged` as a drag does: once as it starts and once as it ends. */
    private resizeBy(widthChange: number): void {
        const startingWidth = this.elementToResize.offsetWidth;
        const newWidth = this.clampWidth(startingWidth + widthChange);
        if (newWidth === startingWidth) {
            return;
        }
        this.dispatchResizeEvent(true, false, startingWidth);
        this.applyWidth(newWidth);
        this.dispatchResizeEvent(false, true, newWidth);
    }

    private getDirection(): number {
        return this.inverted ? -1 : 1;
    }

    private clampWidth(width: number): number {
        const { minWidth, maxWidth } = this;
        const newWidth = Math.max(minWidth, width);
        return maxWidth == null ? newWidth : Math.min(maxWidth, newWidth);
    }

    private applyWidth(width: number): void {
        this.elementToResize.style.setProperty('--ag-horizontal-size', `${width}px`);
        this.setValue(width);
    }

    private dispatchResizeEvent(start: boolean, end: boolean, width: number) {
        this.eventSvc.dispatchEvent({
            type: 'toolPanelSizeChanged',
            width: width,
            started: start,
            ended: end,
        });
    }

    private onResizeStart(): void {
        this.dragged = true;
        this.hideButtons();
        this.toggleCss('ag-tool-panel-resizer-dragging', true);
        this.startingWidth = this.elementToResize.offsetWidth;
        this.dispatchResizeEvent(true, false, this.startingWidth);
    }

    private onResizeEnd(delta: number): void {
        this.pointerPressed = false;
        this.toggleCss('ag-tool-panel-resizer-dragging', false);
        return this.onResizing(delta, true);
    }

    private onResizing(delta: number, isEnd: boolean = false): void {
        const newWidth = this.clampWidth(Math.floor(this.startingWidth - delta * this.getDirection()));
        this.applyWidth(newWidth);
        this.dispatchResizeEvent(false, isEnd, newWidth);
    }
}
