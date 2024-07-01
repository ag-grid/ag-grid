import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef } from '../entities/colDef';
export declare class ColumnDefFactory extends BeanStub implements NamedBean {
    beanName: "columnDefFactory";
    buildColumnDefs(cols: AgColumn[], rowGroupColumns: AgColumn[], pivotColumns: AgColumn[]): (ColDef | ColGroupDef)[];
    private createDefFromGroup;
    private createDefFromColumn;
}
