import { GridCompController } from "./gridComp/gridCompController";
import { Bean } from "./context/context";
import { GridBodyController } from "./gridBodyComp/gridBodyController";
import { RowContainerController } from "./gridBodyComp/rowContainer/rowContainerController";

// for all controllers that are singletons, they can register here so other parts
// of the application can access them.

@Bean('controllersService')
export class ControllersService {

    private gridCompCon: GridCompController;
    private gridBodyCon: GridBodyController;
    private centerRowContainerCon: RowContainerController;

    // should be using promises maybe instead of this? not sure
    private waitingOnGridBodyCon: ((con: GridBodyController)=>void)[] = [];

    public registerCenterRowContainerCon(centerRowContainerCon: RowContainerController): void {
        this.centerRowContainerCon = centerRowContainerCon;
    }

    public registerGridCompController(gridCompController: GridCompController): void {
        this.gridCompCon = gridCompController;
    }

    public getGridCompController(): GridCompController {
        return this.gridCompCon;
    }

    public getCenterRowContainerCon(): RowContainerController {
        return this.centerRowContainerCon;
    }

    public registerGridBodyController(gridBodyController: GridBodyController): void {
        this.gridBodyCon = gridBodyController;
        this.waitingOnGridBodyCon.forEach( c => c(this.gridBodyCon) );
        this.waitingOnGridBodyCon.length = 0;
    }

    public getGridBodyController(): GridBodyController {
        return this.gridBodyCon;
    }

    public getGridBodyControllerAsync(callback: (con: GridBodyController)=>void ): void {
        if (this.gridBodyCon) {
            callback(this.gridBodyCon);
        } else {
            this.waitingOnGridBodyCon.push(callback);
        }
    }
}