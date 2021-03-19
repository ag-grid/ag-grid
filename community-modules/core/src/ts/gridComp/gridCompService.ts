import { BeanStub } from "../context/beanStub";
import { GridCompController } from "./gridCompController";
import { Bean } from "../context/context";

@Bean('gridCompService')
export class GridCompService extends BeanStub {

    private controller: GridCompController;

    public registerGridCompController(controller: GridCompController): void {
        this.controller = controller;
    }

    public getGridCompController(): GridCompController {
        return this.controller;
    }
}