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
    bottomCenterRowContainerCon: RowContainerController;
    topCenterRowContainerCon: RowContainerController;
    fakeHScrollCon: FakeHorizontalScrollController;
    headerRootComp: HeaderRootComp;
}

@Bean('controllersService')
export class ControllersService extends BeanStub {

    private gridCompCon: GridCompController;
    private gridBodyCon: GridBodyController;

    private centerRowContainerCon: RowContainerController;
    private bottomCenterRowContainerCon: RowContainerController;
    private topCenterRowContainerCon: RowContainerController;

    private fakeHScrollCon: FakeHorizontalScrollController;

    private headerRootComp: HeaderRootComp;

    private ready = false;
    private readyCallbacks: ((p: ReadyParams)=>void)[] = [];

    private checkReady(): void {
        this.ready =
            this.gridCompCon != null
            && this.gridBodyCon != null
            && this.centerRowContainerCon != null
            && this.bottomCenterRowContainerCon != null
            && this.topCenterRowContainerCon != null
            && this.fakeHScrollCon != null
            && this.headerRootComp != null;

        if (this.ready) {
            const p: ReadyParams = {
                bottomCenterRowContainerCon: this.bottomCenterRowContainerCon,
                centerRowContainerCon: this.centerRowContainerCon,
                fakeHScrollCon: this.fakeHScrollCon,
                gridBodyCon: this.gridBodyCon,
                gridCompCon: this.gridCompCon,
                headerRootComp: this.headerRootComp,
                topCenterRowContainerCon: this.topCenterRowContainerCon
            };
            this.readyCallbacks.forEach( c => c(p) );
            this.readyCallbacks.length = 0;
        }
    }

    public whenReady(callback: (p: ReadyParams)=>void): void {
        if (this.ready) {
            callback(this.createParams());
        } else {
            this.readyCallbacks.push(callback);
        }
    }

    private createParams(): ReadyParams {
        return {
            bottomCenterRowContainerCon: this.bottomCenterRowContainerCon,
            centerRowContainerCon: this.centerRowContainerCon,
            fakeHScrollCon: this.fakeHScrollCon,
            gridBodyCon: this.gridBodyCon,
            gridCompCon: this.gridCompCon,
            headerRootComp: this.headerRootComp,
            topCenterRowContainerCon: this.topCenterRowContainerCon
        };
    }

    public registerFakeHScrollCon(fakeHScrollCon: FakeHorizontalScrollController): void {
        this.fakeHScrollCon = fakeHScrollCon;
        this.checkReady();
    }

    public registerHeaderRootComp(headerRootComp: HeaderRootComp): void {
        this.headerRootComp = headerRootComp;
        this.checkReady();
    }

    public registerCenterRowContainerCon(centerRowContainerCon: RowContainerController): void {
        this.centerRowContainerCon = centerRowContainerCon;
        this.checkReady();
    }

    public registerTopCenterRowContainerCon(topCenterRowContainerCon: RowContainerController): void {
        this.topCenterRowContainerCon = topCenterRowContainerCon;
        this.checkReady();
    }

    public registerBottomCenterRowContainerCon(bottomCenterRowContainerCon: RowContainerController): void {
        this.bottomCenterRowContainerCon = bottomCenterRowContainerCon;
        this.checkReady();
    }
    public registerGridBodyController(gridBodyController: GridBodyController): void {
        this.gridBodyCon = gridBodyController;
        this.checkReady();
    }

    public registerGridCompController(gridCompController: GridCompController): void {
        this.gridCompCon = gridCompController;
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