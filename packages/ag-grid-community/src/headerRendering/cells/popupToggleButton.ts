import type { BeanStub } from '../../context/beanStub';
import type { PopupToggleResult } from '../../misc/menu/menuService';

type PopupToggleListenerOwner = Pick<BeanStub, 'addManagedElementListeners'>;

export function _addPopupToggleButtonListeners(
    owner: PopupToggleListenerOwner,
    button: HTMLElement,
    togglePopup: () => PopupToggleResult
): void {
    let handledMousePointerId: number | undefined;

    owner.addManagedElementListeners(button, {
        pointerdown: (event: PointerEvent) => {
            if (event.pointerType !== 'mouse' || event.button !== 0) {
                handledMousePointerId = undefined;
                return;
            }

            handledMousePointerId = event.pointerId;
            if (togglePopup() === 'opened') {
                event.preventDefault();
            }
        },
        click: (event: MouseEvent) => {
            const followsHandledMousePointer = handledMousePointerId != null && event.detail > 0;
            handledMousePointerId = undefined;
            if (followsHandledMousePointer) {
                return;
            }

            togglePopup();
        },
        pointercancel: (event: PointerEvent) => {
            if (event.pointerId === handledMousePointerId) {
                handledMousePointerId = undefined;
            }
        },
    });
}
