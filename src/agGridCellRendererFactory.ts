import { Component, Input, ComponentFactory, ViewContainerRef, ComponentResolver, ComponentRef, Type, ReflectiveInjector, Injectable } from '@angular/core';
import { ICellRenderer } from 'ag-grid/main';

@Injectable()
export class AgGridCellRendererFactory {
    constructor(private _viewContainerRef:ViewContainerRef, private _componentResolver:ComponentResolver) {
    }

    public createCellRendererFromComponent<T extends Object>(componentType:{ new(...args:any[]): T; },
                                                             initializer?:(instance:T, params?:any) => void):Type {
        return AgGridCellRendererFactory.createCellRendererFromComponent<T>(componentType, this._viewContainerRef, this._componentResolver, initializer);
    }

    private static createCellRendererFromComponent<T extends Object>(componentType:{ new(...args:any[]): T; },
                                                                     viewContainerRef:ViewContainerRef,
                                                                     componentResolver:ComponentResolver,
                                                                     initializer?:(instance:T, params?:any) => void):Type {
        class CellRenderer implements ICellRenderer {
            private _params:any;
            private _componentRef:ComponentRef<T>;

            init(params:any):void {
                this._params = params;
            }

            getGui():HTMLElement {
                let div = document.createElement('div');
                AgGridCellRendererFactory.createComponent(componentType, viewContainerRef, componentResolver).then(cr => {
                    this._componentRef = cr;
                    if (initializer) {
                        initializer(cr.instance, this._params);
                    }

                    div.appendChild(cr.location.nativeElement);
                });
                return div;
            }

            destroy():void {
                if (this._componentRef) {
                    this._componentRef.destroy();
                }
            }

            refresh(params:any):void {
            }
        }

        return CellRenderer;
    }

    static createComponent<T extends Object>(componentType:{ new(...args:any[]): T; },
                                             viewContainerRef:ViewContainerRef,
                                             componentResolver:ComponentResolver):Promise<ComponentRef<T>> {
        return new Promise<ComponentRef<T>>((resolve) => {
            componentResolver.resolveComponent(componentType).then(
                (factory:ComponentFactory<any>) => {
                    //let injector = ReflectiveInjector.fromResolvedProviders([], viewContainerRef.parentInjector); // original by neal
                    //let injector = ReflectiveInjector.fromResolvedProviders([], viewContainerRef.injector);
                    let injector = viewContainerRef.injector;
                    let componentRef:ComponentRef<T> = viewContainerRef.createComponent(factory, undefined, injector, []);
                    resolve(componentRef);
                });
        });
    }
}