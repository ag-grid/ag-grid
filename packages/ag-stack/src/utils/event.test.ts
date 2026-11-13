import { AgAbstractBean } from '../core/agAbstractBean';
import { _addManagedElementListeners } from './event';

class Bean extends AgAbstractBean<any, any, any, any> {}

describe('_addManagedElementListeners', () => {
    test('marks touch listeners on an element passive, wheel listeners active, and leaves other events alone', () => {
        const element = document.createElement('div');
        const addEventListener = vi.spyOn(element, 'addEventListener');

        _addManagedElementListeners(new Bean(), element, { touchstart: vi.fn(), wheel: vi.fn(), click: vi.fn() });

        expect(addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true });
        expect(addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: false });
        expect(addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    test('removes the listener from the element when the bean is destroyed', () => {
        const element = document.createElement('div');
        const listener = vi.fn();
        const bean = new Bean();

        _addManagedElementListeners(bean, element, { touchstart: listener });
        bean.destroy();
        element.dispatchEvent(new Event('touchstart'));

        expect(listener).not.toHaveBeenCalled();
    });
});
