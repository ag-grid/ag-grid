import {
    _clearElement,
    _findFocusableElements,
    _findNextFocusableElement,
    _getActiveDomElement,
    _getDocument,
    _setAriaPosInSet,
    _setAriaRole,
    _setAriaSetSize,
} from 'ag-stack';

import type { ElementParams } from 'ag-grid-community';
import { Component, KeyCode } from 'ag-grid-community';

import { AgPill } from './agPill';

interface PillRendererParams<TValue> {
    eWrapper?: HTMLElement;
    focusAfterDelete?: () => void;
    focusAfterForwardBoundary?: () => void;
    onHorizontalArrowKeyDown?: (e: KeyboardEvent) => void;
    announceItemFocus?: () => void;
    onPillMouseDown?: (e: MouseEvent) => void;
    valueFormatter?: (value: TValue | TValue[]) => string | null;
    getValue: () => TValue[] | null;
    setValue: (value: TValue[] | null) => void;
}

const AgPillContainerElement: ElementParams = {
    tag: 'div',
    cls: 'ag-pill-container',
};
export class AgPillContainer<TValue> extends Component {
    private params: PillRendererParams<TValue>;
    private pills: { pill: AgPill; key: string }[] = [];
    private getKey: (value: TValue | TValue[]) => string | null;

    constructor() {
        super(AgPillContainerElement);
    }

    public init(params: PillRendererParams<TValue>) {
        this.params = params;
        this.getKey = params.valueFormatter ?? ((v: TValue) => String(v));
        this.refresh();
    }

    public refresh(): void {
        this.clearPills();

        const { params, onPillKeyDown, getKey } = this;

        let values = params.getValue();

        if (!Array.isArray(values)) {
            if (values == null) {
                return;
            }
            values = [values];
        }

        const valueFormatter = params.valueFormatter ?? ((v: TValue) => String(v));
        const len = values.length;

        _setAriaRole(this.getGui(), len === 0 ? 'presentation' : 'listbox');

        for (let i = 0; i < len; i++) {
            const value = values[i];
            const pill: AgPill = this.createBean(
                new AgPill({
                    onButtonClick: () => this.onPillButtonClick(pill),
                    onKeyDown: onPillKeyDown.bind(this),
                })
            );

            const pillGui = pill.getGui();

            _setAriaPosInSet(pillGui, i + 1);
            _setAriaSetSize(pillGui, len);

            if (params.onPillMouseDown) {
                pill.addGuiEventListener('mousedown', params.onPillMouseDown);
            }

            if (params.announceItemFocus) {
                pill.addGuiEventListener('focus', params.announceItemFocus);
            }

            pill.setText(valueFormatter(value) ?? '');
            pill.toggleCloseButtonClass('ag-icon-cancel', true);
            this.appendChild(pillGui);
            this.pills.push({ key: getKey(value) ?? i.toString(), pill });
        }
    }

    public onNavigationKeyDown(e: KeyboardEvent): void {
        const { key } = e;
        const isRtl = this.gos.get('enableRtl');
        const isPrevious = (!isRtl && key === KeyCode.LEFT) || (isRtl && key === KeyCode.RIGHT);
        const isNext = (!isRtl && key === KeyCode.RIGHT) || (isRtl && key === KeyCode.LEFT);

        if (!this.pills.length || (!isPrevious && !isNext)) {
            return;
        }

        e.preventDefault();

        const { beans, params } = this;
        const activeEl = _getActiveDomElement(beans);
        const eGui = this.getGui();
        const focusableElements = _findFocusableElements(eGui);

        if (eGui.contains(activeEl)) {
            // If focus is on a descendant inside a pill, normalize it to the pill element first.
            const activePill = focusableElements.find((el) => el.contains(activeEl));
            if (activePill && activePill !== activeEl) {
                activePill.focus();
            }

            const nextFocusableEl = _findNextFocusableElement(beans, eGui, false, isPrevious);

            if (nextFocusableEl) {
                nextFocusableEl.focus();
            } else if (isNext) {
                params.focusAfterForwardBoundary?.();
            }
            // Keep focus on the edge pill when there is no next target.
            // Wrapping or focus handoff is controlled by the parent rich-select.
        } else if (focusableElements.length > 0) {
            focusableElements[isNext ? 0 : focusableElements.length - 1].focus();
        }
    }

    private clearPills(): void {
        const eGui = this.getGui();

        if (eGui.contains(_getActiveDomElement(this.beans)) && this.params.eWrapper) {
            this.params.eWrapper.focus();
        }

        _clearElement(eGui);
        this.destroyBeans(this.pills.map(({ pill }) => pill));
        this.pills = [];
    }

    private onPillButtonClick(pill: AgPill): void {
        this.deletePill(pill);
    }

    private onPillKeyDown(e: KeyboardEvent): void {
        const key = e.key;

        if (key === KeyCode.LEFT || key === KeyCode.RIGHT) {
            e.stopPropagation();
            if (this.params.onHorizontalArrowKeyDown) {
                this.params.onHorizontalArrowKeyDown(e);
            } else {
                this.onNavigationKeyDown(e);
            }
            return;
        }

        if (key !== KeyCode.DELETE && key !== KeyCode.BACKSPACE) {
            return;
        }

        e.preventDefault();

        const eDoc = _getDocument(this.beans);
        const pillIndex = this.pills.findIndex(({ pill }) => pill.getGui().contains(eDoc.activeElement));

        if (pillIndex === -1) {
            return;
        }

        const pillObj = this.pills[pillIndex];

        if (pillObj?.pill) {
            this.deletePill(pillObj.pill, pillIndex);
        }
    }

    private deletePill(p: AgPill, restoreFocusToIndex?: number): void {
        const { getKey, pills, params } = this;
        const pillKey = (pills[restoreFocusToIndex ?? -1] ?? pills.find(({ pill }) => pill === p))?.key;
        const values = (params.getValue() || []).filter((val) => getKey(val) !== pillKey);
        params.setValue(values);

        if (!values.length) {
            if (params.focusAfterDelete) {
                params.focusAfterDelete();
            } else {
                params.eWrapper?.focus();
            }
        } else if (restoreFocusToIndex != null) {
            const { pill } = pills[Math.min(restoreFocusToIndex, pills.length - 1)];
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
