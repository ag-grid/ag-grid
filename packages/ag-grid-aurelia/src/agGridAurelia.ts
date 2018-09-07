import {
    autoinject,
    bindable,
    child,
    children,
    ComponentAttached,
    ComponentDetached,
    Container,
    customElement,
    inlineView,
    TaskQueue,
    ViewResources
} from "aurelia-framework";
import {ColumnApi, ComponentUtil, Grid, GridApi, GridOptions, GridParams} from "ag-grid-community";
import {AureliaFrameworkFactory} from "./aureliaFrameworkFactory";
import {AgGridColumn} from "./agGridColumn";
import {generateBindables} from "./agUtils";
import {AgDateTemplate, AgFullWidthRowTemplate} from './agTemplate';
import {AureliaFrameworkComponentWrapper} from "./aureliaFrameworkComponentWrapper";

interface IPropertyChanges {
    [key: string]: any
}

@customElement('ag-grid-aurelia')
@generateBindables(ComponentUtil.ALL_PROPERTIES.filter((property) => property !== 'gridOptions'))
@generateBindables(ComponentUtil.EVENTS)
// <slot> is required for @children to work.  https://github.com/aurelia/templating/issues/451#issuecomment-254206622
@inlineView(`<template><slot></slot></template>`)
@autoinject()
export class AgGridAurelia implements ComponentAttached, ComponentDetached {
    // not intended for user to interact with. so putting _ in so if user gets reference
    // to this object, they kind'a know it's not part of the agreed interface
    private _nativeElement: any;
    private _initialised = false;
    private _destroyed = false;

    @bindable() public gridOptions: GridOptions;
    @bindable() public context: any;

    private gridParams: GridParams;

    // making these public, so they are accessible to people using the aurelia component references
    public api: GridApi;
    public columnApi: ColumnApi;

    @children('ag-grid-column')
    public columns: AgGridColumn[] = [];

    @child('ag-full-width-row-template')
    public fullWidthRowTemplate: AgFullWidthRowTemplate;

    @child('ag-date-template')
    public dateTemplate: AgDateTemplate;

    constructor(element: Element,
                private taskQueue: TaskQueue,
                private auFrameworkFactory: AureliaFrameworkFactory,
                private container: Container,
                private viewResources: ViewResources,
                private aureliaFrameworkComponentWrapper: AureliaFrameworkComponentWrapper) {
        this._nativeElement = element;
        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        ComponentUtil.EVENTS.forEach((eventName) => {
            //create an empty event
            (<any>this)[eventName] = () => {
            };
        });
    }

    attached() {
        // initialize the grid in the queue
        // because of bug in @children
        // https://github.com/aurelia/templating/issues/403
        this.taskQueue.queueTask(this.initGrid.bind(this));
    }

    initGrid(): void {
        this._initialised = false;
        this._destroyed = false;

        this.auFrameworkFactory.setContainer(this.container);
        this.auFrameworkFactory.setViewResources(this.viewResources);

        this.aureliaFrameworkComponentWrapper.setContainer(this.container);
        this.aureliaFrameworkComponentWrapper.setViewResources(this.viewResources);

        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.gridParams = <any>{
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: this.auFrameworkFactory,
            seedBeanInstances: {
                frameworkComponentWrapper: this.aureliaFrameworkComponentWrapper
            }
        };

        if (this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map((column: AgGridColumn) => {
                    return column.toColDef();
                });
        }

        if (this.fullWidthRowTemplate) {
            this.gridOptions.fullWidthCellRendererFramework =
                {template: this.fullWidthRowTemplate.template};
        }

        if (this.dateTemplate) {
            this.gridOptions.dateComponentFramework =
                {template: this.dateTemplate.template};
        }

        new Grid(this._nativeElement, this.gridOptions, this.gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;

        this._initialised = true;
    }

    /**
     * Called by Aurelia whenever a bound property changes
     */
    propertyChanged(propertyName: string, newValue: any, oldValue: any) {
        // emulate an Angular2 SimpleChanges Object
        let changes: IPropertyChanges = {};
        changes[propertyName] = <any>{currentValue: newValue, previousValue: oldValue};

        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    }

    public detached(): void {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            this.api.destroy();
        }
    }

    private globalEventListener(eventType: string, event: any): void {
        // if we are tearing down, don't emit events
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        let emitter = (<any>this)[eventType];
        if (emitter) {
            emitter(event);
        } else {
            console.log('ag-Grid-aurelia: could not find EventEmitter: ' + eventType);
        }
    }
}
