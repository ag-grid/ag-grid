import { BaseComponentWrapper, FrameworkComponentWrapper, WrappableInterface } from "ag-grid-community";
import { PortalManager } from "../agGridSolid";
export default class SolidCompWrapperFactory extends BaseComponentWrapper<WrappableInterface> implements FrameworkComponentWrapper {
    private portalManager;
    constructor(portalManager: PortalManager);
    createWrapper(SolidComponentClass: any): WrappableInterface;
}
