import {Injectable, NgZone, ViewContainerRef} from "@angular/core";
import {BaseFrameworkFactory, IFrameworkFactory} from "ag-grid/main";
import {BaseComponentFactory} from "./baseComponentFactory";

@Injectable()
export class Ng2FrameworkFactory implements IFrameworkFactory {
    private _viewContainerRef: ViewContainerRef;
    private _baseFrameworkFactory: IFrameworkFactory = new BaseFrameworkFactory();    // todo - inject this

    constructor(private _componentFactory: BaseComponentFactory, private _ngZone: NgZone) {
    }


    public setViewContainerRef(viewContainerRef: ViewContainerRef): void {
        this._viewContainerRef = viewContainerRef;
    }
}
