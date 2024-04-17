import { GridCtrl } from "./gridComp/gridCtrl";
import { Bean } from "./context/context";
import { GridBodyCtrl } from "./gridBodyComp/gridBodyCtrl";
import { RowContainerCtrl } from "./gridBodyComp/rowContainer/rowContainerCtrl";
import { BeanStub } from "./context/beanStub";
import { GridHeaderCtrl } from "./headerRendering/gridHeaderCtrl";
import { HeaderRowContainerCtrl } from "./headerRendering/rowContainer/headerRowContainerCtrl";
import { ColumnPinnedType } from "./entities/column";
import { FakeHScrollComp } from "./gridBodyComp/fakeHScrollComp";
import { FakeVScrollComp } from "./gridBodyComp/fakeVScrollComp";

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

    fakeHScrollComp: FakeHScrollComp;
    fakeVScrollComp: FakeVScrollComp;
    gridHeaderCtrl: GridHeaderCtrl;

    centerHeader: HeaderRowContainerCtrl;
    leftHeader: HeaderRowContainerCtrl;
    rightHeader: HeaderRowContainerCtrl;
}

type CtrlType = keyof ReadyParams;

@Bean(CtrlsService.NAME)
export class CtrlsService extends BeanStub {

    public static readonly NAME = 'ctrlsService';

    private params: ReadyParams = {} as ReadyParams;
    private ready = false;
    private readyCallbacks: ((p: ReadyParams) => void)[] = [];

    private checkReady(): void {
        const params = this.params;
        this.ready =
            params.gridCtrl != null
            && params.gridBodyCtrl != null

            && params.center != null
            && params.left != null
            && params.right != null

            && params.bottomCenter != null
            && params.bottomLeft != null
            && params.bottomRight != null

            && params.topCenter != null
            && params.topLeft != null
            && params.topRight != null

            && params.stickyTopCenter != null
            && params.stickyTopLeft != null
            && params.stickyTopRight != null

            && params.centerHeader != null
            && params.leftHeader != null
            && params.rightHeader != null

            && params.fakeHScrollComp != null
            && params.fakeVScrollComp != null
            && params.gridHeaderCtrl != null;

        if (this.ready) {
            this.readyCallbacks.forEach(c => c(params));
            this.readyCallbacks.length = 0;
        }
    }

    public whenReady(callback: (p: ReadyParams) => void): void {
        if (this.ready) {
            callback(this.params);
        } else {
            this.readyCallbacks.push(callback);
        }
    }

    public register<K extends CtrlType, T extends ReadyParams[K]>(ctrlType: K, ctrl: T): void {
        this.params[ctrlType] = ctrl;
        this.checkReady();
    }

    public registerHeaderContainer(ctrl: HeaderRowContainerCtrl, pinned: ColumnPinnedType): void {
        switch (pinned) {
            case 'left':
                this.params.leftHeader = ctrl;
                break;
            case 'right':
                this.params.rightHeader = ctrl;
                break;
            default: this.params.centerHeader = ctrl;
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
        return [this.params.leftHeader, this.params.rightHeader, this.params.centerHeader];
    }

    public getHeaderRowContainerCtrl(pinned?: ColumnPinnedType): HeaderRowContainerCtrl {
        switch (pinned) {
            case 'left': return this.params.leftHeader;
            case 'right': return this.params.rightHeader;
            default: return this.params.centerHeader;
        }
    }
}