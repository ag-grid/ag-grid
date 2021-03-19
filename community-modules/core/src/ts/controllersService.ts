import { GridCompController } from "./gridComp/gridCompController";
import { Bean } from "./context/context";

// for all controllers that are singletons, they can register here so other parts
// of the application can access them.

@Bean('controllersService')
export class ControllersService {

    private gridCompController: GridCompController;

    public registerGridCompController(gridCompController: GridCompController): void {
        this.gridCompController = gridCompController;
    }

    public getGridCompController(): GridCompController {
        return this.gridCompController;
    }
}