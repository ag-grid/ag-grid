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
        (_b = (_a = this.cellRendererComponent) === null || _a === void 0 ? void 0 : _a.refresh) === null || _b === void 0 ? void 0 : _b.call(_a, this.cellRendererParams);
    }
    render() {
        const { params: { column } } = this;
        let { value } = this;
        let formattedValue = null;
        if (typeof value === 'function') {
            formattedValue = value();
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
        if (this.params.showTooltips) {
            const tooltipValue = formattedValue != null ? formattedValue : _.toStringOrNull(value);
            this.setTooltip(tooltipValue);
        }
        this.cellRendererParams = {
            value,
            valueFormatted: formattedValue,
            api: this.gridOptionsService.get('api'),
            columnApi: this.gridOptionsService.get('columnApi'),
            context: this.gridOptionsService.get('context'),
            colDef: this.params.colDef,
            column: this.params.column,
        };
        this.renderCell();
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
        var _a;
        const compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(this.params, this.cellRendererParams);
        const cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (cellRendererPromise == null) {
            let valueToRender = (_a = (this.cellRendererParams.valueFormatted == null ? this.cellRendererParams.value : this.cellRendererParams.valueFormatted)) !== null && _a !== void 0 ? _a : this.translate('blanks');
            if (typeof valueToRender !== 'string') {
                _.doOnce(() => console.warn('AG Grid: Set Filter Value Formatter must return string values. Please ensure the Set Filter Value Formatter returns string values for complex objects, or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'), 'setFilterComplexObjectsValueFormatter');
                valueToRender = '';
            }
            this.eCheckbox.setLabel(valueToRender);
            this.setupFixedAriaLabels(valueToRender);
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
