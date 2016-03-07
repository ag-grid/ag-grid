import {Utils as _} from '../utils';
import {EventService} from "../eventService";

export class Component {

    private eGui: HTMLElement;

    private destroyFunctions: (()=>void)[] = [];

    private localEventService: EventService;

    constructor(template: string) {
        this.eGui = _.loadTemplate(template);
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (!this.localEventService) {
            this.localEventService = new EventService();
        }
        this.localEventService.addEventListener(eventType, listener);
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
            this.eGui.appendChild((<Component>newChild).getGui());
        }
    }

    public setVisible(visible: boolean): void {
        _.addOrRemoveCssClass(this.eGui, 'ag-hidden', !visible);
    }

    public destroy(): void {
        this.destroyFunctions.forEach( func => func() );
    }

    public addGuiEventListener(event: string, listener: ()=>void): void {
        this.getGui().addEventListener(event, listener);
        this.destroyFunctions.push( ()=> this.getGui().removeEventListener(event, listener));
    }

    public addDestroyableEventListener(eElement: HTMLElement|EventService, event: string, listener: ()=>void): void {
        if (eElement instanceof EventService) {
            (<EventService>eElement).addEventListener(event, listener);
        } else {
            (<HTMLElement>eElement).addEventListener(event, listener);
        }

        this.destroyFunctions.push( ()=> {
            if (eElement instanceof EventService) {
                (<EventService>eElement).removeEventListener(event, listener);
            } else {
                (<HTMLElement>eElement).removeEventListener(event, listener);
            }
        });
    }

    public addDestroyFunc(func: ()=>void ): void {
        this.destroyFunctions.push(func);
    }
}