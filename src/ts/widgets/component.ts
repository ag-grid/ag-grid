import {Utils as _} from '../utils';
import {EventService} from "../eventService";
import {IEventEmitter} from "../interfaces/iEventEmitter";

export class Component implements IEventEmitter {

    private eGui: HTMLElement;

    private destroyFunctions: (()=>void)[] = [];

    private localEventService: EventService;

    private childComponents: Component[] = [];

    private annotatedEventListeners: any[] = [];

    constructor(template?: string) {
        if (template) {
            this.setTemplate(template);
        }
    }

    public setTemplate(template: string): void {
        this.eGui = _.loadTemplate(<string>template);
        this.addAnnotatedEventListeners();
        this.wireQuerySelectors();
    }

    private wireQuerySelectors(): void {
        var metaData = (<any>this).__agBeanMetaData;
        if (!metaData || !metaData.querySelectors) { return; }

        if (!this.eGui) { return; }

        metaData.querySelectors.forEach( (querySelector: any) => {
            (<any>this)[querySelector.attributeName] = this.eGui.querySelector(querySelector.querySelector);
        } );
    }

    private addAnnotatedEventListeners(): void {
        this.removeAnnotatedEventListeners();

        var metaData = (<any>this).__agBeanMetaData;
        if (!metaData || !metaData.eventListenerMethods) { return; }

        if (!this.eGui) { return; }

        if (!this.annotatedEventListeners) {
            this.annotatedEventListeners = [];
        }

        metaData.eventListenerMethods.forEach( (eventListener: any) => {
            var listener = (<any>this)[eventListener.methodName].bind(this);
            this.eGui.addEventListener(eventListener.eventName, listener);
            this.annotatedEventListeners.push({eventName: eventListener.eventName, listener: listener});
        });
    }

    private removeAnnotatedEventListeners(): void {
        if (!this.annotatedEventListeners) { return; }
        if (!this.eGui) { return; }
        this.annotatedEventListeners.forEach( (eventListener: any) => {
            this.eGui.removeEventListener(eventListener.eventName, eventListener.listener);
        });
        this.annotatedEventListeners = null;
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (!this.localEventService) {
            this.localEventService = new EventService();
        }
        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        if (this.localEventService) {
            this.localEventService.removeEventListener(eventType, listener);
        }
    }

    public dispatchEvent(eventType: string, event?: any): void {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(eventType, event);
        }
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    protected queryForHtmlElement(cssSelector: string): HTMLElement {
        return <HTMLElement> this.eGui.querySelector(cssSelector);
    }

    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement {
        return <HTMLInputElement> this.eGui.querySelector(cssSelector);
    }

    public appendChild(newChild: Node|Component): void {
        if (_.isNodeOrElement(newChild)) {
            this.eGui.appendChild(<Node>newChild);
        } else {
            var childComponent = <Component>newChild;
            this.eGui.appendChild(childComponent.getGui());
            this.childComponents.push(childComponent);
        }
    }

    public setVisible(visible: boolean): void {
        _.addOrRemoveCssClass(this.eGui, 'ag-hidden', !visible);
    }

    public destroy(): void {
        this.childComponents.forEach( childComponent => childComponent.destroy() );
        this.destroyFunctions.forEach( func => func() );
        this.removeAnnotatedEventListeners();
    }

    public addGuiEventListener(event: string, listener: (event: any)=>void): void {
        this.getGui().addEventListener(event, listener);
        this.destroyFunctions.push( ()=> this.getGui().removeEventListener(event, listener));
    }

    public addDestroyableEventListener(eElement: HTMLElement|IEventEmitter, event: string, listener: (event?: any)=>void): void {
        if (eElement instanceof HTMLElement) {
            (<HTMLElement>eElement).addEventListener(event, listener);
        } else {
            (<IEventEmitter>eElement).addEventListener(event, listener);
        }

        this.destroyFunctions.push( ()=> {
            if (eElement instanceof HTMLElement) {
                (<HTMLElement>eElement).removeEventListener(event, listener);
            } else {
                (<IEventEmitter>eElement).removeEventListener(event, listener);
            }
        });
    }

    public addDestroyFunc(func: ()=>void ): void {
        this.destroyFunctions.push(func);
    }
    
    public addCssClass(className: string): void {
        _.addCssClass(this.getGui(), className);
    }
}