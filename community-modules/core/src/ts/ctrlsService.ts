import { GridCtrl } from "./gridComp/gridCtrl";
import { Bean } from "./context/context";
import { GridBodyCtrl } from "./gridBodyComp/gridBodyCtrl";
import { RowContainerCtrl } from "./gridBodyComp/rowContainer/rowContainerCtrl";
import { FakeHScrollCtrl } from "./gridBodyComp/fakeHScrollCtrl";
import { BeanStub } from "./context/beanStub";
import { GridHeaderCtrl } from "./headerRendering/gridHeaderCtrl";
import { Constants } from "./constants/constants";
import { HeaderRowContainerCtrl } from "./headerRendering/rowContainer/headerRowContainerCtrl";
import { ColumnPinnedType } from "./entities/column";

// for all controllers that are singletons, they can register here so other parts
// of the application can access them.

interface ReadyParams {
    gridCtrl: GridCtrl;
    gridBodyCtrl: GridBodyCtrl;

    centerRowContainerCtrl: RowContainerCtrl;
    leftRowContainerCtrl: RowContainerCtrl;
    rightRowContainerCtrl: RowContainerCtrl;

    bottomCenterRowContainerCtrl: RowContainerCtrl;
    bottomLeftRowContainerCtrl: RowContainerCtrl;
    bottomRightRowContainerCtrl: RowContainerCtrl;

    topCenterRowContainerCtrl: RowContainerCtrl;
    topLeftRowContainerCtrl: RowContainerCtrl;
    topRightRowContainerCtrl: RowContainerCtrl;

    stickyTopCenterRowContainerCtrl: RowContainerCtrl;
    stickyTopLeftRowContainerCtrl: RowContainerCtrl;
    stickyTopRightRowContainerCtrl: RowContainerCtrl;

    fakeHScrollCtrl: FakeHScrollCtrl;
    gridHeaderCtrl: GridHeaderCtrl;

    centerHeaderRowContainerCtrl: HeaderRowContainerCtrl;
    leftHeaderRowContainerCtrl: HeaderRowContainerCtrl;
    rightHeaderRowContainerCtrl: HeaderRowContainerCtrl;
}

@Bean(CtrlsService.NAME)
export class CtrlsService extends BeanStub {

    public static readonly NAME = 'ctrlsService';

    private gridCtrl: GridCtrl;
    private gridBodyCtrl: GridBodyCtrl;

    private centerRowContainerCtrl: RowContainerCtrl;
    private leftRowContainerCtrl: RowContainerCtrl;
    private rightRowContainerCtrl: RowContainerCtrl;

    private bottomCenterRowContainerCtrl: RowContainerCtrl;
    private bottomLeftRowContainerCtrl: RowContainerCtrl;
    private bottomRightRowContainerCtrl: RowContainerCtrl;

    private topCenterRowContainerCtrl: RowContainerCtrl;
    private topLeftRowContainerCtrl: RowContainerCtrl;
    private topRightRowContainerCtrl: RowContainerCtrl;

    private stickyTopCenterRowContainerCtrl: RowContainerCtrl;
    private stickyTopLeftRowContainerCtrl: RowContainerCtrl;
    private stickyTopRightRowContainerCtrl: RowContainerCtrl;

    private centerHeaderRowContainerCtrl: HeaderRowContainerCtrl;
    private leftHeaderRowContainerCtrl: HeaderRowContainerCtrl;
    private rightHeaderRowContainerCtrl: HeaderRowContainerCtrl;

    private fakeHScrollCtrl: FakeHScrollCtrl;

    private gridHeaderCtrl: GridHeaderCtrl;

    private ready = false;
    private readyCallbacks: ((p: ReadyParams) => void)[] = [];

    private checkReady(): void {
        this.ready =
            this.gridCtrl != null
            && this.gridBodyCtrl != null

            && this.centerRowContainerCtrl != null
            && this.leftRowContainerCtrl != null
            && this.rightRowContainerCtrl != null

            && this.bottomCenterRowContainerCtrl != null
            && this.bottomLeftRowContainerCtrl != null
            && this.bottomRightRowContainerCtrl != null

            && this.topCenterRowContainerCtrl != null
            && this.topLeftRowContainerCtrl != null
            && this.topRightRowContainerCtrl != null

            && this.stickyTopCenterRowContainerCtrl != null
            && this.stickyTopLeftRowContainerCtrl != null
            && this.stickyTopRightRowContainerCtrl != null

            && this.centerHeaderRowContainerCtrl != null
            && this.leftHeaderRowContainerCtrl != null
            && this.rightHeaderRowContainerCtrl != null

            && this.fakeHScrollCtrl != null
            && this.gridHeaderCtrl != null;

        if (this.ready) {
            const p = this.createReadyParams();
            this.readyCallbacks.forEach(c => c(p));
            this.readyCallbacks.length = 0;
        }
    }

    public whenReady(callback: (p: ReadyParams) => void): void {
        if (this.ready) {
            callback(this.createReadyParams());
        } else {
            this.readyCallbacks.push(callback);
        }
    }

    private createReadyParams(): ReadyParams {
        return {
            centerRowContainerCtrl: this.centerRowContainerCtrl,
            leftRowContainerCtrl: this.leftRowContainerCtrl,
            rightRowContainerCtrl: this.rightRowContainerCtrl,

            bottomCenterRowContainerCtrl: this.bottomCenterRowContainerCtrl,
            bottomLeftRowContainerCtrl: this.bottomLeftRowContainerCtrl,
            bottomRightRowContainerCtrl: this.bottomRightRowContainerCtrl,

            topCenterRowContainerCtrl: this.topCenterRowContainerCtrl,
            topLeftRowContainerCtrl: this.topLeftRowContainerCtrl,
            topRightRowContainerCtrl: this.topRightRowContainerCtrl,

            stickyTopCenterRowContainerCtrl: this.stickyTopCenterRowContainerCtrl,
            stickyTopLeftRowContainerCtrl: this.stickyTopLeftRowContainerCtrl,
            stickyTopRightRowContainerCtrl: this.stickyTopRightRowContainerCtrl,

            centerHeaderRowContainerCtrl: this.centerHeaderRowContainerCtrl,
            leftHeaderRowContainerCtrl: this.leftHeaderRowContainerCtrl,
            rightHeaderRowContainerCtrl: this.rightHeaderRowContainerCtrl,

            fakeHScrollCtrl: this.fakeHScrollCtrl,
            gridBodyCtrl: this.gridBodyCtrl,
            gridCtrl: this.gridCtrl,
            gridHeaderCtrl: this.gridHeaderCtrl,
        };
    }

    public registerFakeHScrollCtrl(ctrl: FakeHScrollCtrl): void {
        this.fakeHScrollCtrl = ctrl;
        this.checkReady();
    }

    public registerGridHeaderCtrl(gridHeaderCtrl: GridHeaderCtrl): void {
        this.gridHeaderCtrl = gridHeaderCtrl;
        this.checkReady();
    }

    public registerCenterRowContainerCtrl(ctrl: RowContainerCtrl): void {
        this.centerRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerLeftRowContainerCtrl(ctrl: RowContainerCtrl): void {
        this.leftRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerRightRowContainerCtrl(ctrl: RowContainerCtrl): void {
        this.rightRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerTopCenterRowContainerCtrl(ctrl: RowContainerCtrl): void {
        this.topCenterRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerTopLeftRowContainerCon(ctrl: RowContainerCtrl): void {
        this.topLeftRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerTopRightRowContainerCtrl(ctrl: RowContainerCtrl): void {
        this.topRightRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerStickyTopCenterRowContainerCtrl(ctrl: RowContainerCtrl): void {
        this.stickyTopCenterRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerStickyTopLeftRowContainerCon(ctrl: RowContainerCtrl): void {
        this.stickyTopLeftRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerStickyTopRightRowContainerCtrl(ctrl: RowContainerCtrl): void {
        this.stickyTopRightRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerBottomCenterRowContainerCtrl(ctrl: RowContainerCtrl): void {
        this.bottomCenterRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerBottomLeftRowContainerCtrl(ctrl: RowContainerCtrl): void {
        this.bottomLeftRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerBottomRightRowContainerCtrl(ctrl: RowContainerCtrl): void {
        this.bottomRightRowContainerCtrl = ctrl;
        this.checkReady();
    }

    public registerHeaderContainer(ctrl: HeaderRowContainerCtrl, pinned: ColumnPinnedType): void {
        switch (pinned) {
            case Constants.PINNED_LEFT:
                this.leftHeaderRowContainerCtrl = ctrl;
                break;
            case Constants.PINNED_RIGHT:
                this.rightHeaderRowContainerCtrl = ctrl;
                break;
            default: this.centerHeaderRowContainerCtrl = ctrl;
                break;
        }
        this.checkReady();
    }

    public registerGridBodyCtrl(ctrl: GridBodyCtrl): void {
        this.gridBodyCtrl = ctrl;
        this.checkReady();
    }

    public registerGridCtrl(ctrl: GridCtrl): void {
        this.gridCtrl = ctrl;
        this.checkReady();
    }

    public getFakeHScrollCtrl(): FakeHScrollCtrl {
        return this.fakeHScrollCtrl;
    }

    public getGridHeaderCtrl(): GridHeaderCtrl {
        return this.gridHeaderCtrl;
    }

    public getGridCtrl(): GridCtrl {
        return this.gridCtrl;
    }

    public getCenterRowContainerCtrl(): RowContainerCtrl {
        return this.centerRowContainerCtrl;
    }

    public getTopCenterRowContainerCtrl(): RowContainerCtrl {
        return this.topCenterRowContainerCtrl;
    }

    public getBottomCenterRowContainerCtrl(): RowContainerCtrl {
        return this.bottomCenterRowContainerCtrl;
    }

    public getStickyTopCenterRowContainerCtrl(): RowContainerCtrl {
        return this.stickyTopCenterRowContainerCtrl;
    }

    public getGridBodyCtrl(): GridBodyCtrl {
        return this.gridBodyCtrl;
    }

    public getHeaderRowContainerCtrls(): HeaderRowContainerCtrl[] {
        return [this.leftHeaderRowContainerCtrl, this.rightHeaderRowContainerCtrl, this.centerHeaderRowContainerCtrl];
    }

    public getHeaderRowContainerCtrl(pinned?: ColumnPinnedType): HeaderRowContainerCtrl {
        switch (pinned) {
            case Constants.PINNED_LEFT: return this.leftHeaderRowContainerCtrl;
            case Constants.PINNED_RIGHT: return this.rightHeaderRowContainerCtrl;
            default: return this.centerHeaderRowContainerCtrl;
        }
    }
}