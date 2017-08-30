import {NumberSequence, Utils as _} from "../utils";
import {Context} from "../context/context";
import {BeanStub} from "../context/beanStub";
import {IAfterGuiAttachedParams, IComponent} from "../interfaces/iComponent";
import {AgEvent} from "../events";

let compIdSequence = new NumberSequence();

export interface VisibleChangedEvent extends AgEvent {
    visible: boolean;
}

export class Component extends BeanStub implements IComponent<any, IAfterGuiAttachedParams> {

    public static EVENT_VISIBLE_CHANGED = 'visibleChanged';

    private template: string;

    private eHtmlElement: HTMLElement;

    private childComponents: IComponent<any, IAfterGuiAttachedParams>[] = [];

    private hydrated = false;

    private annotatedEventListeners: any[] = [];

    private visible = true;

    // unique id for this row component. this is used for getting a reference to the HTML dom.
    // we cannot use the RowNode id as this is not unique (due to animation, old rows can be lying
    // around as we create a new rowComp instance for the same row node).
    private compId = compIdSequence.next();

    constructor(template?: string) {
        super();
        if (template) {
            this.setTemplate(template);
        }
    }

    public setTemplateNoHydrate(template: string): void {
        this.template = template;
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        if (!this.eHtmlElement && params.eComponent) {
            this.setHtmlElement(params.eComponent);
        }
    }

    public getCompId(): number {
        return this.compId;
    }

    public instantiate(context: Context): void {
        let element = this.getHtmlElement();
        this.instantiateRecurse(element, context);
    }

    private instantiateRecurse(parentNode: Element, context: Context): void {
        let childCount = parentNode.childNodes ? parentNode.childNodes.length : 0;
        for (let i = 0; i < childCount; i++) {
            let childNode = parentNode.childNodes[i];
            let newComponent = context.createComponent(<Element>childNode);
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
        let element = newComponent.getHtmlElement();
        parentNode.replaceChild(element, childNode);
        this.childComponents.push(newComponent);
        this.swapInComponentForQuerySelectors(newComponent, childNode);
    }

    private swapInComponentForQuerySelectors(newComponent: Component, childNode: Node): void {

        let thisProto: any = Object.getPrototypeOf(this);

        let thisNoType = <any> this;
        while (thisProto != null) {
            let metaData = thisProto.__agComponentMetaData;
            let currentProtoName = (thisProto.constructor).name;

            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                metaData[currentProtoName].querySelectors.forEach((querySelector: any) => {
                    if (thisNoType[querySelector.attributeName] === childNode) {
                        thisNoType[querySelector.attributeName] = newComponent;
                    }
                });
            }

            thisProto = Object.getPrototypeOf(thisProto);
        }
    }

    public setTemplate(template: string): void {
        this.template = template;
        let eGui = _.loadTemplate(<string>template);
        this.setHtmlElement(eGui);
    }

    public setHtmlElement(element: HTMLElement): void {
        this.eHtmlElement = element;
        (<any>this.eHtmlElement).__agComponent = this;
        this.hydrate();
    }

    private hydrate(): void {
        this.addAnnotatedEventListeners();
        this.wireQuerySelectors();
        this.hydrated = true;
    }

    public attributesSet(): void {
    }

    private wireQuerySelectors(): void {
        let element = this.getHtmlElement();
        if (!element) {
            return;
        }

        let thisProto: any = Object.getPrototypeOf(this);

        while (thisProto != null) {
            let metaData = thisProto.__agComponentMetaData;
            let currentProtoName = (thisProto.constructor).name;

            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                let thisNoType = <any> this;
                metaData[currentProtoName].querySelectors.forEach((querySelector: any) => {
                    let resultOfQuery = element.querySelector(querySelector.querySelector);
                    if (resultOfQuery) {
                        let backingComponent = (<any>resultOfQuery).__agComponent;
                        if (backingComponent) {
                            thisNoType[querySelector.attributeName] = backingComponent;
                        } else {
                            thisNoType[querySelector.attributeName] = resultOfQuery;
                        }
                    } else {
                        // put debug msg in here if query selector fails???
                    }
                });
            }

            thisProto = Object.getPrototypeOf(thisProto);
        }
    }

    private addAnnotatedEventListeners(): void {
        this.removeAnnotatedEventListeners();
        let element = this.getHtmlElement();

        if (!element) {
            return;
        }

        let thisProto: any = Object.getPrototypeOf(this);

        while (thisProto != null) {
            let metaData = thisProto.__agComponentMetaData;
            let currentProtoName = (thisProto.constructor).name;

            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].listenerMethods) {

                if (!this.annotatedEventListeners) {
                    this.annotatedEventListeners = [];
                }

                metaData[currentProtoName].listenerMethods.forEach((eventListener: any) => {
                    let listener = (<any>this)[eventListener.methodName].bind(this);
                    element.addEventListener(eventListener.eventName, listener);
                    this.annotatedEventListeners.push({eventName: eventListener.eventName, listener: listener});
                });
            }

            thisProto = Object.getPrototypeOf(thisProto);
        }
    }

    private removeAnnotatedEventListeners(): void {
        if (!this.annotatedEventListeners) {
            return;
        }
        let element = this.getHtmlElement();
        if (!element) {
            return;
        }
        this.annotatedEventListeners.forEach((eventListener: any) => {
            element.removeEventListener(eventListener.eventName, eventListener.listener);
        });
        this.annotatedEventListeners = null;
    }

    public getGui(): HTMLElement | string {
        if (this.eHtmlElement) {
            return this.eHtmlElement;
        } else {
            return this.template;
        }
    }

    public getHtmlElement(): HTMLElement {
        if (this.eHtmlElement) {
            return this.eHtmlElement;
        } else {
            console.warn('getHtmlElement() called on component before gui was attached');
            return null;
        }
    }

    // used by Cell Comp (and old header code), design is a bit poor, overlap with afterGuiAttached???
    protected setHtmlElementNoHydrate(eHtmlElement: HTMLElement): void {
        this.eHtmlElement = eHtmlElement;
    }

    protected queryForHtmlElement(cssSelector: string): HTMLElement {
        let element = this.getHtmlElement();
        return <HTMLElement> element.querySelector(cssSelector);
    }

    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement {
        let element = this.getHtmlElement();
        return <HTMLInputElement> element.querySelector(cssSelector);
    }

    public appendChild(newChild: Node | IComponent<any, IAfterGuiAttachedParams>): void {
        let element = this.getHtmlElement();
        if (_.isNodeOrElement(newChild)) {
            element.appendChild(<Node>newChild);
        } else {
            let childComponent = <IComponent<any, IAfterGuiAttachedParams>>newChild;
            element.appendChild(_.ensureElement(childComponent.getGui()));
            this.childComponents.push(childComponent);
        }
    }

    public addFeature(context: Context, feature: BeanStub): void {
        context.wireBean(feature);
        if (feature.destroy) {
            this.addDestroyFunc(feature.destroy.bind(feature));
        }
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public setVisible(visible: boolean): void {
        let element = this.getHtmlElement();
        if (visible !== this.visible) {
            this.visible = visible;
            _.addOrRemoveCssClass(element, 'ag-hidden', !visible);
            let event: VisibleChangedEvent = {
                type: Component.EVENT_VISIBLE_CHANGED,
                visible: this.visible
            };
            this.dispatchEvent(event);
        }
    }

    public addOrRemoveCssClass(className: string, addOrRemove: boolean): void {
        let element = this.getHtmlElement();
        _.addOrRemoveCssClass(element, className, addOrRemove);
    }

    public destroy(): void {
        super.destroy();
        this.childComponents.forEach(childComponent => childComponent.destroy());
        this.childComponents.length = 0;

        if (this.hydrated) {
            this.removeAnnotatedEventListeners();
        }
    }

    public addGuiEventListener(event: string, listener: (event: any) => void): void {
        let element = this.getHtmlElement();
        element.addEventListener(event, listener);
        this.addDestroyFunc(() => element.removeEventListener(event, listener));
    }

    public addCssClass(className: string): void {
        let element = this.getHtmlElement();
        _.addCssClass(element, className);
    }

    public removeCssClass(className: string): void {
        let element = this.getHtmlElement();
        _.removeCssClass(element, className);
    }

    public getAttribute(key: string): string {
        let element = this.getHtmlElement();
        if (element) {
            return element.getAttribute(key);
        } else {
            return null;
        }
    }

    public getRefElement(refName: string): HTMLElement {
        return this.queryForHtmlElement('[ref="' + refName + '"]');
    }

}