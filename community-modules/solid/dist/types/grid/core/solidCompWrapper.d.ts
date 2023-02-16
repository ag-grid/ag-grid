import { WrappableInterface } from "@ag-grid-community/core";
import { PortalManager } from "../agGridSolid";
export default class SolidCompWrapper implements WrappableInterface {
    private eGui?;
    private SolidCompClass;
    private portalManager;
    private portalInfo?;
    private instance;
    constructor(SolidCompClass: any, portalManager: PortalManager);
    init(props: any): void;
    destroy(): void;
    getGui(): HTMLElement;
    hasMethod(name: string): boolean;
    getFrameworkComponentInstance(): any;
    callMethod(name: string, args: IArguments): void;
    addMethod(name: string, callback: Function): void;
}
