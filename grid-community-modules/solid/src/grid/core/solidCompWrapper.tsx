import { WrappableInterface } from "@ag-grid-community/core";
import { PortalInfo, PortalManager } from "../agGridSolid";

export default class SolidCompWrapper implements WrappableInterface {

    private eGui?: HTMLElement;
    private SolidCompClass: any;

    private portalManager: PortalManager;
    private portalInfo?: PortalInfo;

    private instance: any;

    constructor(SolidCompClass: any, portalManager: PortalManager) {
        this.SolidCompClass = SolidCompClass;        
        this.portalManager = portalManager;
    }

    public init(props: any): void {
        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-solid-container';
        this.portalInfo = {
            mount: this.eGui,
            SolidClass: this.SolidCompClass,
            props,
            ref: instance => {
                this.instance = instance;
            }
        };
        this.portalManager.addPortal(this.portalInfo);
    }

    public destroy(): void {
        this.portalInfo && this.portalManager.removePortal(this.portalInfo);
    }

    public getGui(): HTMLElement {
        return this.eGui!;
    }

    public hasMethod(name: string): boolean {
        return this.instance[name] != null;
    }

    public getFrameworkComponentInstance(): any {
        return this.instance;
    }

    public callMethod(name: string, args: IArguments): void {
        return this.instance[name].apply(this.instance, args);
    }

    public addMethod(name: string, callback: Function): void {
        (this as any)[name] = callback;
    }

}
