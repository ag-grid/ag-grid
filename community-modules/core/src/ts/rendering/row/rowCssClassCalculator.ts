import { exists } from "../../utils/generic";
import { RowNode } from "../../entities/rowNode";
import { pushAll } from "../../utils/array";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Autowired, Bean } from "../../context/context";
import { StylingService } from "../../styling/stylingService";
import { RowClassParams } from "../../entities/gridOptions";
import { Constants } from "../../constants/constants";
import { WithoutGridCommon } from "../../interfaces/iCommon";
import { ColumnPinnedType } from "../../entities/column";

export interface RowCssClassCalculatorParams {
    rowNode: RowNode;
    rowIsEven: boolean;
    rowLevel: number;
    fullWidthRow?: boolean;
    firstRowOnPage: boolean;
    lastRowOnPage: boolean;
    usePositionRelative: boolean;
    expandable: boolean;

    pinned: ColumnPinnedType;
    extraCssClass?: string;
    rowFocused?: boolean;
    fadeRowIn?: boolean;
}

@Bean('rowCssClassCalculator')
export class RowCssClassCalculator {

    @Autowired('stylingService') public stylingService: StylingService;
    @Autowired('gridOptionsWrapper') public gridOptionsWrapper: GridOptionsWrapper;

    public getInitialRowClasses(params: RowCssClassCalculatorParams): string[] {

        const classes: string[] = [];

        if (exists(params.extraCssClass)) {
            classes.push(params.extraCssClass);
        }

        classes.push('ag-row');
        classes.push(params.rowFocused ? 'ag-row-focus' : 'ag-row-no-focus');

        if (params.fadeRowIn) {
            classes.push('ag-opacity-zero');
        }

        classes.push(params.rowIsEven ? 'ag-row-even' : 'ag-row-odd');

        if (params.rowNode.isRowPinned()) {
            classes.push('ag-row-pinned');
        }

        if (params.rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }

        if (params.rowNode.footer) {
            classes.push('ag-row-footer');
        }

        classes.push('ag-row-level-' + params.rowLevel);

        if (params.rowNode.stub) {
            classes.push('ag-row-loading');
        }

        if (params.fullWidthRow) {
            classes.push('ag-full-width-row');
        }

        if (params.expandable) {
            classes.push('ag-row-group');
            classes.push(params.rowNode.expanded ? 'ag-row-group-expanded' : 'ag-row-group-contracted');
        }

        if (params.rowNode.dragging) {
            classes.push('ag-row-dragging');
        }

        pushAll(classes, this.processClassesFromGridOptions(params.rowNode));
        pushAll(classes, this.preProcessRowClassRules(params.rowNode));

        // we use absolute position unless we are doing print layout or ensureDomOrder
        classes.push(params.usePositionRelative ? 'ag-row-position-relative' : 'ag-row-position-absolute');

        if (params.firstRowOnPage) {
            classes.push('ag-row-first');
        }

        if (params.lastRowOnPage) {
            classes.push('ag-row-last');
        }

        if (params.fullWidthRow) {
            if (params.pinned === Constants.PINNED_LEFT) {
                classes.push('ag-cell-last-left-pinned');
            }
            if (params.pinned === Constants.PINNED_RIGHT) {
                classes.push('ag-cell-first-right-pinned');
            }
        }

        return classes;
    }

    public processClassesFromGridOptions(rowNode: RowNode): string[] {
        const res: string[] = [];

        const process = (rowCls: string | string[] | undefined) => {
            if (typeof rowCls === 'string') {
                res.push(rowCls);
            } else if (Array.isArray(rowCls)) {
                rowCls.forEach(e => res.push(e));
            }
        };

        // part 1 - rowClass
        const rowClass = this.gridOptionsWrapper.getRowClass();
        if (rowClass) {
            if (typeof rowClass === 'function') {
                console.warn('AG Grid: rowClass should not be a function, please use getRowClass instead');
                return [];
            }
            process(rowClass);
        }

        // part 2 - rowClassFunc
        const rowClassFunc = this.gridOptionsWrapper.getRowClassFunc();

        if (rowClassFunc) {
            const params: WithoutGridCommon<RowClassParams> = {
                data: rowNode.data,
                node: rowNode,
                rowIndex: rowNode.rowIndex!
            };
            const rowClassFuncResult = rowClassFunc(params);
            process(rowClassFuncResult);
        }

        return res;
    }

    private preProcessRowClassRules(rowNode: RowNode): string[] {
        const res: string[] = [];

        this.processRowClassRules(rowNode, (className: string) => {
                res.push(className);
            },
            (className: string) => {
                // not catered for, if creating, no need
                // to remove class as it was never there
            }
        );

        return res;
    }

    public processRowClassRules(rowNode: RowNode, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void {
        const rowClassParams: RowClassParams = {
            data: rowNode.data,
            node: rowNode,
            rowIndex: rowNode.rowIndex!,
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!,
            context: this.gridOptionsWrapper.getContext()
        };

        this.stylingService.processClassRules(
            this.gridOptionsWrapper.rowClassRules(),
            rowClassParams,
            onApplicableClass,
            onNotApplicableClass
        );
    }

    public calculateRowLevel(rowNode: RowNode): number {
        if (rowNode.group) {
            return rowNode.level;
        }

        // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
        return rowNode.parent ? (rowNode.parent.level + 1) : 0;
    }

}
