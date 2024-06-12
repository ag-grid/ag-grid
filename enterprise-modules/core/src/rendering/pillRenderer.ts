import { Component, _clearElement } from '@ag-grid-community/core';

import { AgPill } from '../widgets/agPill';

export interface PillRendererParams<TValue> {
    eWrapper?: HTMLElement;
    onPillMouseDown?: (e: MouseEvent) => void;
    getValue: () => TValue[] | null;
    setValue: (value: TValue[] | null) => void;
}

export class PillRenderer<TValue> extends Component {
    private params: PillRendererParams<TValue>;
    private pills: AgPill[] = [];

    constructor() {
        super(/* html */ `
            <div class="ag-pill-renderer"></div>
            `);
    }

    public init(params: PillRendererParams<TValue>) {
        this.params = params;
        this.refresh();
    }

    public refresh(): void {
        this.clearPills();

        const { params, onPillButtonKeyDown } = this;

        const values = params.getValue() || [];

        for (const value of values) {
            const pill: AgPill = this.createBean(
                new AgPill({
                    onButtonClick: () => this.onPillButtonClick(pill),
                    onButtonKeyDown: onPillButtonKeyDown.bind(this),
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

    private clearPills(): void {
        const eGui = this.getGui();
        const eDoc = this.gos.getDocument();

        if (eGui.contains(eDoc.activeElement) && this.params.eWrapper) {
            this.params.eWrapper.focus();
        }

        _clearElement(eGui);
        this.destroyBeans(this.pills);
        this.pills = [];
    }

    private onPillButtonClick(pill: AgPill): void {
        const value = pill.getText();
        const values = (this.params.getValue() || []).filter((val) => val !== value);
        this.params.setValue(values);
    }

    private onPillButtonKeyDown(): void {
        // console.log(e);
    }

    public override destroy(): void {
        this.clearPills();
        super.destroy();
    }
}
