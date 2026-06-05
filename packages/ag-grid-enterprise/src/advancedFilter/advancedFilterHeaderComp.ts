import {
    RefPlaceholder,
    _clearElement,
    _findNextFocusableElement,
    _focusInto,
    _getActiveDomElement,
    _setAriaColIndex,
    _setAriaColSpan,
    _setAriaRole,
    _setAriaRowIndex,
    _setDisplayed,
} from 'ag-stack';

import type { BeanCollection, ColumnModel, CtrlsService, ElementParams, FocusService } from 'ag-grid-community';
import { Component, KeyCode, _getFloatingFiltersHeight } from 'ag-grid-community';

import { AdvancedFilterComp } from './advancedFilterComp';

const AdvancedFilterHeaderElement: ElementParams = {
    tag: 'div',
    cls: 'ag-row ag-full-width-row ag-advanced-filter-header',
    role: 'row',
    children: [
        {
            tag: 'div',
            cls: 'ag-full-width-anchor',
            role: 'presentation',
            ref: 'eFullWidthAnchor',
        },
    ],
};
export class AdvancedFilterHeaderComp extends Component {
    protected readonly eFullWidthAnchor: HTMLElement = RefPlaceholder;
    private colModel: ColumnModel;
    private focusSvc: FocusService;
    private ctrlsSvc: CtrlsService;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.focusSvc = beans.focusSvc;
        this.ctrlsSvc = beans.ctrlsSvc;
    }

    private eAdvancedFilter: AdvancedFilterComp | undefined;
    private height: number;

    constructor(private enabled: boolean) {
        super(AdvancedFilterHeaderElement);
    }

    public postConstruct(): void {
        this.setupAdvancedFilter(this.enabled);

        this.addDestroyFunc(() => this.destroyBean(this.eAdvancedFilter));

        const refreshLayout = this.refreshLayout.bind(this);

        this.addManagedEventListeners({
            gridColumnsChanged: () => this.onGridColumnsChanged(),
            headerRowsChanged: () => this.setAriaRowIndex(),
            columnHeaderHeightChanged: refreshLayout,
            stylesChanged: refreshLayout,
        });

        this.addManagedPropertyListener('headerHeight', refreshLayout);
        this.addManagedPropertyListener('floatingFiltersHeight', refreshLayout);

        this.addGuiEventListener('keydown', (event: KeyboardEvent) => this.onKeyDown(event));

        this.addGuiEventListener('focusout', (event: FocusEvent) => {
            if (!this.getFocusableElement().contains(event.relatedTarget as HTMLElement)) {
                this.focusSvc.clearAdvancedFilterColumn();
            }
        });
    }

    public override getFocusableElement(): HTMLElement {
        return this.eAdvancedFilter?.getGui() ?? this.getGui();
    }

    public setEnabled(enabled: boolean): void {
        if (enabled === this.enabled) {
            return;
        }
        this.setupAdvancedFilter(enabled);
    }

    public refresh(): void {
        this.eAdvancedFilter?.refresh();
    }

    public refreshLayout(): void {
        if (this.enabled) {
            this.setEnabledHeight();
        }
    }

    public getHeight(): number {
        return this.height;
    }

    public setInputDisabled(disabled: boolean): void {
        this.eAdvancedFilter?.setInputDisabled(disabled);
    }

    private setupAdvancedFilter(enabled: boolean): void {
        if (enabled) {
            // unmanaged as can be recreated
            this.eAdvancedFilter = this.createBean(new AdvancedFilterComp());
            const eAdvancedFilterGui = this.eAdvancedFilter.getGui();
            this.eAdvancedFilter.addCss('ag-advanced-filter-header-cell');

            this.setEnabledHeight();

            this.setAriaRowIndex();
            _setAriaRole(eAdvancedFilterGui, 'gridcell');
            _setAriaColIndex(eAdvancedFilterGui, 1);
            this.setAriaColumnCount(eAdvancedFilterGui);

            this.eFullWidthAnchor.appendChild(eAdvancedFilterGui);
        } else {
            _clearElement(this.eFullWidthAnchor);
            this.destroyBean(this.eAdvancedFilter);
            this.height = 0;
        }
        _setDisplayed(this.getGui(), enabled);
        this.enabled = enabled;
    }

    private setEnabledHeight(): void {
        const eGui = this.getGui();
        this.height = _getFloatingFiltersHeight(this.beans);
        const height = `${this.height}px`;
        eGui.style.height = height;
        eGui.style.minHeight = height;
    }

    private setAriaColumnCount(eAdvancedFilterGui: HTMLElement): void {
        _setAriaColSpan(eAdvancedFilterGui, this.colModel.getCols().length);
    }

    private setAriaRowIndex(): void {
        const headerRowCount = this.ctrlsSvc.getHeaderRowContainerCtrl()?.getRowCount() ?? 0;
        _setAriaRowIndex(this.getGui(), headerRowCount + 1);
    }

    private onGridColumnsChanged(): void {
        if (!this.eAdvancedFilter) {
            return;
        }
        this.setAriaColumnCount(this.eAdvancedFilter.getGui());
        this.setAriaRowIndex();
    }

    private onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case KeyCode.ENTER: {
                if (this.hasFocus()) {
                    if (_focusInto(this.getFocusableElement())) {
                        event.preventDefault();
                    }
                }
                break;
            }
            case KeyCode.ESCAPE:
                if (!this.hasFocus()) {
                    this.getFocusableElement().focus();
                }
                break;
            case KeyCode.UP:
                this.navigateUpDown(true, event);
                break;
            case KeyCode.DOWN:
                this.navigateUpDown(false, event);
                break;
            case KeyCode.TAB:
                if (this.hasFocus()) {
                    this.navigateLeftRight(event);
                } else {
                    const nextFocusableEl = _findNextFocusableElement(
                        this.beans,
                        this.getFocusableElement(),
                        null,
                        event.shiftKey
                    );
                    if (nextFocusableEl) {
                        event.preventDefault();
                        nextFocusableEl.focus();
                    } else {
                        this.navigateLeftRight(event);
                    }
                }
                break;
        }
    }

    private navigateUpDown(backwards: boolean, event: KeyboardEvent): void {
        if (this.hasFocus()) {
            if (this.focusSvc.focusNextFromAdvancedFilter(backwards)) {
                event.preventDefault();
            }
        }
    }

    private navigateLeftRight(event: KeyboardEvent): void {
        if (event.shiftKey ? this.focusSvc.focusLastHeader() : this.focusSvc.focusNextFromAdvancedFilter(false, true)) {
            event.preventDefault();
        }
    }

    private hasFocus(): boolean {
        return _getActiveDomElement(this.beans) === this.getFocusableElement();
    }
}
