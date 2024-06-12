import type { BeanCollection, FocusService } from '@ag-grid-community/core';
import { Component, KeyCode, _clearElement } from '@ag-grid-community/core';

import { AgPill } from './agPill';

export interface PillRendererParams<TValue> {
    eWrapper?: HTMLElement;
    onPillMouseDown?: (e: MouseEvent) => void;
    getValue: () => TValue[] | null;
    setValue: (value: TValue[] | null) => void;
}

export class PillContainer<TValue> extends Component {
    private focusService: FocusService;
    private params: PillRendererParams<TValue>;
    private pills: AgPill[] = [];

    public wireBeans(beans: BeanCollection): void {
        this.focusService = beans.focusService;
    }

    constructor() {
        super(/* html */ `
            <div class="ag-pill-container"></div>
            `);
    }

    public init(params: PillRendererParams<TValue>) {
        this.params = params;
        this.refresh();
    }

    public refresh(): void {
        this.clearPills();

        const { params, onPillKeyDown } = this;

        const values = params.getValue() || [];

        for (const value of values) {
            const pill: AgPill = this.createBean(
                new AgPill({
                    onButtonClick: () => this.onPillButtonClick(pill),
                    onKeyDown: onPillKeyDown.bind(this),
                })
            );

            if (params.onPillMouseDown) {
                pill.addGuiEventListener('mousedown', params.onPillMouseDown);
            }

            pill.setText(value as string);
            pill.toggleCloseButtonClass('ag-icon-cancel', true);
            this.appendChild(pill.getGui());
            this.pills.push(pill);
        }
    }

    public onKeyboardNavigateKey(e: KeyboardEvent): void {
        const { key } = e;

        if (!this.pills.length || (key !== KeyCode.LEFT && key !== KeyCode.RIGHT)) {
            return;
        }

        e.preventDefault();
        const nextFocusableEl = this.focusService.findNextFocusableElement(this.getGui(), false, key === KeyCode.LEFT);

        if (nextFocusableEl) {
            nextFocusableEl.focus();
        }
    }

    private clearPills(): void {
        const eGui = this.getGui();

        if (eGui.contains(this.gos.getActiveDomElement()) && this.params.eWrapper) {
            this.params.eWrapper.focus();
        }

        _clearElement(eGui);
        this.destroyBeans(this.pills);
        this.pills = [];
    }

    private onPillButtonClick(pill: AgPill): void {
        this.deletePill(pill);
    }

    private onPillKeyDown(e: KeyboardEvent): void {
        const key = e.key;

        if (key !== KeyCode.DELETE && key !== KeyCode.BACKSPACE) {
            return;
        }

        e.preventDefault();

        const eDoc = this.gos.getDocument();
        const pillIndex = this.pills.findIndex((pill) => pill.getGui().contains(eDoc.activeElement));

        if (pillIndex === -1) {
            return;
        }

        const pill = this.pills[pillIndex];

        if (pill) {
            this.deletePill(pill, pillIndex);
        }
    }

    private deletePill(pill: AgPill, restoreFocusToIndex?: number): void {
        const value = pill.getText();
        const values = (this.params.getValue() || []).filter((val) => val !== value);
        this.params.setValue(values);

        if (!values.length && this.params.eWrapper) {
            this.params.eWrapper.focus();
        } else if (restoreFocusToIndex != null) {
            const pill = this.pills[Math.min(restoreFocusToIndex, this.pills.length - 1)];
            if (pill) {
                pill.getFocusableElement().focus();
            }
        }
    }

    public override destroy(): void {
        this.clearPills();
        super.destroy();
    }
}
