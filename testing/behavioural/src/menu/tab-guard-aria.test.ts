import { waitFor } from '@testing-library/dom';
import { TestGridsManager, polyfillOffsetParent } from 'ag-test-utils';

import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('tab guard accessibility', () => {
    const grids = new TestGridsManager({ modules: [AllEnterpriseModule] });
    let restoreOffsetParent: () => void;
    let outside: HTMLButtonElement;

    beforeEach(() => {
        restoreOffsetParent = polyfillOffsetParent();
        outside = document.createElement('button');
        outside.textContent = 'Outside';
        document.body.append(outside);
    });

    afterEach(() => {
        grids.reset();
        outside.remove();
        restoreOffsetParent();
    });

    test.each(['new', 'legacy', 'context', 'submenu'] as const)(
        '%s menu guards redirect without exposing menu children',
        async (surface) => {
            const api = await grids.createGridAndWait('menu-guard-aria', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 1 }],
                columnMenu: surface === 'legacy' ? 'legacy' : 'new',
                getColumnMenuItems: () =>
                    surface === 'submenu' ? [{ name: 'Parent', subMenu: [{ name: 'Action' }] }] : [{ name: 'Action' }],
                getContextMenuItems: () => [{ name: 'Action' }],
            });

            if (surface === 'context') {
                api.showContextMenu({
                    rowNode: api.getDisplayedRowAtIndex(0),
                    column: api.getColumn('value')!,
                    value: 1,
                    source: 'api',
                });
            } else {
                api.showColumnMenu('value');
            }

            if (surface === 'submenu') {
                await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menuitem'));
                document.activeElement!.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
                );
            }

            const menu = await waitFor(() => {
                const menus = document.querySelectorAll<HTMLElement>('.ag-menu-list');
                expect(menus).toHaveLength(surface === 'submenu' ? 2 : 1);
                return menus[surface === 'submenu' ? 1 : 0];
            });
            const guards = menu.querySelectorAll<HTMLElement>(':scope > .ag-tab-guard');
            expect(guards).toHaveLength(2);

            for (const guard of guards) {
                outside.focus();
                expect(guard.getAttribute('role')).toBeNull();
                expect(guard.getAttribute('aria-hidden')).toBe('true');
                guard.focus();
                expect(document.activeElement?.getAttribute('role')).toBe('menuitem');
                expect(guard.getAttribute('aria-hidden')).toBe('true');
            }
        }
    );
});
