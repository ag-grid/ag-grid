import { BeanStub } from '../context/beanStub';

/**
 * An EmptyBean can be used to manage the lifecycle of event handlers that are tied to a component instead of a controller.
 * Used in React to avoid duplicating listeners and setup logic while React is running in StrictMode where setComp will be called multiple times.
 * This is only required for the Components where the ctrl is managed by AG Grid and passed into the React component.
 * Both React and the Ctrl can decide to destroy the EmptyBean which will clean up listeners setup against it.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class EmptyBean extends BeanStub {}

/** A ctrl whose comp may register on React's per-mount bean, which the ctrl destroys if it dies first. */
export interface CompBeanOwner {
    /** The last mount's bean; once that comp unmounts it is destroyed and holds nothing but grid singletons. */
    compBean: BeanStub<any> | undefined;
}

/** Where the comp's listeners register: React's bean for this mount, or the ctrl for a vanilla comp, which dies with it. */
export function setupCompBean(ctrl: BeanStub<any> & CompBeanOwner, compBean: BeanStub<any> | undefined): BeanStub<any> {
    ctrl.compBean = compBean;
    return compBean ?? ctrl;
}

/** Destroys the comp's bean if the comp is still mounted as its ctrl dies; an unmounted comp destroyed its own. */
export function destroyCompBean(ctrl: CompBeanOwner): void {
    const compBean = ctrl.compBean;
    ctrl.compBean = undefined;
    if (compBean?.isAlive()) {
        compBean.destroy();
    }
}
