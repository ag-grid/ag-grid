import type { BeanCollection } from '../context/context';

/** Opens (`true`) or closes (`false`) a window in which column width changes animate when `animateColumnResizing` is set. */
export function _setColumnWidthAnimation({ ctrlsSvc }: BeanCollection, enable: boolean): void {
    const gridBodyCtrl = ctrlsSvc.isAlive() ? ctrlsSvc.get('gridBodyCtrl') : undefined;
    if (enable) {
        gridBodyCtrl?.startColumnWidthAnimation();
    } else {
        gridBodyCtrl?.finishColumnWidthAnimation();
    }
}
