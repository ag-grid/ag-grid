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

    private eGui: HTMLElement | string;

    private eHtmlElement: HTMLElement;

    private childComponents: IComponent<any, IAfterGuiAttachedParams>[] = [];

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

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        this.eHtmlElement = params.eComponent;
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
        let eGui = _.loadTemplate(<string>template);
        this.setTemplateFromElement(eGui);
    }

    public setTemplateFromElement(element: HTMLElement): void {
        this.eGui = element;
        (<any>this.eGui).__agComponent = this;
        this.addAnnotatedEventListeners();
        this.wireQuerySelectors();
    }

    public attributesSet(): void {
    }

    private wireQuerySelectors(): void {
        if (!this.eGui) {
            return;
        }

        let thisProto: any = Object.getPrototypeOf(this);
        let element = this.getHtmlElement();

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
        if (!this.eGui) {
            return;
        }

        let thisProto: any = Object.getPrototypeOf(this);
        let element = this.getHtmlElement();

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
        if (!this.eGui) {
            return;
        }
        let element = this.getHtmlElement();
        this.annotatedEventListeners.forEach((eventListener: any) => {
            element.removeEventListener(eventListener.eventName, eventListener.listener);
        });
        this.annotatedEventListeners = null;
    }

    public getGui(): HTMLElement | string {
        return this.eGui;
    }

    public getHtmlElement(): HTMLElement {
        if (this.eHtmlElement) {
            return this.eHtmlElement;
        } else if (typeof this.eGui === 'object') {
            return <HTMLElement> this.eGui;
        } else {
            console.warn('getElement() called on component before gui was attached');
            return null;
        }
    }

    // this method is for older code, that wants to provide the gui element,
    // it is not intended for this to be in ag-Stack
    protected setGui(eGui: HTMLElement | string): void {
        this.eGui = eGui;
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

        this.removeAnnotatedEventListeners();
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