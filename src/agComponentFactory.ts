import { Component, ComponentFactory, ViewContainerRef, ComponentResolver, ComponentRef, Type, Injectable } from '@angular/core';
import { ICellRenderer } from 'ag-grid/main';

@Injectable()
export class AgComponentFactory {

    constructor(private _viewContainerRef:ViewContainerRef, private _componentResolver:ComponentResolver) {
    }

    public createCellRendererFromComponent<T extends Object>(componentType:{ new(...args:any[]): T; }): {new(): ICellRenderer} {
        return createCellRendererFromComponent<T>(componentType, this._viewContainerRef, this._componentResolver, (instance:any, params?:any) => {
            if (instance.agInit) {
                instance.agInit(params);
            }
        });
    }

    public createCellRendererFromTemplate(template:string): {new(): ICellRenderer} {
        return createCellRendererFromTemplate(this._viewContainerRef, this._componentResolver, template);
    }

}

function createComponent<T extends Object>(componentType:{ new(...args:any[]): T; },
                                           viewContainerRef:ViewContainerRef,
                                           componentResolver:ComponentResolver):Promise<ComponentRef<T>> {
    return new Promise<ComponentRef<T>>((resolve) => {
        componentResolver.resolveComponent(componentType).then(
            (factory:ComponentFactory<any>) => {
                let injector = viewContainerRef.parentInjector;
                let componentRef:ComponentRef<T> = viewContainerRef.createComponent(factory, undefined, injector, []);
                resolve(componentRef);
            });
    });
}

function createCellRendererFromComponent<T extends Object>(componentType:{ new(...args:any[]): T; },
                                                           viewContainerRef:ViewContainerRef,
                                                           componentResolver:ComponentResolver,
                                                           initializer?:(instance:T, params?:any) => void): {new(): ICellRenderer} {
    class CellRenderer implements ICellRenderer {
        private _params:any;
        private _componentRef:ComponentRef<T>;

        init(params:any):void {
            this._params = params;
        }

        getGui():HTMLElement {
            let div = document.createElement('div');
            createComponent(componentType, viewContainerRef, componentResolver).then(cr => {
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
            this._params = params;
        }
    }

    return CellRenderer;
}

/**
 From Template
 */
class DynamicComponent {
    public params:any = null;
}

function createDynamicComponentType(selector:string, template:string):any {
    @Component({selector: selector, template: template})
    class Fake extends DynamicComponent {
    }
    return Fake;
}

function createCellRendererFromTemplate<T>(viewContainerRef:ViewContainerRef, componentResolver:ComponentResolver, template:string): {new(): ICellRenderer} {
    let componentType:{ new(...args:any[]): any; } = createDynamicComponentType('dynamic-component', template);
    return createCellRendererFromComponent(componentType, viewContainerRef, componentResolver, (i:DynamicComponent, p:any) => i.params = p);
}
