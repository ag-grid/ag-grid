import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { FakeHScrollComp } from './gridBodyComp/fakeHScrollComp';
import type { FakeVScrollComp } from './gridBodyComp/fakeVScrollComp';
import type { GridBodyCtrl } from './gridBodyComp/gridBodyCtrl';
import type { RowContainerCtrl } from './gridBodyComp/rowContainer/rowContainerCtrl';
import type { GridCtrl } from './gridComp/gridCtrl';
import type { GridHeaderCtrl } from './headerRendering/gridHeaderCtrl';
import type { HeaderRowContainerCtrl } from './headerRendering/rowContainer/headerRowContainerCtrl';
import type { ColumnPinnedType } from './interfaces/iColumn';

// for all controllers that are singletons, they can register here so other parts
// of the application can access them.

interface ReadyParams {
    gridCtrl: GridCtrl;
    gridBodyCtrl: GridBodyCtrl;

    center: RowContainerCtrl;
    left: RowContainerCtrl;
    right: RowContainerCtrl;

    bottomCenter: RowContainerCtrl;
    bottomLeft: RowContainerCtrl;
    bottomRight: RowContainerCtrl;

    topCenter: RowContainerCtrl;
    topLeft: RowContainerCtrl;
    topRight: RowContainerCtrl;

    stickyTopCenter: RowContainerCtrl;
    stickyTopLeft: RowContainerCtrl;
    stickyTopRight: RowContainerCtrl;

    stickyBottomCenter: RowContainerCtrl;
    stickyBottomLeft: RowContainerCtrl;
    stickyBottomRight: RowContainerCtrl;

    fakeHScrollComp: FakeHScrollComp;
    fakeVScrollComp: FakeVScrollComp;
    gridHeaderCtrl: GridHeaderCtrl;

    centerHeader: HeaderRowContainerCtrl;
    leftHeader: HeaderRowContainerCtrl;
    rightHeader: HeaderRowContainerCtrl;
}

type CtrlType = keyof ReadyParams;

type BeanDestroyFunc = Pick<BeanStub<any>, 'addDestroyFunc'>;

export class CtrlsService extends BeanStub<'ready'> implements NamedBean {
    beanName = 'ctrlsService' as const;

    private params: ReadyParams = {} as ReadyParams;
    private ready = false;
    private readyCallbacks: ((p: ReadyParams) => void)[] = [];

    private localEventsAsync = false;

    public wireBeans(beans: BeanCollection) {
        // React could be running in StrictMode, which results in the ctrlService being ready twice.
        // The first time after the first render cycle, and the second time after the second render cycle which is only done in StrictMode.
        // By making the local events async, we effectively debounce the first ready event until after the second render cycle has completed.
        // This means that the ready logic across the grid will run against the currently rendered components and controllers.
        // TODO: Do we make this async only for React 19?
        this.localEventsAsync = beans.frameworkOverrides.renderingEngine === 'react';
    }

    public postConstruct() {
        this.addEventListener(
            'ready',
            () => {
                if (this.ready) {
                    this.readyCallbacks.forEach((c) => c(this.params));
                    this.readyCallbacks.length = 0;
                }
            },
            this.localEventsAsync
        );
    }
    private checkReady(): void {
        const params = this.params;
        this.ready =
            params.gridCtrl?.isAlive() &&
            params.gridBodyCtrl?.isAlive() &&
            params.center?.isAlive() &&
            params.left?.isAlive() &&
            params.right?.isAlive() &&
            params.bottomCenter?.isAlive() &&
            params.bottomLeft?.isAlive() &&
            params.bottomRight?.isAlive() &&
            params.topCenter?.isAlive() &&
            params.topLeft?.isAlive() &&
            params.topRight?.isAlive() &&
            params.stickyTopCenter?.isAlive() &&
            params.stickyTopLeft?.isAlive() &&
            params.stickyTopRight?.isAlive() &&
            params.stickyBottomCenter?.isAlive() &&
            params.stickyBottomLeft?.isAlive() &&
            params.stickyBottomRight?.isAlive() &&
            params.centerHeader?.isAlive() &&
            params.leftHeader?.isAlive() &&
            params.rightHeader?.isAlive() &&
            params.fakeHScrollComp?.isAlive() &&
            params.fakeVScrollComp?.isAlive() &&
            params.gridHeaderCtrl?.isAlive();

        if (this.ready) {
            this.dispatchLocalEvent({ type: 'ready' });
        }
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
        this.checkReady();

        ctrl.addDestroyFunc(() => {
            // Ensure ready is false when a controller is destroyed
            // We do not clear them as a lot of code still runs during destroy which may need access to the controllers
            // NOTE: This is not ideal and we should look to stop logic using controllers during destroy
            this.checkReady();
        });
    }

    public registerHeaderContainer(ctrl: HeaderRowContainerCtrl, pinned: ColumnPinnedType): void {
        const params = this.params;
        switch (pinned) {
            case 'left':
                params.leftHeader = ctrl;
                break;
            case 'right':
                params.rightHeader = ctrl;
                break;
            default:
                params.centerHeader = ctrl;
                break;
        }
        this.checkReady();
    }

    public get<K extends CtrlType>(ctrlType: K): ReadyParams[K] {
        return this.params[ctrlType];
    }
    public getParams(): Readonly<ReadyParams> {
        return this.params;
    }

    public getGridBodyCtrl(): GridBodyCtrl {
        return this.params.gridBodyCtrl;
    }

    public getHeaderRowContainerCtrls(): HeaderRowContainerCtrl[] {
        const { leftHeader, centerHeader, rightHeader } = this.params;
        return [leftHeader, rightHeader, centerHeader];
    }

    public getHeaderRowContainerCtrl(pinned?: ColumnPinnedType): HeaderRowContainerCtrl | undefined {
        const params = this.params;
        switch (pinned) {
            case 'left':
                return params.leftHeader;
            case 'right':
                return params.rightHeader;
            default:
                return params.centerHeader;
        }
    }
}
