import {Component, EventEmitter, ViewEncapsulation, ViewContainerRef, ElementRef} from '@angular/core';

import {Grid, GridOptions, GridApi, ColumnApi, ComponentUtil} from 'ag-grid/main';
import {GridParams} from "ag-grid/main";

import {AgComponentFactory} from "./agComponentFactory";
import {Ng2FrameworkFactory} from "./ng2FrameworkFactory";

@Component({
    selector: 'ag-grid-ng2',
    outputs: ComponentUtil.EVENTS,
    inputs: ComponentUtil.ALL_PROPERTIES.concat(['gridOptions']),
    template: '',
    // tell angular we don't want view encapsulation, we don't want a shadow root
    encapsulation: ViewEncapsulation.None
})
export class AgGridNg2 {

    // not intended for user to interact with. so putting _ in so if user gets reference
    // to this object, they kind'a know it's not part of the agreed interface
    private _nativeElement:any;
    private _initialised = false;
    private _destroyed = false;

    private gridOptions:GridOptions;
    private gridParams:GridParams;

    // making these public, so they are accessible to people using the ng2 component references
    public api:GridApi;
    public columnApi:ColumnApi;

    constructor(elementDef:ElementRef,
                private viewContainerRef:ViewContainerRef,
                private ng2FrameworkFactory:Ng2FrameworkFactory) {
        this._nativeElement = elementDef.nativeElement;

        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        ComponentUtil.EVENTS.forEach((eventName) => {
            (<any>this)[eventName] = new EventEmitter();
        });

        this.ng2FrameworkFactory.setViewContainerRef(this.viewContainerRef);
    }

    // this gets called after the directive is initialised
    public ngOnInit():void {
        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: this.ng2FrameworkFactory
        };

        new Grid(this._nativeElement, this.gridOptions, this.gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;

        this._initialised = true;
    }

    public ngOnChanges(changes:any):void {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    }

    public ngOnDestroy():void {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            this.api.destroy();
        }
    }

    private globalEventListener(eventType:string, event:any):void {
        // if we are tearing down, don't emit angular 2 events, as this causes
        // problems with the angular 2 router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        var emitter = <EventEmitter<any>> (<any>this)[eventType];
        if (emitter) {
            emitter.emit(event);
        } else {
            console.log('ag-Grid-ng2: could not find EventEmitter: ' + eventType);
        }
    }
}
