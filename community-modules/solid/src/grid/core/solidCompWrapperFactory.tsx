import { BaseComponentWrapper, FrameworkComponentWrapper, WrappableInterface } from "@ag-grid-community/core";
import { PortalManager } from "../agGridSolid";
import SolidCompWrapper from "./solidCompWrapper";

export default class SolidCompWrapperFactory extends BaseComponentWrapper<WrappableInterface> implements FrameworkComponentWrapper {

    private portalManager: PortalManager;

    constructor(portalManager: PortalManager) {
        super();
        this.portalManager = portalManager;
    }

    createWrapper(SolidComponentClass: any): WrappableInterface {
        return new SolidCompWrapper(SolidComponentClass, this.portalManager);
    }
}
