import { BeanStub } from "../../context/beanStub";
import { CellClassParams } from "../../entities/colDef";
import { CellCtrl, ICellComp } from "./cellCtrl";
import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { Beans } from "../beans";
import { CellStyleFunc, CellStyle } from "../../entities/colDef";

export class CellCustomStyleFeature extends BeanStub {

    private readonly cellCtrl: CellCtrl;
    private readonly column: Column;
    private readonly rowNode: RowNode;
    private readonly beans: Beans;
    private staticClasses: string[] = [];

    private cellComp: ICellComp;

    constructor(ctrl: CellCtrl, beans: Beans) {
        super();

        this.cellCtrl = ctrl;
        this.beans = beans;

        this.column = ctrl.getColumn();
        this.rowNode = ctrl.getRowNode();
    }

    public setComp(comp: ICellComp): void {
        this.cellComp = comp;

        this.applyUserStyles();
        this.applyCellClassRules();
        this.applyClassesFromColDef();
    }

    public applyCellClassRules(): void {
        const colDef = this.column.getColDef();
        const cellClassParams: CellClassParams = {
            value: this.cellCtrl.getValue(),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: colDef,
            column: this.column,
            rowIndex: this.rowNode.rowIndex!,
            api: this.beans.gridOptionsService.get('api')!,
            columnApi: this.beans.gridOptionsService.get('columnApi')!,
            context: this.beans.gridOptionsService.get('context')
        };

        this.beans.stylingService.processClassRules(
            colDef.cellClassRules,
            cellClassParams,
            className => this.cellComp.addOrRemoveCssClass(className, true),
            className => this.cellComp.addOrRemoveCssClass(className, false)
        );
    }

    public applyUserStyles() {
        const colDef = this.column.getColDef();

        if (!colDef.cellStyle) { return; }

        let styles: CellStyle | null | undefined;

        if (typeof colDef.cellStyle === 'function') {
            const cellStyleParams: CellClassParams = {
                column: this.column,
                value: this.cellCtrl.getValue(),
                colDef: colDef,
                data: this.rowNode.data,
                node: this.rowNode,
                rowIndex: this.rowNode.rowIndex!,
                api: this.beans.gridOptionsService.get('api')!,
                columnApi: this.beans.gridOptionsService.get('columnApi')!,
                context: this.beans.gridOptionsService.get('context'),
            };
            const cellStyleFunc = colDef.cellStyle as CellStyleFunc;
            styles = cellStyleFunc(cellStyleParams);
        } else {
            styles = colDef.cellStyle;
        }

        this.cellComp.setUserStyles(styles);
    }

    public applyClassesFromColDef() {
        const colDef = this.column.getColDef();
        const cellClassParams: CellClassParams = {
            value: this.cellCtrl.getValue(),
            data: this.rowNode.data,
            node: this.rowNode,
            column: this.column,
            colDef: colDef,
            rowIndex: this.rowNode.rowIndex!,
            api: this.beans.gridOptionsService.get('api')!,
            columnApi: this.beans.gridOptionsService.get('columnApi')!,
            context: this.beans.gridOptionsService.get('context')
        };

        if (this.staticClasses.length) {
            this.staticClasses.forEach(className => this.cellComp.addOrRemoveCssClass(className, false));
        }

        this.staticClasses = this.beans.stylingService.getStaticCellClasses(colDef, cellClassParams);

        if (this.staticClasses.length) {
            this.staticClasses.forEach(className => this.cellComp.addOrRemoveCssClass(className, true));
        }
    }

    // overriding to make public, as we don't dispose this bean via context
    public destroy() {
        super.destroy();
    }
}
