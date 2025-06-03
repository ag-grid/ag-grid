import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { Column } from '../interfaces/iColumn';

export type TestIdParams =
    | { component: 'ag-checkbox'; node: RowNode; column?: Column }
    | { component: 'ag-cell'; node: RowNode; column: Column }
    | { component: 'ag-row-drag-handle'; node: RowNode; column: Column };

export class TestIdService extends BeanStub implements NamedBean {
    beanName: BeanName = 'testIdSvc';

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
}
