import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { FakeHScrollComp } from './gridBodyComp/fakeHScrollComp';
import type { FakeVScrollComp } from './gridBodyComp/fakeVScrollComp';
import type { GridBodyCtrl } from './gridBodyComp/gridBodyCtrl';
import type { GridBodyScrollFeature } from './gridBodyComp/gridBodyScrollFeature';
import type { RowContainerCtrl } from './gridBodyComp/rowContainer/rowContainerCtrl';
import type { GridCtrl } from './gridComp/gridCtrl';
import type { GridHeaderCtrl } from './headerRendering/gridHeaderCtrl';
import type { HeaderRowContainerCtrl } from './headerRendering/rowContainer/headerRowContainerCtrl';

/** If adding or removing a control, update `REQUIRED_CTRLS` below. */
interface ReadyParams {
    gridCtrl: GridCtrl;
    gridBodyCtrl: GridBodyCtrl;

    scrolling: RowContainerCtrl;
    pinnedTop: RowContainerCtrl;
    pinnedBottom: RowContainerCtrl;
    stickyTop: RowContainerCtrl;
    stickyBottom: RowContainerCtrl;

    fakeHScrollComp: FakeHScrollComp;
    fakeVScrollComp: FakeVScrollComp;
    gridHeaderCtrl: GridHeaderCtrl;

    headerRowContainerCtrl: HeaderRowContainerCtrl;
}

type CtrlType = keyof ReadyParams;
const REQUIRED_CTRLS: CtrlType[] = [
    'gridCtrl',
    'gridBodyCtrl',
    'scrolling',
    'pinnedTop',
    'pinnedBottom',
    'stickyTop',
    'stickyBottom',
    'fakeHScrollComp',
    'fakeVScrollComp',
    'gridHeaderCtrl',
    'headerRowContainerCtrl',
];

type BeanDestroyFunc = Pick<BeanStub<any>, 'addDestroyFunc'>;

// for all controllers that are singletons, they can register here so other parts
// of the application can access them.
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class CtrlsService extends BeanStub<'ready'> implements NamedBean {
    beanName = 'ctrlsSvc' as const;

    private params: ReadyParams = {} as any;
    private ready = false;
    private readonly readyCallbacks: ((p: ReadyParams) => void)[] = [];

    public postConstruct() {
        // With React 19 StrictMode, ctrlService can be ready twice.
        // The first time after the first render cycle, and the second time after the second render cycle which is only done in StrictMode.
        // By making the local events async, we effectively debounce the first ready event until after the second render cycle has completed.
        // This means that the ready logic across the grid will run against the currently rendered components and controllers.
        // We make this async only for React 19 as StrictMode in React 19 double fires ref callbacks whereas previous versions of React do not.
        this.addEventListener(
            'ready',
            () => {
                this.updateReady();
                if (this.ready) {
                    for (const callback of this.readyCallbacks) {
                        callback(this.params);
                    }
                    this.readyCallbacks.length = 0;
                }
            },
            this.beans.frameworkOverrides.runWhenReadyAsync?.() ?? false
        );
    }
    private updateReady(): void {
        // ready when all required controls have been registered and are alive
        this.ready = REQUIRED_CTRLS.every((ctrlType) => {
            const ctrl = this.params[ctrlType];
            return ctrl?.isAlive() ?? false;
        });
    }

    public whenReady(caller: BeanDestroyFunc, callback: (p: ReadyParams) => void): void {
        if (this.ready) {
            callback(this.params);
        } else {
            this.readyCallbacks.push(callback);
        }
        caller.addDestroyFunc(() => {
            // remove the callback if the caller is destroyed so that we don't call it against a destroyed component
            const index = this.readyCallbacks.indexOf(callback);
            if (index >= 0) {
                this.readyCallbacks.splice(index, 1);
            }
        });
    }

    public register<K extends CtrlType, T extends ReadyParams[K]>(ctrlType: K, ctrl: T): void {
        this.params[ctrlType] = ctrl;
        this.updateReady();
        if (this.ready) {
            this.dispatchLocalEvent({ type: 'ready' });
        }

        ctrl.addDestroyFunc(() => {
            // Ensure ready is false when a controller is destroyed
            // We do not clear them as a lot of code still runs during destroy logic which may need access to the controllers
            // NOTE: This is not ideal and we should look to stop logic using controllers during destroy
            this.updateReady();
        });
    }

    public get<K extends CtrlType>(ctrlType: K): ReadyParams[K] {
        return this.params[ctrlType];
    }

    public getGridBodyCtrl(): GridBodyCtrl {
        return this.params.gridBodyCtrl;
    }

    public getHeaderRowContainerCtrl(): HeaderRowContainerCtrl | undefined {
        return this.params.headerRowContainerCtrl;
    }

    public getScrollFeature(): GridBodyScrollFeature {
        return this.getGridBodyCtrl().scrollFeature;
    }
}
