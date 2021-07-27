import { GridCtrl } from "./gridComp/gridCtrl";
import { Bean } from "./context/context";
import { GridBodyCtrl } from "./gridBodyComp/gridBodyCtrl";
import { RowContainerCtrl } from "./gridBodyComp/rowContainer/rowContainerCtrl";
import { HeaderRootComp } from "./headerRendering/headerRootComp";
import { FakeHScrollCtrl } from "./gridBodyComp/fakeHScrollCtrl";
import { BeanStub } from "./context/beanStub";

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

    fakeHScrollCtrl: FakeHScrollCtrl;
    headerRootComp: HeaderRootComp;
}

@Bean('ctrlsService')
export class CtrlsService extends BeanStub {

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

    private fakeHScrollCtrl: FakeHScrollCtrl;

    private headerRootComp: HeaderRootComp;

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

            && this.fakeHScrollCtrl != null
            && this.headerRootComp != null;

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

            fakeHScrollCtrl: this.fakeHScrollCtrl,
            gridBodyCtrl: this.gridBodyCtrl,
            gridCtrl: this.gridCtrl,
            headerRootComp: this.headerRootComp,
        };
    }

    public registerFakeHScrollCtrl(con: FakeHScrollCtrl): void {
        this.fakeHScrollCtrl = con;
        this.checkReady();
    }

    public registerHeaderRootComp(headerRootComp: HeaderRootComp): void {
        this.headerRootComp = headerRootComp;
        this.checkReady();
    }

    public registerCenterRowContainerCtrl(con: RowContainerCtrl): void {
        this.centerRowContainerCtrl = con;
        this.checkReady();
    }

    public registerLeftRowContainerCtrl(con: RowContainerCtrl): void {
        this.leftRowContainerCtrl = con;
        this.checkReady();
    }

    public registerRightRowContainerCtrl(con: RowContainerCtrl): void {
        this.rightRowContainerCtrl = con;
        this.checkReady();
    }

    public registerTopCenterRowContainerCtrl(con: RowContainerCtrl): void {
        this.topCenterRowContainerCtrl = con;
        this.checkReady();
    }

    public registerTopLeftRowContainerCon(con: RowContainerCtrl): void {
        this.topLeftRowContainerCtrl = con;
        this.checkReady();
    }

    public registerTopRightRowContainerCtrl(con: RowContainerCtrl): void {
        this.topRightRowContainerCtrl = con;
        this.checkReady();
    }

    public registerBottomCenterRowContainerCtrl(con: RowContainerCtrl): void {
        this.bottomCenterRowContainerCtrl = con;
        this.checkReady();
    }

    public registerBottomLeftRowContainerCtrl(con: RowContainerCtrl): void {
        this.bottomLeftRowContainerCtrl = con;
        this.checkReady();
    }

    public registerBottomRightRowContainerCtrl(con: RowContainerCtrl): void {
        this.bottomRightRowContainerCtrl = con;
        this.checkReady();
    }

    public registerGridBodyCtrl(con: GridBodyCtrl): void {
        this.gridBodyCtrl = con;
        this.checkReady();
    }

    public registerGridCtrl(con: GridCtrl): void {
        this.gridCtrl = con;
        this.checkReady();
    }

    public getFakeHScrollCtrl(): FakeHScrollCtrl {
        return this.fakeHScrollCtrl;
    }

    public getHeaderRootComp(): HeaderRootComp {
        return this.headerRootComp;
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

    public getGridBodyCtrl(): GridBodyCtrl {
        return this.gridBodyCtrl;
    }
}