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
    gridCompCon: GridCtrl;
    gridBodyCon: GridBodyCtrl;

    centerRowContainerCon: RowContainerCtrl;
    leftRowContainerCon: RowContainerCtrl;
    rightRowContainerCon: RowContainerCtrl;

    bottomCenterRowContainerCon: RowContainerCtrl;
    bottomLeftRowContainerCon: RowContainerCtrl;
    bottomRightRowContainerCon: RowContainerCtrl;

    topCenterRowContainerCon: RowContainerCtrl;
    topLeftRowContainerCon: RowContainerCtrl;
    topRightRowContainerCon: RowContainerCtrl;

    fakeHScrollCon: FakeHScrollCtrl;
    headerRootComp: HeaderRootComp;
}

@Bean('controllersService')
export class ControllersService extends BeanStub {

    private gridCompCon: GridCtrl;
    private gridBodyCon: GridBodyCtrl;

    private centerRowContainerCon: RowContainerCtrl;
    private leftRowContainerCon: RowContainerCtrl;
    private rightRowContainerCon: RowContainerCtrl;

    private bottomCenterRowContainerCon: RowContainerCtrl;
    private bottomLeftRowContainerCon: RowContainerCtrl;
    private bottomRightRowContainerCon: RowContainerCtrl;

    private topCenterRowContainerCon: RowContainerCtrl;
    private topLeftRowContainerCon: RowContainerCtrl;
    private topRightRowContainerCon: RowContainerCtrl;

    private fakeHScrollCon: FakeHScrollCtrl;

    private headerRootComp: HeaderRootComp;

    private ready = false;
    private readyCallbacks: ((p: ReadyParams) => void)[] = [];

    private checkReady(): void {
        this.ready =
            this.gridCompCon != null
            && this.gridBodyCon != null

            && this.centerRowContainerCon != null
            && this.leftRowContainerCon != null
            && this.rightRowContainerCon != null

            && this.bottomCenterRowContainerCon != null
            && this.bottomLeftRowContainerCon != null
            && this.bottomRightRowContainerCon != null

            && this.topCenterRowContainerCon != null
            && this.topLeftRowContainerCon != null
            && this.topRightRowContainerCon != null

            && this.fakeHScrollCon != null
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
            centerRowContainerCon: this.centerRowContainerCon,
            leftRowContainerCon: this.leftRowContainerCon,
            rightRowContainerCon: this.rightRowContainerCon,

            bottomCenterRowContainerCon: this.bottomCenterRowContainerCon,
            bottomLeftRowContainerCon: this.bottomLeftRowContainerCon,
            bottomRightRowContainerCon: this.bottomRightRowContainerCon,

            topCenterRowContainerCon: this.topCenterRowContainerCon,
            topLeftRowContainerCon: this.topLeftRowContainerCon,
            topRightRowContainerCon: this.topRightRowContainerCon,

            fakeHScrollCon: this.fakeHScrollCon,
            gridBodyCon: this.gridBodyCon,
            gridCompCon: this.gridCompCon,
            headerRootComp: this.headerRootComp,
        };
    }

    public registerFakeHScrollCon(con: FakeHScrollCtrl): void {
        this.fakeHScrollCon = con;
        this.checkReady();
    }

    public registerHeaderRootComp(headerRootComp: HeaderRootComp): void {
        this.headerRootComp = headerRootComp;
        this.checkReady();
    }

    public registerCenterRowContainerCon(con: RowContainerCtrl): void {
        this.centerRowContainerCon = con;
        this.checkReady();
    }

    public registerLeftRowContainerCon(con: RowContainerCtrl): void {
        this.leftRowContainerCon = con;
        this.checkReady();
    }

    public registerRightRowContainerCon(con: RowContainerCtrl): void {
        this.rightRowContainerCon = con;
        this.checkReady();
    }

    public registerTopCenterRowContainerCon(con: RowContainerCtrl): void {
        this.topCenterRowContainerCon = con;
        this.checkReady();
    }

    public registerTopLeftRowContainerCon(con: RowContainerCtrl): void {
        this.topLeftRowContainerCon = con;
        this.checkReady();
    }

    public registerTopRightRowContainerCon(con: RowContainerCtrl): void {
        this.topRightRowContainerCon = con;
        this.checkReady();
    }

    public registerBottomCenterRowContainerCon(con: RowContainerCtrl): void {
        this.bottomCenterRowContainerCon = con;
        this.checkReady();
    }

    public registerBottomLeftRowContainerCon(con: RowContainerCtrl): void {
        this.bottomLeftRowContainerCon = con;
        this.checkReady();
    }

    public registerBottomRightRowContainerCon(con: RowContainerCtrl): void {
        this.bottomRightRowContainerCon = con;
        this.checkReady();
    }

    public registerGridBodyController(con: GridBodyCtrl): void {
        this.gridBodyCon = con;
        this.checkReady();
    }

    public registerGridCompController(con: GridCtrl): void {
        this.gridCompCon = con;
        this.checkReady();
    }

    public getFakeHScrollCon(): FakeHScrollCtrl {
        return this.fakeHScrollCon;
    }

    public getHeaderRootComp(): HeaderRootComp {
        return this.headerRootComp;
    }

    public getGridCompController(): GridCtrl {
        return this.gridCompCon;
    }

    public getCenterRowContainerCon(): RowContainerCtrl {
        return this.centerRowContainerCon;
    }

    public getTopCenterRowContainerCon(): RowContainerCtrl {
        return this.topCenterRowContainerCon;
    }

    public getBottomCenterRowContainerCon(): RowContainerCtrl {
        return this.bottomCenterRowContainerCon;
    }

    public getGridBodyController(): GridBodyCtrl {
        return this.gridBodyCon;
    }
}