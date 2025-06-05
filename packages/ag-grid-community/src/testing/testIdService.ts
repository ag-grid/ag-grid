import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { Column } from '../interfaces/iColumn';

export type TestIdParams =
    | { component: 'ag-checkbox'; node: RowNode; column?: Column }
    | { component: 'ag-cell'; node: RowNode; column: Column }
    | { component: 'ag-row-drag-handle'; node: RowNode; column: Column };

const TEST_ID_ATTR = 'data-testid';
export class TestIdService extends BeanStub implements NamedBean {
    beanName: BeanName = 'testIdSvc';

    public postConstruct(): void {
        this.addManagedEventListeners({
            firstDataRendered: () => this.setupAllTestIds(),
        });
    }

    public setTestId(eGui: HTMLElement, params: TestIdParams): void {
        let testId: string | undefined = undefined;

        switch (params.component) {
            case 'ag-checkbox':
                testId = `ag-checkbox-row-${params.node.id}${params.column ? `-col-${params.column.getColId()}` : ''}`;
                break;

            case 'ag-cell':
                testId = `ag-cell-row-${params.node.id}-col-${params.column.getColId()}`;
                break;

            case 'ag-row-drag-handle':
                testId = `ag-row-drag-handle-${params.node.id}`;
                break;

            default:
                throw new Error(`Unrecognised component: ${params}`);
        }

        eGui.setAttribute('data-testid', testId);
    }

    public setupAllTestIds(): void {
        for (const headerRowContainerCtrl of this.beans.ctrlsSvc.getHeaderRowContainerCtrls()) {
            for (const headerRowCtrl of headerRowContainerCtrl.getAllCtrls()) {
                const rowIndex = headerRowCtrl.rowIndex;
                for (const headerCellCtrl of headerRowCtrl.getHeaderCellCtrls()) {
                    const column = headerCellCtrl.column;
                    const testId = column.isColumn
                        ? `ag-header-cell:row-index=${rowIndex};col-id=${column.getColId()}`
                        : `ag-header-cell:row-index=${rowIndex};col-group-id=${column.getGroupId()}`;
                    headerCellCtrl.comp.setAttributes({ [TEST_ID_ATTR]: testId });
                }
            }
        }
    }
}
