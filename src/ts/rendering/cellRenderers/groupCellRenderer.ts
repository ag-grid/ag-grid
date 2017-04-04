
import {SvgFactory} from "../../svgFactory";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {ExpressionService} from "../../expressionService";
import {EventService} from "../../eventService";
import {Constants} from "../../constants";
import {Utils as _} from "../../utils";
import {Events} from "../../events";
import {Autowired, Context} from "../../context/context";
import {Component} from "../../widgets/component";
import {ICellRenderer} from "./iCellRenderer";
import {RowNode} from "../../entities/rowNode";
import {GridApi} from "../../gridApi";
import {CellRendererService} from "../cellRendererService";
import {ValueFormatterService} from "../valueFormatterService";
import {CheckboxSelectionComponent} from "../checkboxSelectionComponent";
import {ColumnController} from "../../columnController/columnController";
import {Column} from "../../entities/column";
import {QuerySelector, RefSelector} from "../../widgets/componentAnnotations";

var svgFactory = SvgFactory.getInstance();

export class GroupCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE =
        '<span>' +
         '<span class="ag-group-expanded" ref="eExpanded"></span>' +
         '<span class="ag-group-contracted" ref="eContracted"></span>' +
         '<span class="ag-group-loading" ref="eLoading"></span>' +
         '<span class="ag-group-checkbox" ref="eCheckbox"></span>' +
         '<span class="ag-group-value" ref="eValue"></span>' +
         '<span class="ag-group-child-count" ref="eChildCount"></span>' +
        '</span>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('cellRendererService') private cellRendererService: CellRendererService;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('context') private context: Context;
    @Autowired('columnController') private columnController: ColumnController;

    @RefSelector('eExpanded') private eExpanded: HTMLElement;
    @RefSelector('eContracted') private eContracted: HTMLElement;
    @RefSelector('eLoading') private eLoading: HTMLElement;
    @RefSelector('eCheckbox') private eCheckbox: HTMLElement;
    @RefSelector('eValue') private eValue: HTMLElement;
    @RefSelector('eChildCount') private eChildCount: HTMLElement;

    private params: any;
    private nodeWasSwapped: boolean;

    constructor() {
        super(GroupCellRenderer.TEMPLATE);
    }

    public init(params: any): void {

        this.setParams(params);

        let groupKeyMismatch = this.isGroupKeyMismatch();
        let embeddedRowMismatch = this.embeddedRowMismatch();
        if (groupKeyMismatch || embeddedRowMismatch) { return; }

        this.setupComponents();
    }

    private setParams(params: any): void {
        if (this.gridOptionsWrapper.isGroupHideOpenParents()) {
            let nodeToSwapIn = this.isFirstChildOfFirstChild(params.node, params.colDef.field);
            this.nodeWasSwapped = _.exists(nodeToSwapIn);
            if (this.nodeWasSwapped) {
                let newParams = <any> {};
                _.assign(newParams, params);
                newParams.node = nodeToSwapIn;
                this.params = newParams;
            } else {
                this.params = params;
            }
        } else {
            this.nodeWasSwapped = false;
            this.params = params;
        }
    }

    private setupComponents(): void {
        this.addExpandAndContract();
        this.addCheckboxIfNeeded();
        this.addValueElement();
        this.addPadding();
    }

    private isFirstChildOfFirstChild(rowNode: RowNode, groupField: string): RowNode {
        let currentRowNode = rowNode;

        // if we are hiding groups, then if we are the first child, of the first child,
        // all the way up to the column we are interested in, then we show the group cell.

        let isCandidate = true;
        let foundFirstChildPath = false;
        let nodeToSwapIn: RowNode;

        while (isCandidate && !foundFirstChildPath) {

            let parentRowNode = currentRowNode.parent;
            let firstChild = _.exists(parentRowNode) && currentRowNode.childIndex === 0;

            if (firstChild) {
                if (parentRowNode.field === groupField) {
                    foundFirstChildPath = true;
                    nodeToSwapIn = parentRowNode;
                }
            } else {
                isCandidate = false;
            }

            currentRowNode = parentRowNode;
        }

        return foundFirstChildPath ? nodeToSwapIn : null;
    }

    private isGroupKeyMismatch(): boolean {
        // if the user only wants to show details for one group in this column,
        // then the group key here says which column we are interested in.

        let restrictToOneGroup = this.params.restrictToOneGroup;

        let skipCheck = this.nodeWasSwapped || !restrictToOneGroup;
        if (skipCheck) { return false; }

        let groupField = this.params.colDef.field;
        let rowNode = this.params.node;

        return groupField !== rowNode.field;
    }

    // if we are doing embedded full width rows, we only show the renderer when
    // in the body, or if pinning in the pinned section, or if pinning and RTL,
    // in the right section. otherwise we would have the cell repeated in each section.
    private embeddedRowMismatch(): boolean {
        if (this.gridOptionsWrapper.isEmbedFullWidthRows()) {

            let pinnedLeftCell = this.params.pinned === Column.PINNED_LEFT;
            let pinnedRightCell = this.params.pinned === Column.PINNED_RIGHT;
            let bodyCell = !pinnedLeftCell && !pinnedRightCell;

            if (this.gridOptionsWrapper.isEnableRtl()) {
                if (this.columnController.isPinningLeft()) {
                    return !pinnedRightCell;
                } else {
                    return !bodyCell;
                }
            } else {
                if (this.columnController.isPinningLeft()) {
                    return !pinnedLeftCell;
                } else {
                    return !bodyCell;
                }
            }
        } else {
            return false;
        }
    }

    private addPadding(): void {
        let params = this.params;
        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        var node = params.node;
        var suppressPadding = params.suppressPadding;
        if (!suppressPadding && (node.footer || node.level > 0)) {
            var paddingFactor: any;
            if (params.colDef && params.padding >= 0) {
                paddingFactor = params.padding;
            } else {
                paddingFactor = 10;
            }
            var paddingPx = node.level * paddingFactor;
            var reducedLeafNode = this.columnController.isPivotMode() && params.node.leafGroup;
            if (node.footer) {
                paddingPx += 15;
            } else if (!node.isExpandable() || reducedLeafNode) {
                paddingPx += 10;
            }

            if (this.gridOptionsWrapper.isEnableRtl()) {
                // if doing rtl, padding is on the right
                this.getGui().style.paddingRight = paddingPx + 'px';
            } else {
                // otherwise it is on the left
                this.getGui().style.paddingLeft = paddingPx + 'px';
            }
        }
    }

    private addValueElement(): void {
        let params = this.params;
        let rowNode = this.params.node;
        if (params.innerRenderer) {
            this.createFromInnerRenderer();
        } else if (rowNode.footer) {
            this.createFooterCell();
        } else if (rowNode.group) {
            this.createGroupCell();
            this.addChildCount();
        } else {
            this.createLeafCell();
        }
    }

    private createFromInnerRenderer(): void {
        let innerComponent = this.cellRendererService.useCellRenderer(this.params.innerRenderer, this.eValue, this.params);
        this.addDestroyFunc( ()=> {
            if (innerComponent && innerComponent.destroy) {
                innerComponent.destroy();
            }
        });
    }

    private createFooterCell(): void {
        let footerValue: string;
        let groupName = this.getGroupName();
        let footerValueGetter = this.params.footerValueGetter;
        if (footerValueGetter) {
            // params is same as we were given, except we set the value as the item to display
            let paramsClone: any = _.cloneObject(this.params);
            paramsClone.value = groupName;
            if (typeof footerValueGetter === 'function') {
                footerValue = footerValueGetter(paramsClone);
            } else if (typeof footerValueGetter === 'string') {
                footerValue = this.expressionService.evaluate(footerValueGetter, paramsClone);
            } else {
                console.warn('ag-Grid: footerValueGetter should be either a function or a string (expression)');
            }
        } else {
            footerValue = 'Total ' + groupName;
        }

        this.eValue.innerHTML = footerValue;
    }

    private createGroupCell(): void {
        let params = this.params;
        // pull out the column that the grouping is on
        let rowGroupColumns = this.params.columnApi.getRowGroupColumns();

        // if we are using in memory grid grouping, then we try to look up the column that
        // we did the grouping on. however if it is not possible (happens when user provides
        // the data already grouped) then we just the current col, ie use cellRenderer of current col
        let columnOfGroupedCol = rowGroupColumns[params.node.rowGroupIndex];
        if (_.missing(columnOfGroupedCol)) {
            columnOfGroupedCol = params.column;
        }

        let groupName = this.getGroupName();
        let valueFormatted = this.valueFormatterService.formatValue(columnOfGroupedCol, params.node, params.scope, params.rowIndex, groupName);

        let groupedColCellRenderer = columnOfGroupedCol.getCellRenderer();

        // reuse the params but change the value
        if (typeof groupedColCellRenderer === 'function') {
            // reuse the params but change the value
            params.value = groupName;
            params.valueFormatted = valueFormatted;

            let colDefOfGroupedCol = columnOfGroupedCol.getColDef();
            let groupedColCellRendererParams = colDefOfGroupedCol ? colDefOfGroupedCol.cellRendererParams : null;

            // because we are talking about the different column to the original, any user provided params
            // are for the wrong column, so need to copy them in again.
            if (groupedColCellRendererParams) {
                _.assign(params, groupedColCellRenderer);
            }
            this.cellRendererService.useCellRenderer(colDefOfGroupedCol.cellRenderer, this.eValue, params);
        } else {
            let valueToRender = _.exists(valueFormatted) ? valueFormatted : groupName;
            if (_.exists(valueToRender) && valueToRender !== '') {
                this.eValue.appendChild(document.createTextNode(valueToRender));
            }
        }
    }

    private addChildCount(): void {

        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (this.params.suppressCount) { return; }

        this.addDestroyableEventListener(this.eventService, Events.EVENT_AFTER_FILTER_CHANGED, this.updateChildCount.bind(this));

        // filtering changes the child count, so need to cater for it
        this.updateChildCount();
    }

    private updateChildCount(): void {
        let allChildrenCount = this.params.node.allChildrenCount;
        let text = allChildrenCount >= 0 ? `(${allChildrenCount})` : '';
        this.eChildCount.innerHTML = text;
    }

    private getGroupName(): string {
        let keyMap = this.params.keyMap;
        let rowNodeKey = this.params.node.key;
        if (keyMap && typeof keyMap === 'object') {
            var valueFromMap = keyMap[rowNodeKey];
            if (valueFromMap) {
                return valueFromMap;
            } else {
                return rowNodeKey;
            }
        } else {
            return rowNodeKey;
        }
    }

    private createLeafCell(): void {
        if (_.exists(this.params.value)) {
            this.eValue.innerHTML = this.params.value;
        }
    }

    private isUserWantsSelected(): boolean {
        let paramsCheckbox = this.params.checkbox;
        if (typeof paramsCheckbox === 'function') {
            return paramsCheckbox(this.params);
        } else {
            return paramsCheckbox === true;
        }
    }

    private addCheckboxIfNeeded(): void {
        let rowNode = this.params.node;
        var checkboxNeeded = this.isUserWantsSelected()
                // footers cannot be selected
                && !rowNode.footer
                // floating rows cannot be selected
                && !rowNode.floating
                // flowers cannot be selected
                && !rowNode.flower;
        if (checkboxNeeded) {
            var cbSelectionComponent = new CheckboxSelectionComponent();
            this.context.wireBean(cbSelectionComponent);
            cbSelectionComponent.init({rowNode: rowNode});
            this.eCheckbox.appendChild(cbSelectionComponent.getGui());
            this.addDestroyFunc( ()=> cbSelectionComponent.destroy() );
        }
    }

    private addExpandAndContract(): void {
        let params = this.params;
        let eGroupCell: HTMLElement = params.eGridCell;
        let eExpandedIcon = _.createIconNoSpan('groupExpanded', this.gridOptionsWrapper, null, svgFactory.createGroupContractedIcon);
        let eContractedIcon = _.createIconNoSpan('groupContracted', this.gridOptionsWrapper, null, svgFactory.createGroupExpandedIcon);
        let eLoadingIcon = _.createIconNoSpan('groupLoading', this.gridOptionsWrapper, null, svgFactory.createGroupLoadingIcon);
        this.eExpanded.appendChild(eExpandedIcon);
        this.eContracted.appendChild(eContractedIcon);
        this.eLoading.appendChild(eLoadingIcon);

        let expandOrContractListener = this.onExpandOrContract.bind(this);
        this.addDestroyableEventListener(this.eExpanded, 'click', expandOrContractListener);
        this.addDestroyableEventListener(this.eContracted, 'click', expandOrContractListener);
        this.addDestroyableEventListener(this.eLoading, 'click', expandOrContractListener);

        // if editing groups, then double click is to start editing
        if (!this.gridOptionsWrapper.isEnableGroupEdit()) {
            this.addDestroyableEventListener(eGroupCell, 'dblclick', expandOrContractListener);
        }

        // expand / contract as the user hits enter
        this.addDestroyableEventListener(eGroupCell, 'keydown', this.onKeyDown.bind(this));
        this.addDestroyableEventListener(params.node, RowNode.EVENT_EXPANDED_CHANGED, this.showExpandAndContractIcons.bind(this));
        this.addDestroyableEventListener(params.node, RowNode.EVENT_LOADING_CHANGED, this.showExpandAndContractIcons.bind(this));
        this.showExpandAndContractIcons();
    }

    private onKeyDown(event: KeyboardEvent): void {
        if (_.isKeyPressed(event, Constants.KEY_ENTER)) {
            this.onExpandOrContract();
            event.preventDefault();
        }
    }

    public onExpandOrContract(): void {
        let rowNode = this.params.node;

        rowNode.setExpanded(!rowNode.expanded);

        if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
            this.params.api.refreshRows([rowNode]);
        }
    }

    private showExpandAndContractIcons(): void {
        let rowNode = this.params.node;

        let reducedLeafNode = this.columnController.isPivotMode() && rowNode.leafGroup;

        let expandable = rowNode.isExpandable() && !rowNode.footer && !reducedLeafNode;
        if (expandable) {
            // if expandable, show one based on expand state
            _.setVisible(this.eContracted, !rowNode.expanded);
            _.setVisible(this.eExpanded, rowNode.expanded && !rowNode.loading);
            _.setVisible(this.eLoading, rowNode.expanded && rowNode.loading);
        } else {
            // it not expandable, show neither
            _.setVisible(this.eExpanded, false);
            _.setVisible(this.eContracted, false);
            _.setVisible(this.eLoading, false);
        }
    }
}
