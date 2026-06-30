import type { BeanCollection } from '../context/context';
import { setGridAriaProperty } from './renderApi';

describe('setGridAriaProperty', () => {
    const createBeans = (role: 'grid' | 'treegrid'): BeanCollection => {
        const eGridBody = document.createElement('div');
        const eGridViewport = document.createElement('div');

        eGridBody.classList.add('ag-root');
        eGridViewport.setAttribute('role', role);
        eGridBody.appendChild(eGridViewport);

        return {
            ctrlsSvc: {
                getGridBodyCtrl: () => ({ eGridBody, eGridViewport }),
            },
        } as any;
    };

    test.each(['grid', 'treegrid'] as const)(
        'sets and removes aria properties on the element with role="%s"',
        (role) => {
            const beans = createBeans(role);
            const { eGridBody, eGridViewport } = beans.ctrlsSvc.getGridBodyCtrl();

            setGridAriaProperty(beans, 'label', 'my grid');

            expect(eGridViewport.getAttribute('aria-label')).toBe('my grid');
            expect(eGridBody.getAttribute('aria-label')).toBeNull();

            setGridAriaProperty(beans, 'label', null);

            expect(eGridViewport.getAttribute('aria-label')).toBeNull();
            expect(eGridBody.getAttribute('aria-label')).toBeNull();
        }
    );
});
