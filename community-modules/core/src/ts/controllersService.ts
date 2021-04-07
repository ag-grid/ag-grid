import { GridCompController } from "./gridComp/gridCompController";
import { Bean } from "./context/context";
import { GridBodyController } from "./gridBodyComp/gridBodyController";

// for all controllers that are singletons, they can register here so other parts
// of the application can access them.

@Bean('controllersService')
export class ControllersService {

    private gridCompController: GridCompController;
    private gridBodyController: GridBodyController;

    public registerGridCompController(gridCompController: GridCompController): void {
        this.gridCompController = gridCompController;
    }

    public getGridCompController(): GridCompController {
        return this.gridCompController;
    }

    public registerGridBodyController(gridBodyController: GridBodyController): void {
        this.gridBodyController = gridBodyController;
    }

    public getGridBodyController(): GridBodyController {
        return this.gridBodyController;
    }
}