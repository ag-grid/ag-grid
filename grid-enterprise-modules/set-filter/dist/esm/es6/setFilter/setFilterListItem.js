var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, PostConstruct, RefSelector } from '@ag-grid-community/core';
/** @param V type of value in the Set Filter */
export class SetFilterListItem extends Component {
    constructor(params) {
        var _a;
        super(params.isGroup ? SetFilterListItem.GROUP_TEMPLATE : SetFilterListItem.TEMPLATE);
        this.focusWrapper = params.focusWrapper;
        this.value = params.value;
        this.params = params.params;
        this.translate = params.translate;
        this.valueFormatter = params.valueFormatter;
        this.item = params.item;
        this.isSelected = params.isSelected;
        this.isTree = params.isTree;
        this.depth = (_a = params.depth) !== null && _a !== void 0 ? _a : 0;
        this.isGroup = params.isGroup;
        this.groupsExist = params.groupsExist;
        this.isExpanded = params.isExpanded;
        this.hasIndeterminateExpandState = params.hasIndeterminateExpandState;
    }
    init() {
        this.render();
        this.eCheckbox.setLabelEllipsis(true);
        this.eCheckbox.setValue(this.isSelected, true);
        this.eCheckbox.setDisabled(!!this.params.readOnly);
        this.eCheckbox.getInputElement().setAttribute('tabindex', '-1');
        this.refreshVariableAriaLabels();
        if (this.isTree) {
            if (this.depth > 0) {
                this.addCssClass('ag-set-filter-indent-' + this.depth);
            }
            if (this.isGroup) {
                this.setupExpansion();
            }
            else {
                if (this.groupsExist) {
                    this.addCssClass('ag-set-filter-add-group-indent');
                }
            }
            _.setAriaLevel(this.focusWrapper, this.depth + 1);
        }
        if (!!this.params.readOnly) {
            // Don't add event listeners if we're read-only.
            return;
        }
        this.eCheckbox.onValueChange((value) => this.onCheckboxChanged(!!value));
    }
    setupExpansion() {
        this.eGroupClosedIcon.appendChild(_.createIcon('setFilterGroupClosed', this.gridOptionsService, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('setFilterGroupOpen', this.gridOptionsService, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        if (this.hasIndeterminateExpandState) {
            this.eGroupIndeterminateIcon.appendChild(_.createIcon('setFilterGroupIndeterminate', this.gridOptionsService, null));
            this.addManagedListener(this.eGroupIndeterminateIcon, 'click', this.onExpandOrContractClicked.bind(this));
        }
        this.setExpandedIcons();
        this.refreshAriaExpanded();
    }
    onExpandOrContractClicked() {
        this.setExpanded(!this.isExpanded);
    }
    setExpanded(isExpanded, silent) {
        if (this.isGroup && isExpanded !== this.isExpanded) {
            this.isExpanded = isExpanded;
            const event = {
                type: SetFilterListItem.EVENT_EXPANDED_CHANGED,
                isExpanded: !!isExpanded,
                item: this.item
            };
            if (!silent) {
                this.dispatchEvent(event);
            }
            this.setExpandedIcons();
            this.refreshAriaExpanded();
        }
    }
    refreshAriaExpanded() {
        _.setAriaExpanded(this.focusWrapper, !!this.isExpanded);
    }
    setExpandedIcons() {
        _.setDisplayed(this.eGroupClosedIcon, this.hasIndeterminateExpandState ? this.isExpanded === false : !this.isExpanded);
        _.setDisplayed(this.eGroupOpenedIcon, this.isExpanded === true);
        if (this.hasIndeterminateExpandState) {
            _.setDisplayed(this.eGroupIndeterminateIcon, this.isExpanded === undefined);
        }
    }
    onCheckboxChanged(isSelected) {
        this.isSelected = isSelected;
        const event = {
            type: SetFilterListItem.EVENT_SELECTION_CHANGED,
            isSelected,
            item: this.item
        };
        this.dispatchEvent(event);
        this.refreshVariableAriaLabels();
    }
    toggleSelected() {
        if (!!this.params.readOnly) {
            return;
        }
        this.setSelected(!this.isSelected);
    }
    setSelected(isSelected, silent) {
        this.isSelected = isSelected;
        this.eCheckbox.setValue(this.isSelected, silent);
    }
    refreshVariableAriaLabels() {
        if (!this.isTree) {
            return;
        }
        const translate = this.localeService.getLocaleTextFunc();
        const checkboxValue = this.eCheckbox.getValue();
        const state = checkboxValue === undefined ?
            translate('ariaIndeterminate', 'indeterminate') :
            (checkboxValue ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden'));
        const visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        _.setAriaLabelledBy(this.eCheckbox.getInputElement(), undefined);
        this.eCheckbox.setInputAriaLabel(`${visibilityLabel} (${state})`);
    }
    setupFixedAriaLabels(value) {
        if (!this.isTree) {
            return;
        }
        const translate = this.localeService.getLocaleTextFunc();
        const itemLabel = translate('ariaFilterValue', 'Filter Value');
        _.setAriaLabel(this.focusWrapper, `${value} ${itemLabel}`);
        _.setAriaDescribedBy(this.focusWrapper, this.eCheckbox.getInputElement().id);
    }
    refresh(item, isSelected, isExpanded) {
        var _a, _b;
        this.item = item;
        // setExpanded checks if value has changed, setSelected does not
        if (isSelected !== this.isSelected) {
            this.setSelected(isSelected, true);
        }
        this.setExpanded(isExpanded, true);
        if (this.valueFunction) {
            // underlying value might have changed, so call again and re-render
            const value = this.valueFunction();
            this.setTooltipAndCellRendererParams(value, value);
            if (!this.cellRendererComponent) {
                this.renderCellWithoutCellRenderer();
            }
        }
        (_b = (_a = this.cellRendererComponent) === null || _a === void 0 ? void 0 : _a.refresh) === null || _b === void 0 ? void 0 : _b.call(_a, this.cellRendererParams);
    }
    render() {
        const { params: { column } } = this;
        let { value } = this;
        let formattedValue = null;
        if (typeof value === 'function') {
            this.valueFunction = value;
            formattedValue = this.valueFunction();
            // backwards compatibility for select all in value
            value = formattedValue;
        }
        else if (this.isTree) {
            // tree values are already formatted via treeListFormatter
            formattedValue = _.toStringOrNull(value);
        }
        else {
            formattedValue = this.getFormattedValue(column, value);
        }
        this.setTooltipAndCellRendererParams(value, formattedValue);
        this.renderCell();
    }
    setTooltipAndCellRendererParams(value, formattedValue) {
        if (this.params.showTooltips) {
            const tooltipValue = formattedValue != null ? formattedValue : _.toStringOrNull(value);
            this.setTooltip(tooltipValue);
        }
        this.cellRendererParams = {
            value,
            valueFormatted: formattedValue,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context,
            colDef: this.params.colDef,
            column: this.params.column,
        };
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'setFilterValue';
        res.colDef = this.getComponentHolder();
        if (this.isTree) {
            res.level = this.depth;
        }
        return res;
    }
    getFormattedValue(column, value) {
        return this.valueFormatterService.formatValue(column, null, value, this.valueFormatter, false);
    }
    renderCell() {
        const compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(this.params, this.cellRendererParams);
        const cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (cellRendererPromise == null) {
            this.renderCellWithoutCellRenderer();
            return;
        }
        cellRendererPromise.then(component => {
            if (component) {
                this.cellRendererComponent = component;
                this.eCheckbox.setLabel(component.getGui());
                this.addDestroyFunc(() => this.destroyBean(component));
            }
        });
    }
    renderCellWithoutCellRenderer() {
        var _a;
        let valueToRender = (_a = (this.cellRendererParams.valueFormatted == null ? this.cellRendererParams.value : this.cellRendererParams.valueFormatted)) !== null && _a !== void 0 ? _a : this.translate('blanks');
        if (typeof valueToRender !== 'string') {
            _.doOnce(() => console.warn('AG Grid: Set Filter Value Formatter must return string values. Please ensure the Set Filter Value Formatter returns string values for complex objects, or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'), 'setFilterComplexObjectsValueFormatter');
            valueToRender = '';
        }
        this.eCheckbox.setLabel(valueToRender);
        this.setupFixedAriaLabels(valueToRender);
    }
    getComponentHolder() {
        return this.params.column.getColDef();
    }
}
SetFilterListItem.EVENT_SELECTION_CHANGED = 'selectionChanged';
SetFilterListItem.EVENT_EXPANDED_CHANGED = 'expandedChanged';
SetFilterListItem.GROUP_TEMPLATE = `
        <div class="ag-set-filter-item" aria-hidden="true">
            <span class="ag-set-filter-group-icons">
                <span class="ag-set-filter-group-closed-icon" ref="eGroupClosedIcon"></span>
                <span class="ag-set-filter-group-opened-icon" ref="eGroupOpenedIcon"></span>
                <span class="ag-set-filter-group-indeterminate-icon" ref="eGroupIndeterminateIcon"></span>
            </span>
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
        </div>`;
SetFilterListItem.TEMPLATE = `
        <div class="ag-set-filter-item">
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
        </div>`;
__decorate([
    Autowired('valueFormatterService')
], SetFilterListItem.prototype, "valueFormatterService", void 0);
__decorate([
    Autowired('userComponentFactory')
], SetFilterListItem.prototype, "userComponentFactory", void 0);
__decorate([
    RefSelector('eCheckbox')
], SetFilterListItem.prototype, "eCheckbox", void 0);
__decorate([
    RefSelector('eGroupOpenedIcon')
], SetFilterListItem.prototype, "eGroupOpenedIcon", void 0);
__decorate([
    RefSelector('eGroupClosedIcon')
], SetFilterListItem.prototype, "eGroupClosedIcon", void 0);
__decorate([
    RefSelector('eGroupIndeterminateIcon')
], SetFilterListItem.prototype, "eGroupIndeterminateIcon", void 0);
__decorate([
    PostConstruct
], SetFilterListItem.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0RmlsdGVyTGlzdEl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2V0RmlsdGVyL3NldEZpbHRlckxpc3RJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBR0QsU0FBUyxFQUdULFNBQVMsRUFJVCxhQUFhLEVBQ2IsV0FBVyxFQU9kLE1BQU0seUJBQXlCLENBQUM7QUFrQ2pDLCtDQUErQztBQUMvQyxNQUFNLE9BQU8saUJBQXFCLFNBQVEsU0FBUztJQWdEL0MsWUFBWSxNQUFrQzs7UUFDMUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEYsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUM1QyxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQUEsTUFBTSxDQUFDLEtBQUssbUNBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BDLElBQUksQ0FBQywyQkFBMkIsR0FBRyxNQUFNLENBQUMsMkJBQTJCLENBQUM7SUFDMUUsQ0FBQztJQUdPLElBQUk7UUFDUixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFZCxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWhFLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBRWpDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNiLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzFEO1lBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNkLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUN6QjtpQkFBTTtnQkFDSCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztpQkFDdEQ7YUFDSjtZQUVELENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFBO1NBQ3BEO1FBRUQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDeEIsZ0RBQWdEO1lBQ2hELE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVPLGNBQWM7UUFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRW5HLElBQUksSUFBSSxDQUFDLDJCQUEyQixFQUFFO1lBQ2xDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNySCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDN0c7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU8seUJBQXlCO1FBQzdCLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVNLFdBQVcsQ0FBQyxVQUErQixFQUFFLE1BQWdCO1FBQ2hFLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxVQUFVLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNoRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUU3QixNQUFNLEtBQUssR0FBMEM7Z0JBQ2pELElBQUksRUFBRSxpQkFBaUIsQ0FBQyxzQkFBc0I7Z0JBQzlDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVTtnQkFDeEIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQ2xCLENBQUM7WUFFRixJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNULElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0I7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztTQUM5QjtJQUNMLENBQUM7SUFFTyxtQkFBbUI7UUFDdkIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVPLGdCQUFnQjtRQUNwQixDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2SCxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ2hFLElBQUksSUFBSSxDQUFDLDJCQUEyQixFQUFFO1lBQ2xDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUM7U0FDL0U7SUFDTCxDQUFDO0lBRU8saUJBQWlCLENBQUMsVUFBbUI7UUFDekMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFFN0IsTUFBTSxLQUFLLEdBQTJDO1lBQ2xELElBQUksRUFBRSxpQkFBaUIsQ0FBQyx1QkFBdUI7WUFDL0MsVUFBVTtZQUNWLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtTQUNsQixDQUFDO1FBRUYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRU0sY0FBYztRQUNqQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUV2QyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTyxXQUFXLENBQUMsVUFBK0IsRUFBRSxNQUFnQjtRQUNqRSxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFTyx5QkFBeUI7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFDN0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEQsTUFBTSxLQUFLLEdBQUcsYUFBYSxLQUFLLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ2pELENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUYsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLHNCQUFzQixFQUFFLGtDQUFrQyxDQUFDLENBQUM7UUFDOUYsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLEVBQUUsU0FBZ0IsQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsR0FBRyxlQUFlLEtBQUssS0FBSyxHQUFHLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRU8sb0JBQW9CLENBQUMsS0FBVTtRQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU87U0FBRTtRQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekQsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQy9ELENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLEtBQUssSUFBSSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVNLE9BQU8sQ0FBQyxJQUE0QyxFQUFFLFVBQStCLEVBQUUsVUFBK0I7O1FBQ3pILElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLGdFQUFnRTtRQUNoRSxJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2hDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3BCLG1FQUFtRTtZQUNuRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLCtCQUErQixDQUFDLEtBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUM3QixJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQzthQUN4QztTQUNKO1FBQ0QsTUFBQSxNQUFBLElBQUksQ0FBQyxxQkFBcUIsMENBQUUsT0FBTyxtREFBRyxJQUFJLENBQUMsa0JBQXlCLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRU0sTUFBTTtRQUNULE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVwQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksY0FBYyxHQUFrQixJQUFJLENBQUM7UUFFekMsSUFBSSxPQUFPLEtBQUssS0FBSyxVQUFVLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFxQixDQUFDO1lBQzNDLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdEMsa0RBQWtEO1lBQ2xELEtBQUssR0FBRyxjQUFxQixDQUFDO1NBQ2pDO2FBQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3BCLDBEQUEwRDtZQUMxRCxjQUFjLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM1QzthQUFNO1lBQ0gsY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDMUQ7UUFFRCxJQUFJLENBQUMsK0JBQStCLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRTVELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRU8sK0JBQStCLENBQUMsS0FBZ0MsRUFBRSxjQUE2QjtRQUNuRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFO1lBQzFCLE1BQU0sWUFBWSxHQUFHLGNBQWMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ2pDO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixHQUFHO1lBQ3RCLEtBQUs7WUFDTCxjQUFjLEVBQUUsY0FBYztZQUM5QixHQUFHLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUc7WUFDaEMsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTO1lBQzVDLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTztZQUN4QyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQzFCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07U0FDN0IsQ0FBQztJQUNOLENBQUM7SUFFTSxnQkFBZ0I7UUFDbkIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDckMsR0FBRyxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQztRQUNoQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3ZDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNaLEdBQXVDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDL0Q7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsS0FBVTtRQUNoRCxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuRyxDQUFDO0lBRU8sVUFBVTtRQUNkLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3BILE1BQU0sbUJBQW1CLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRXZGLElBQUksbUJBQW1CLElBQUksSUFBSSxFQUFFO1lBQzdCLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1lBQ3JDLE9BQU87U0FDVjtRQUVELG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNqQyxJQUFJLFNBQVMsRUFBRTtnQkFDWCxJQUFJLENBQUMscUJBQXFCLEdBQUcsU0FBUyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDMUQ7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyw2QkFBNkI7O1FBQ2pDLElBQUksYUFBYSxHQUFHLE1BQUEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxtQ0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFLLElBQUksT0FBTyxhQUFhLEtBQUssUUFBUSxFQUFFO1lBQ25DLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDbkIsNFNBQTRTLENBQy9TLEVBQUUsdUNBQXVDLENBQzdDLENBQUM7WUFDRixhQUFhLEdBQUcsRUFBRSxDQUFDO1NBQ3RCO1FBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFFTSxrQkFBa0I7UUFDckIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMxQyxDQUFDOztBQTNTYSx5Q0FBdUIsR0FBRyxrQkFBa0IsQ0FBQztBQUM3Qyx3Q0FBc0IsR0FBRyxpQkFBaUIsQ0FBQztBQUsxQyxnQ0FBYyxHQUFhOzs7Ozs7OztlQVEvQixDQUFDO0FBRUcsMEJBQVEsR0FBYTs7O2VBR3pCLENBQUM7QUFoQndCO0lBQW5DLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQztnRUFBK0Q7QUFDL0Q7SUFBbEMsU0FBUyxDQUFDLHNCQUFzQixDQUFDOytEQUE2RDtBQWlCckU7SUFBekIsV0FBVyxDQUFDLFdBQVcsQ0FBQztvREFBd0M7QUFFaEM7SUFBaEMsV0FBVyxDQUFDLGtCQUFrQixDQUFDOzJEQUF1QztBQUN0QztJQUFoQyxXQUFXLENBQUMsa0JBQWtCLENBQUM7MkRBQXVDO0FBQy9CO0lBQXZDLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQztrRUFBOEM7QUF3Q3JGO0lBREMsYUFBYTs2Q0FnQ2IifQ==