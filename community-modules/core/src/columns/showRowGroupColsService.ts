import { BeanStub } from '../context/beanStub';
import type { BeanCollection, BeanName } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnModel } from './columnModel';
import type { FuncColsService } from './funcColsService';

export class ShowRowGroupColsService extends BeanStub {
    beanName: BeanName = 'showRowGroupColsService';

    private columnModel: ColumnModel;
    private funcColsService: FuncColsService;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.columnModel = beans.columnModel;
        this.funcColsService = beans.funcColsService;
    }

    private showRowGroupCols: AgColumn[];
    private showRowGroupColsMap: { [originalColumnId: string]: AgColumn };

    public refresh(): void {
        this.showRowGroupCols = [];
        this.showRowGroupColsMap = {};

        this.columnModel.getCols().forEach((col) => {
            const colDef = col.getColDef();
            const showRowGroup = colDef.showRowGroup;

            const isString = typeof showRowGroup === 'string';
            const isTrue = showRowGroup === true;

            if (!isString && !isTrue) {
                return;
            }

            this.showRowGroupCols.push(col);

            if (isString) {
                this.showRowGroupColsMap[showRowGroup] = col;
            } else {
                const rowGroupCols = this.funcColsService.getRowGroupColumns();
                rowGroupCols.forEach((rowGroupCol) => {
                    this.showRowGroupColsMap[rowGroupCol.getId()] = col;
                });
            }
        });
    }

    public getShowRowGroupCols(): AgColumn[] {
        return this.showRowGroupCols;
    }

    public getShowRowGroupCol(id: string): AgColumn | undefined {
        return this.showRowGroupColsMap[id];
    }
}
