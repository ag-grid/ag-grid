import type { BeanCollection } from '../context/context';
import { setGridAriaProperty } from './renderApi';

describe('setGridAriaProperty', () => {
    const createBeans = (role: 'grid' | 'treegrid'): BeanCollection => {
        const root = document.createElement('div');
        const gridElement = document.createElement('div');

        root.classList.add('ag-root');
        gridElement.setAttribute('role', role);
        root.appendChild(gridElement);

        return {
            ctrlsSvc: {
                getGridBodyCtrl: () => ({ eGridBody: root, eGridViewport: gridElement }),
            },
        } as any;
    };

    test.each(['grid', 'treegrid'] as const)(
        'sets and removes aria properties on the element with role="%s"',
        (role) => {
            const beans = createBeans(role);
            const { eGridBody: root } = beans.ctrlsSvc.getGridBodyCtrl();
            const roleElement = root.querySelector(`[role="${role}"]`);

            setGridAriaProperty(beans, 'label', 'my grid');

            expect(root.querySelector('[aria-label="my grid"]')).toBe(roleElement);

            setGridAriaProperty(beans, 'label', null);

            expect(root.querySelector('[aria-label]')).toBeNull();
            expect(roleElement?.getAttribute('aria-label')).toBeNull();
        }
    );
});
