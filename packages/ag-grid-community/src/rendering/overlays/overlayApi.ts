import type { BeanCollection } from '../../context/context';

export function showLoadingOverlay(beans: BeanCollection): void {
    beans.overlayService?.showLoadingOverlay();
}

export function showNoRowsOverlay(beans: BeanCollection): void {
    beans.overlayService?.showNoRowsOverlay();
}

export function hideOverlay(beans: BeanCollection): void {
    beans.overlayService?.hideOverlay();
}
