import type { BeanCollection } from './context/context';
import type { CellPosition } from './interfaces/iCellPosition';
import { FocusService } from './focusService';

describe('FocusService', () => {
    let focusSvc: FocusService;
    let rootDiv: HTMLDivElement;

    beforeEach(() => {
        focusSvc = new FocusService();
        rootDiv = document.createElement('div');
        document.body.append(rootDiv);

        const gos = {
            get: () => false,
            getDomDataKey: () => '__ag_dom_data',
        };

        focusSvc['gos'] = gos as any;
        focusSvc['beans'] = { eRootDiv: rootDiv } as any as BeanCollection;
    });

    afterEach(() => {
        rootDiv.remove();
    });

    it('treats tab guard focus as grid focus for refresh recovery', () => {
        const tabGuard = document.createElement('div');
        tabGuard.classList.add('ag-tab-guard');
        tabGuard.tabIndex = 0;
        rootDiv.append(tabGuard);
        tabGuard.focus();

        const focusedCell = {
            rowIndex: 1,
            rowPinned: null,
            column: { getId: () => 'a' },
        } as CellPosition;

        focusSvc['focusedCell'] = focusedCell;

        expect(focusSvc.getFocusCellToUseAfterRefresh()).toBe(focusedCell);
    });
});
