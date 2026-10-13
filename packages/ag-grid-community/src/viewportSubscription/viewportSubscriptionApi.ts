import type { BeanCollection } from '../context/context';

export function subscribeToViewport(beans: BeanCollection): void {
    beans.viewportSubSvc?.start(true);
}

export function unsubscribeFromViewport(beans: BeanCollection): void {
    beans.viewportSubSvc?.stop();
}
