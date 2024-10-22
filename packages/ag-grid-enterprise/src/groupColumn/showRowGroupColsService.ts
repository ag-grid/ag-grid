import { BeanStub } from 'ag-grid-community';
import type {
    AgColumn,
    BeanCollection,
    ColumnModel,
    IColsService,
    IShowRowGroupColsService,
    NamedBean,
} from 'ag-grid-community';

export class ShowRowGroupColsService extends BeanStub implements NamedBean, IShowRowGroupColsService {
    beanName = 'showRowGroupColsService' as const;

    private columnModel: ColumnModel;
    private rowGroupColsService?: IColsService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.rowGroupColsService = beans.rowGroupColsService;
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
                const rowGroupCols = this.rowGroupColsService?.columns ?? [];
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
