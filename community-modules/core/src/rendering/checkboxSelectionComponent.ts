import { AgCheckbox } from '../widgets/agCheckbox';
import { PostConstruct } from '../context/context';
import { Column } from '../entities/column';
import { Component } from '../widgets/component';
import { Events } from '../events';
import { RefSelector } from '../widgets/componentAnnotations';
import { RowNode } from '../entities/rowNode';
import { stopPropagationForAgGrid } from '../utils/event';
import { CheckboxSelectionCallback } from '../entities/colDef';
import { GroupCheckboxSelectionCallback } from './cellRenderers/groupCellRendererCtrl';
import { getAriaCheckboxStateName } from '../utils/aria';

export class CheckboxSelectionComponent extends Component {

    @RefSelector('eCheckbox') private eCheckbox: AgCheckbox;

    private rowNode: RowNode;
    private column: Column | undefined;
    private overrides?: {
        isVisible: boolean | CheckboxSelectionCallback | GroupCheckboxSelectionCallback | undefined,
        callbackParams: any,
        removeHidden: boolean;
    };

    constructor() {
        super(/* html*/`
            <div class="ag-selection-checkbox" role="presentation">
                <ag-checkbox role="presentation" ref="eCheckbox"></ag-checkbox>
            </div>`
        );
    }

    @PostConstruct
    private postConstruct(): void {
        this.eCheckbox.setPassive(true);
    }

    public getCheckboxId(): string {
        return this.eCheckbox.getInputElement().id;
    }

    private onDataChanged(): void {
        // when rows are loaded for the second time, this can impact the selection, as a row
        // could be loaded as already selected (if user scrolls down, and then up again).
        this.onSelectionChanged();
    }

    private onSelectableChanged(): void {
        this.showOrHideSelect();
    }

    private onSelectionChanged(): void {
        const translate = this.localeService.getLocaleTextFunc();
        const state = this.rowNode.isSelected();
        const stateName = getAriaCheckboxStateName(translate, state);
        const [ariaKey, ariaLabel] = this.rowNode.selectable ? ['ariaRowToggleSelection', 'Press Space to toggle row selection'] : ['ariaRowSelectionDisabled', 'Row Selection is disabled for this row'];
        const translatedLabel = translate(ariaKey, ariaLabel);

        this.eCheckbox.setValue(state, true);
        this.eCheckbox.setInputAriaLabel(`${translatedLabel} (${stateName})`);
    }

    private onClicked(newValue: boolean, groupSelectsFiltered: boolean | undefined, event: MouseEvent): number {
        return this.rowNode.setSelectedParams({ newValue, rangeSelect: event.shiftKey, groupSelectsFiltered, event, source: 'checkboxSelected' });
    }

    public init(params: {
        rowNode: RowNode,
        column?: Column,
        overrides?: {
            isVisible: boolean | CheckboxSelectionCallback | GroupCheckboxSelectionCallback | undefined,
            callbackParams: any,
            removeHidden: boolean;
        },
    }): void {
        this.rowNode = params.rowNode;
        this.column = params.column;
        this.overrides = params.overrides;

        this.onSelectionChanged();

        // we don't want double click on this icon to open a group
        this.addManagedListener(this.eCheckbox.getInputElement(), 'dblclick', (event) => {
            stopPropagationForAgGrid(event);
        });

        this.addManagedListener(this.eCheckbox.getInputElement(), 'click', (event) => {
            // we don't want the row clicked event to fire when selecting the checkbox, otherwise the row
            // would possibly get selected twice
            stopPropagationForAgGrid(event);

            const groupSelectsFiltered = this.gos.get('groupSelectsFiltered');
            const isSelected = this.eCheckbox.getValue();

            if (this.shouldHandleIndeterminateState(isSelected, groupSelectsFiltered)) {
                // try toggling children to determine action.
                const result = this.onClicked(true, groupSelectsFiltered, event || {});
                if (result === 0) {
                    this.onClicked(false, groupSelectsFiltered, event);
                }
            } else if (isSelected) {
                this.onClicked(false, groupSelectsFiltered, event);
            } else {
                this.onClicked(true, groupSelectsFiltered, event || {});
            }
        });

        this.addManagedListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.onDataChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_SELECTABLE_CHANGED, this.onSelectableChanged.bind(this));

        const isRowSelectableFunc = this.gos.get('isRowSelectable');
        const checkboxVisibleIsDynamic = isRowSelectableFunc || typeof this.getIsVisible() === 'function';

        if (checkboxVisibleIsDynamic) {
            const showOrHideSelectListener = this.showOrHideSelect.bind(this);
            this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, showOrHideSelectListener);
            this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, showOrHideSelectListener);
            this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, showOrHideSelectListener);
            this.showOrHideSelect();
        }

        this.eCheckbox.getInputElement().setAttribute('tabindex', '-1');
    }

    private shouldHandleIndeterminateState(isSelected: boolean | undefined, groupSelectsFiltered: boolean): boolean {
        // for CSRM groupSelectsFiltered, we can get an indeterminate state where all filtered children are selected,
        // and we would expect clicking to deselect all rather than select all
        return groupSelectsFiltered &&
            (this.eCheckbox.getPreviousValue() === undefined || isSelected === undefined) &&
            this.gos.isRowModelType('clientSide');
    }

    private showOrHideSelect(): void {
        // if the isRowSelectable() is not provided the row node is selectable by default
        let selectable = this.rowNode.selectable;

        // checkboxSelection callback is deemed a legacy solution however we will still consider it's result.
        // If selectable, then also check the colDef callback. if not selectable, this it short circuits - no need
        // to call the colDef callback.
        const isVisible = this.getIsVisible();
        if (selectable) {
            if (typeof isVisible === 'function') {
                const extraParams = this.overrides?.callbackParams;

                if (!this.column) {
                    // full width row
                    selectable = isVisible({ ...extraParams, node: this.rowNode, data: this.rowNode.data });
                } else {
                    const params = this.column.createColumnFunctionCallbackParams(this.rowNode);
                    selectable = isVisible({ ...extraParams, ...params });
                }
            } else {
                selectable = isVisible ?? false;
            }
        }

        const disableInsteadOfHide = this.column?.getColDef().showDisabledCheckboxes;
        if (disableInsteadOfHide) {
            this.eCheckbox.setDisabled(!selectable);
            this.setVisible(true);
            this.setDisplayed(true);
            return;
        }

        if (this.overrides?.removeHidden) {
            this.setDisplayed(selectable);
            return;
        }

        this.setVisible(selectable);
    }

    private getIsVisible(): boolean | CheckboxSelectionCallback<any> | undefined {
        if (this.overrides) {
            return this.overrides.isVisible;
        }

        // column will be missing if groupDisplayType = 'groupRows'
        return this.column?.getColDef()?.checkboxSelection;
    }
}
