import type { BeanStub } from '../../context/beanStub';
import type { PopupToggleResult } from '../../misc/menu/menuService';
import { TouchListener } from '../../widgets/touchListener';

type PopupToggleListenerOwner = Pick<BeanStub, 'addManagedElementListeners' | 'addDestroyFunc'>;

export function _addPopupToggleButtonListeners(
    owner: PopupToggleListenerOwner,
    button: HTMLElement,
    togglePopup: () => PopupToggleResult
): void {
    owner.addManagedElementListeners(button, {
        mousedown: (event: MouseEvent) => {
            if (event.button === 0 && togglePopup() === 'opened') {
                event.preventDefault();
            }
        },
        click: (event: MouseEvent) => {
            if (event.detail === 0) {
                togglePopup();
            }
        },
    });

    const touchListener = new TouchListener(button, true);
    touchListener.addEventListener('tap', togglePopup);
    owner.addDestroyFunc(() => touchListener.destroy());
}
