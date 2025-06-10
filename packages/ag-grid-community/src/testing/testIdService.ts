import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { ITestIdService } from '../interfaces/iTestIdService';

const TEST_ID_ATTR = 'data-testid';

export class TestIdService extends BeanStub implements NamedBean, ITestIdService {
    beanName: BeanName = 'testIdSvc';

    public postConstruct(): void {
        this.addManagedEventListeners({
            firstDataRendered: () => this.setupAllTestIds(),
        });
    }

    public setupAllTestIds(): void {
        const { ctrlsSvc, rowRenderer } = this.beans;

        for (const headerRowContainerCtrl of ctrlsSvc.getHeaderRowContainerCtrls()) {
            for (const headerRowCtrl of headerRowContainerCtrl.getAllCtrls()) {
                const rowIndex = headerRowCtrl.rowIndex;
                for (const headerCellCtrl of headerRowCtrl.getHeaderCellCtrls()) {
                    const column = headerCellCtrl.column;
                    const testId = column.isColumn
                        ? formatTestId('ag-header-cell', { 'row-index': rowIndex, 'col-id': column.getColId() })
                        : formatTestId('ag-header-cell', { 'row-index': rowIndex, 'col-id': column.getGroupId() });
                    headerCellCtrl.comp.setAttributes({ [TEST_ID_ATTR]: testId });
                }
            }
        }

        for (const rowCtrl of rowRenderer.allRowCtrls) {
            for (const cellCtrl of rowCtrl.getAllCellCtrls()) {
                const column = cellCtrl.column;
                const testId = formatTestId('ag-cell', { 'row-id': rowCtrl.rowId!, 'col-id': column.getColId() });
                cellCtrl.comp.setAttributes({ [TEST_ID_ATTR]: testId });
            }
        }

        const gridCtrl = ctrlsSvc.get('gridCtrl');
    }
}

function formatTestId(name: string, attributes: Record<string, string | number>): string {
    return `${name}:${Object.entries(attributes)
        .map(([k, v]) => `${k}=${v}`)
        .join(';')}`;
}
