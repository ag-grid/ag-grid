import { BeanStub } from "../../context/beanStub";
import { CellClassParams } from "../../entities/colDef";
import { CellCtrl, ICellComp } from "./cellCtrl";
import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { Beans } from "../beans";

export class CellCustomStyleFeature extends BeanStub {

    private readonly ctrl: CellCtrl;
    private readonly column: Column;
    private readonly rowNode: RowNode;
    private readonly beans: Beans;

    private comp: ICellComp;

    private scope: any;

    constructor(ctrl: CellCtrl, beans: Beans) {
        super();

        this.ctrl = ctrl;
        this.beans = beans;

        this.column = ctrl.getColumn();
        this.rowNode = ctrl.getRowNode();
    }

    public setComp(comp: ICellComp, scope: any): void {
        this.comp = comp;
        this.scope = scope;

        this.applyUserStyles();
        this.applyCellClassRules();
        this.applyClassesFromColDef();
    }

    public applyCellClassRules(): void {
        const colDef = this.column.getColDef();
        const cellClassParams: CellClassParams = {
            value: this.comp.getValue(),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: colDef,
            rowIndex: this.rowNode.rowIndex!,
            api: this.beans.gridOptionsWrapper.getApi()!,
            columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
            $scope: this.scope,
            context: this.beans.gridOptionsWrapper.getContext()
        };

        this.beans.stylingService.processClassRules(
            colDef.cellClassRules,
            cellClassParams,
            className => this.comp.addOrRemoveCssClass(className, true),
            className => this.comp.addOrRemoveCssClass(className, false)
        );
    }

    public applyUserStyles() {
        const colDef = this.column.getColDef();

        if (!colDef.cellStyle) { return; }

        let styles: {};

        if (typeof colDef.cellStyle === 'function') {
            const cellStyleParams = {
                column: this.column,
                value: this.comp.getValue(),
                colDef: colDef,
                data: this.rowNode.data,
                node: this.rowNode,
                rowIndex: this.rowNode.rowIndex!,
                $scope: this.scope,
                api: this.beans.gridOptionsWrapper.getApi()!,
                columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
                context: this.beans.gridOptionsWrapper.getContext(),
            } as CellClassParams;
            const cellStyleFunc = colDef.cellStyle as Function;
            styles = cellStyleFunc(cellStyleParams);
        } else {
            styles = colDef.cellStyle;
        }

        this.comp.setUserStyles(styles);
    }

    public applyClassesFromColDef() {
        const colDef = this.column.getColDef();
        const cellClassParams: CellClassParams = {
            value: this.comp.getValue(),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: colDef,
            rowIndex: this.rowNode.rowIndex!,
            $scope: this.scope,
            api: this.beans.gridOptionsWrapper.getApi()!,
            columnApi: this.beans.gridOptionsWrapper.getColumnApi()!,
            context: this.beans.gridOptionsWrapper.getContext()
        };

        this.beans.stylingService.processStaticCellClasses(
            colDef,
            cellClassParams,
            className => this.comp.addOrRemoveCssClass(className, true)
        );
    }

    // overriding to make public, as we don't dispose this bean via context
    public destroy() {
        super.destroy();
    }
}