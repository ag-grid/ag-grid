import {Utils as _} from '../utils';
import {EventService} from "../eventService";
import {IEventEmitter} from "../interfaces/iEventEmitter";

export class Component implements IEventEmitter {

    private eGui: HTMLElement;

    private destroyFunctions: (()=>void)[] = [];

    private localEventService: EventService;

    private childComponents: Component[] = [];

    constructor(template?: string) {
        if (template) {
            this.eGui = _.loadTemplate(<string>template);
        }
    }

    public setTemplate(template: string): void {
        this.eGui = _.loadTemplate(<string>template);
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
}