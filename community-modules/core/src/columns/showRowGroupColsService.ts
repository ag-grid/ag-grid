import { BeanStub } from '../context/beanStub';
import { Autowired, Bean } from '../context/context';
import type { Column } from '../entities/column';
import type { ColumnModel } from './columnModel';
import type { FuncColsService } from './funcColsService';

@Bean('showRowGroupColsService')
export class ShowRowGroupColsService extends BeanStub {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('funcColsService') private funcColsService: FuncColsService;

    private showRowGroupCols: Column[];
    private showRowGroupColsMap: { [originalColumnId: string]: Column };

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

    public getShowRowGroupCols(): Column[] {
        return this.showRowGroupCols;
    }

    public getShowRowGroupCol(id: string): Column | undefined {
        return this.showRowGroupColsMap[id];
    }
}
