import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import { _getRootNode } from '../gridOptionsUtils';
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
        const root = _getRootNode(this.beans);

        root.querySelectorAll('.ag-header-group-cell').forEach((groupCell) => {
            groupCell.setAttribute(
                TEST_ID_ATTR,
                formatTestId('ag-header-group-cell', {
                    ['col-id']: groupCell.getAttribute('col-id'),
                })
            );
        });

        root.querySelectorAll('.ag-header-cell').forEach((cell) => {
            cell.setAttribute(
                TEST_ID_ATTR,
                formatTestId('ag-header-cell', {
                    ['col-id']: cell.getAttribute('col-id'),
                })
            );

            cell
                .querySelector('.ag-header-cell-menu-button')
                ?.setAttribute(
                    TEST_ID_ATTR,
                    formatTestId('ag-header-cell-menu-button', { ['col-id']: cell.getAttribute('col-id') })
                );
        });
    }
}

function formatTestId(name: string, attributes: Record<string, string | number | null>): string {
    return `${name}:${Object.entries(attributes)
        .map(([k, v]) => `${k}=${v}`)
        .join(';')}`;
}
