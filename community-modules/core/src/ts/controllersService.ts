import { GridCompController } from "./gridComp/gridCompController";
import { Bean } from "./context/context";
import { GridBodyController } from "./gridBodyComp/gridBodyController";
import { RowContainerController } from "./gridBodyComp/rowContainer/rowContainerController";
import { HeaderRootComp } from "./headerRendering/headerRootComp";
import { FakeHorizontalScrollController } from "./gridBodyComp/fakeHorizontalScrollController";
import { BeanStub } from "./context/beanStub";
import { Events } from "./eventKeys";

// for all controllers that are singletons, they can register here so other parts
// of the application can access them.

interface ReadyParams {
    gridCompCon: GridCompController;
    gridBodyCon: GridBodyController;

    centerRowContainerCon: RowContainerController;
    leftRowContainerCon: RowContainerController;
    rightRowContainerCon: RowContainerController;

    bottomCenterRowContainerCon: RowContainerController;
    bottomLeftRowContainerCon: RowContainerController;
    bottomRightRowContainerCon: RowContainerController;

    topCenterRowContainerCon: RowContainerController;
    topLeftRowContainerCon: RowContainerController;
    topRightRowContainerCon: RowContainerController;

    fakeHScrollCon: FakeHorizontalScrollController;
    headerRootComp: HeaderRootComp;
}

@Bean('controllersService')
export class ControllersService extends BeanStub {

    private gridCompCon: GridCompController;
    private gridBodyCon: GridBodyController;

    private centerRowContainerCon: RowContainerController;
    private leftRowContainerCon: RowContainerController;
    private rightRowContainerCon: RowContainerController;

    private bottomCenterRowContainerCon: RowContainerController;
    private bottomLeftRowContainerCon: RowContainerController;
    private bottomRightRowContainerCon: RowContainerController;

    private topCenterRowContainerCon: RowContainerController;
    private topLeftRowContainerCon: RowContainerController;
    private topRightRowContainerCon: RowContainerController;

    private fakeHScrollCon: FakeHorizontalScrollController;

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

    public registerFakeHScrollCon(con: FakeHorizontalScrollController): void {
        this.fakeHScrollCon = con;
        this.checkReady();
    }

    public registerHeaderRootComp(headerRootComp: HeaderRootComp): void {
        this.headerRootComp = headerRootComp;
        this.checkReady();
    }

    public registerCenterRowContainerCon(con: RowContainerController): void {
        this.centerRowContainerCon = con;
        this.checkReady();
    }

    public registerLeftRowContainerCon(con: RowContainerController): void {
        this.leftRowContainerCon = con;
        this.checkReady();
    }

    public registerRightRowContainerCon(con: RowContainerController): void {
        this.rightRowContainerCon = con;
        this.checkReady();
    }

    public registerTopCenterRowContainerCon(con: RowContainerController): void {
        this.topCenterRowContainerCon = con;
        this.checkReady();
    }

    public registerTopLeftRowContainerCon(con: RowContainerController): void {
        this.topLeftRowContainerCon = con;
        this.checkReady();
    }

    public registerTopRightRowContainerCon(con: RowContainerController): void {
        this.topRightRowContainerCon = con;
        this.checkReady();
    }

    public registerBottomCenterRowContainerCon(con: RowContainerController): void {
        this.bottomCenterRowContainerCon = con;
        this.checkReady();
    }

    public registerBottomLeftRowContainerCon(con: RowContainerController): void {
        this.bottomLeftRowContainerCon = con;
        this.checkReady();
    }

    public registerBottomRightRowContainerCon(con: RowContainerController): void {
        this.bottomRightRowContainerCon = con;
        this.checkReady();
    }

    public registerGridBodyController(con: GridBodyController): void {
        this.gridBodyCon = con;
        this.checkReady();
    }

    public registerGridCompController(con: GridCompController): void {
        this.gridCompCon = con;
        this.checkReady();
    }

    public getFakeHScrollCon(): FakeHorizontalScrollController {
        return this.fakeHScrollCon;
    }

    public getHeaderRootComp(): HeaderRootComp {
        return this.headerRootComp;
    }

    public getGridCompController(): GridCompController {
        return this.gridCompCon;
    }

    public getCenterRowContainerCon(): RowContainerController {
        return this.centerRowContainerCon;
    }

    public getTopCenterRowContainerCon(): RowContainerController {
        return this.topCenterRowContainerCon;
    }

    public getBottomCenterRowContainerCon(): RowContainerController {
        return this.bottomCenterRowContainerCon;
    }

    public getGridBodyController(): GridBodyController {
        return this.gridBodyCon;
    }
}