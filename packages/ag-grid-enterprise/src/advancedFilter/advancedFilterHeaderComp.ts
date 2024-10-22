import type { BeanCollection, ColumnModel, CtrlsService, FocusService } from 'ag-grid-community';
import {
    Component,
    KeyCode,
    _clearElement,
    _getActiveDomElement,
    _getFloatingFiltersHeight,
    _setAriaColIndex,
    _setAriaColSpan,
    _setAriaRole,
    _setAriaRowIndex,
    _setDisplayed,
} from 'ag-grid-community';

import { AdvancedFilterComp } from './advancedFilterComp';

export class AdvancedFilterHeaderComp extends Component {
    private columnModel: ColumnModel;
    private focusService: FocusService;
    private ctrlsService: CtrlsService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.focusService = beans.focusService;
        this.ctrlsService = beans.ctrlsService;
    }

    private eAdvancedFilter: AdvancedFilterComp | undefined;
    private height: number;

    constructor(private enabled: boolean) {
        super(/* html */ `
            <div class="ag-advanced-filter-header" role="row">
            </div>`);
    }

    public postConstruct(): void {
        this.setupAdvancedFilter(this.enabled);

        this.addDestroyFunc(() => this.destroyBean(this.eAdvancedFilter));

        const heightListener = () => {
            if (this.enabled) {
                this.setEnabledHeight();
            }
        };

        this.addManagedEventListeners({
            gridColumnsChanged: () => this.onGridColumnsChanged(),
            columnHeaderHeightChanged: heightListener,
            gridStylesChanged: heightListener,
        });

        this.addManagedPropertyListener('headerHeight', heightListener);
        this.addManagedPropertyListener('floatingFiltersHeight', heightListener);

        this.addGuiEventListener('keydown', (event: KeyboardEvent) => this.onKeyDown(event));

        this.addGuiEventListener('focusout', (event: FocusEvent) => {
            if (!this.getFocusableElement().contains(event.relatedTarget as HTMLElement)) {
                this.focusService.clearAdvancedFilterColumn();
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

    public getHeight(): number {
        return this.height;
    }

    public setInputDisabled(disabled: boolean): void {
        this.eAdvancedFilter?.setInputDisabled(disabled);
    }

    private setupAdvancedFilter(enabled: boolean): void {
        const eGui = this.getGui();
        if (enabled) {
            // unmanaged as can be recreated
            this.eAdvancedFilter = this.createBean(new AdvancedFilterComp());
            const eAdvancedFilterGui = this.eAdvancedFilter.getGui();
            this.eAdvancedFilter.addCssClass('ag-advanced-filter-header-cell');

            this.setEnabledHeight();

            this.setAriaRowIndex();
            _setAriaRole(eAdvancedFilterGui, 'gridcell');
            _setAriaColIndex(eAdvancedFilterGui, 1);
            this.setAriaColumnCount(eAdvancedFilterGui);

            eGui.appendChild(eAdvancedFilterGui);
        } else {
            _clearElement(eGui);
            this.destroyBean(this.eAdvancedFilter);
            this.height = 0;
        }
        _setDisplayed(eGui, enabled);
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
        _setAriaColSpan(eAdvancedFilterGui, this.columnModel.getCols().length);
    }

    private setAriaRowIndex(): void {
        _setAriaRowIndex(this.getGui(), this.ctrlsService.getHeaderRowContainerCtrl()?.getRowCount() ?? 0);
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
                    if (this.focusService.focusInto(this.getFocusableElement())) {
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
                    const nextFocusableEl = this.focusService.findNextFocusableElement(
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
            if (this.focusService.focusNextFromAdvancedFilter(backwards)) {
                event.preventDefault();
            }
        }
    }

    private navigateLeftRight(event: KeyboardEvent): void {
        if (
            event.shiftKey
                ? this.focusService.focusLastHeader()
                : this.focusService.focusNextFromAdvancedFilter(false, true)
        ) {
            event.preventDefault();
        }
    }

    private hasFocus(): boolean {
        return _getActiveDomElement(this.gos) === this.getFocusableElement();
    }
}
