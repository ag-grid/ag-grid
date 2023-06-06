import { BaseComponentWrapper } from "@ag-grid-community/core";
import SolidCompWrapper from "./solidCompWrapper";
export default class SolidCompWrapperFactory extends BaseComponentWrapper {
    portalManager;
    constructor(portalManager) {
        super();
        this.portalManager = portalManager;
    }
    createWrapper(SolidComponentClass) {
        return new SolidCompWrapper(SolidComponentClass, this.portalManager);
    }
}
