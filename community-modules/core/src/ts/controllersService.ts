import { GridCompController } from "./gridComp/gridCompController";
import { Bean } from "./context/context";
import { GridBodyController } from "./gridBodyComp/gridBodyController";

// for all controllers that are singletons, they can register here so other parts
// of the application can access them.

@Bean('controllersService')
export class ControllersService {

    private gridCompController: GridCompController;
    private gridBodyController: GridBodyController;

    // should be using promises maybe instead of this? not sure
    private waitingOnGridBodyCon: ((con: GridBodyController)=>void)[] = [];

    public registerGridCompController(gridCompController: GridCompController): void {
        this.gridCompController = gridCompController;
    }

    public getGridCompController(): GridCompController {
        return this.gridCompController;
    }

    public registerGridBodyController(gridBodyController: GridBodyController): void {
        this.gridBodyController = gridBodyController;
        this.waitingOnGridBodyCon.forEach( c => c(this.gridBodyController) );
        this.waitingOnGridBodyCon.length = 0;
    }

    public getGridBodyController(): GridBodyController {
        return this.gridBodyController;
    }

    public getGridBodyControllerAsync(callback: (con: GridBodyController)=>void ): void {
        if (this.gridBodyController) {
            callback(this.gridBodyController);
        } else {
            this.waitingOnGridBodyCon.push(callback);
        }
    }
}