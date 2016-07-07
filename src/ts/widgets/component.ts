import {Utils as _} from '../utils';
import {EventService} from "../eventService";
import {IEventEmitter} from "../interfaces/iEventEmitter";
import {Context} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export class Component implements IEventEmitter {

    public static EVENT_VISIBLE_CHANGED = 'visibleChanged';

    private eGui: HTMLElement;

    private destroyFunctions: (()=>void)[] = [];

    private localEventService: EventService;

    private childComponents: Component[] = [];

    private annotatedEventListeners: any[] = [];

    private visible = true;

    constructor(template?: string) {
        if (template) {
            this.setTemplate(template);
        }
    }

    public instantiate(context: Context): void {
        this.instantiateRecurse(this.getGui(), context);
    }

    private instantiateRecurse(parentNode: Element, context: Context): void {
        var childCount = parentNode.childNodes ? parentNode.childNodes.length : 0;
        for (var i = 0; i<childCount; i++) {
            var childNode = parentNode.childNodes[i];
            var newComponent = context.createComponent(<Element>childNode);
            if (newComponent) {
                this.swapComponentForNode(newComponent, parentNode, childNode);
            } else {
                if (childNode.childNodes) {
                    this.instantiateRecurse(<Element>childNode, context);
                }
            }
        }
    }

    private swapComponentForNode(newComponent: Component, parentNode: Element, childNode: Node): void {
        parentNode.replaceChild(newComponent.getGui(), childNode);
        this.childComponents.push(newComponent);
        this.swapInComponentForQuerySelectors(newComponent, childNode);
    }

    private swapInComponentForQuerySelectors(newComponent: Component, childNode: Node): void {
        var metaData = (<any>this).__agComponentMetaData;
        if (!metaData || !metaData.querySelectors) { return; }

        var thisNoType = <any> this;
        metaData.querySelectors.forEach( (querySelector: any) => {
            if (thisNoType[querySelector.attributeName]===childNode) {
                thisNoType[querySelector.attributeName] = newComponent;
            }
        } );
    }

    public setTemplate(template: string): void {
        this.eGui = _.loadTemplate(<string>template);
        (<any>this.eGui).__agComponent = this;
        this.addAnnotatedEventListeners();
        this.wireQuerySelectors();
    }

    private wireQuerySelectors(): void {
        var metaData = (<any>this).__agComponentMetaData;
        if (!metaData || !metaData.querySelectors) { return; }

        if (!this.eGui) { return; }

        var thisNoType = <any> this;
        metaData.querySelectors.forEach( (querySelector: any) => {
            var resultOfQuery = this.eGui.querySelector(querySelector.querySelector);
            if (resultOfQuery) {
                var backingComponent = (<any>resultOfQuery).__agComponent;
                if (backingComponent) {
                    thisNoType[querySelector.attributeName] = backingComponent;
                } else {
                    thisNoType[querySelector.attributeName] = resultOfQuery;
                }
            } else {
                // put debug msg in here if query selector fails???
            }
        } );
    }

    private addAnnotatedEventListeners(): void {
        this.removeAnnotatedEventListeners();

        var metaData = (<any>this).__agComponentMetaData;
        if (!metaData || !metaData.listenerMethods) { return; }

        if (!this.eGui) { return; }

        if (!this.annotatedEventListeners) {
            this.annotatedEventListeners = [];
        }

        metaData.listenerMethods.forEach( (eventListener: any) => {
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

    public dispatchEventAsync(eventType: string, event?: any): void {
        setTimeout( ()=> this.dispatchEvent(eventType, event), 0);
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

    public isVisible(): boolean {
        return this.visible;
    }

    public setVisible(visible: boolean): void {
        if (visible !== this.visible) {
            this.visible = visible;
            _.addOrRemoveCssClass(this.eGui, 'ag-hidden', !visible);
            this.dispatchEvent(Component.EVENT_VISIBLE_CHANGED, {visible: this.visible});
        }
    }

    public addOrRemoveCssClass(className: string, addOrRemove: boolean): void {
        _.addOrRemoveCssClass(this.eGui, className, addOrRemove);
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

    public addDestroyableEventListener(eElement: HTMLElement|IEventEmitter|GridOptionsWrapper, event: string, listener: (event?: any)=>void): void {
        if (eElement instanceof HTMLElement) {
            (<HTMLElement>eElement).addEventListener(event, listener);
        } else if (eElement instanceof GridOptionsWrapper) {
            (<GridOptionsWrapper>eElement).addEventListener(event, listener);
        } else {
            (<IEventEmitter>eElement).addEventListener(event, listener);
        }

        this.destroyFunctions.push( ()=> {
            if (eElement instanceof HTMLElement) {
                (<HTMLElement>eElement).removeEventListener(event, listener);
            } else if (eElement instanceof GridOptionsWrapper) {
                (<GridOptionsWrapper>eElement).removeEventListener(event, listener);
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
    
    public getAttribute(key: string): string {
        var eGui = this.getGui();
        if (eGui) {
            return eGui.getAttribute(key);
        } else {
            return null;
        }
    }
}