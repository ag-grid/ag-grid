import { AG_DND_GHOST_SELECTOR } from '../constants';

/**
 * Clean up any dangling drag and drop handles
 */
export function removeDragAndDropHandles() {
    document.querySelectorAll(AG_DND_GHOST_SELECTOR).forEach((el) => {
        el.remove();
    });
}
