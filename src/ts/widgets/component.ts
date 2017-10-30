import {NumberSequence, Utils as _} from "../utils";
import {Context} from "../context/context";
import {BeanStub} from "../context/beanStub";
import {IAfterGuiAttachedParams, IComponent} from "../interfaces/iComponent";
import {AgEvent} from "../events";

let compIdSequence = new NumberSequence();

export interface VisibleChangedEvent extends AgEvent {
    visible: boolean;
}

export class Component extends BeanStub implements IComponent<any> {

    public static EVENT_VISIBLE_CHANGED = 'visibleChanged';

    private eGui: HTMLElement;

    private childComponents: IComponent<any>[] = [];

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

    public getCompId(): number {
        return this.compId;
    }

    public instantiate(context: Context): void {
        this.instantiateRecurse(this.getGui(), context);
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
        parentNode.replaceChild(newComponent.getGui(), childNode);
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

    protected wireQuerySelectors(): void {
        if (!this.eGui) {
            return;
        }

        let thisProto: any = Object.getPrototypeOf(this);

        while (thisProto != null) {
            let metaData = thisProto.__agComponentMetaData;
            let currentProtoName = (thisProto.constructor).name;

            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                let thisNoType = <any> this;
                metaData[currentProtoName].querySelectors.forEach((querySelector: any) => {
                    let resultOfQuery = this.eGui.querySelector(querySelector.querySelector);
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

        while (thisProto != null) {
            let metaData = thisProto.__agComponentMetaData;
            let currentProtoName = (thisProto.constructor).name;

            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].listenerMethods) {

                if (!this.annotatedEventListeners) {
                    this.annotatedEventListeners = [];
                }

                metaData[currentProtoName].listenerMethods.forEach((eventListener: any) => {
                    let listener = (<any>this)[eventListener.methodName].bind(this);
                    this.eGui.addEventListener(eventListener.eventName, listener);
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
        this.annotatedEventListeners.forEach((eventListener: any) => {
            this.eGui.removeEventListener(eventListener.eventName, eventListener.listener);
        });
        this.annotatedEventListeners = null;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    // this method is for older code, that wants to provide the gui element,
    // it is not intended for this to be in ag-Stack
    protected setGui(eGui: HTMLElement): void {
        this.eGui = eGui;
    }

    protected queryForHtmlElement(cssSelector: string): HTMLElement {
        return <HTMLElement> this.eGui.querySelector(cssSelector);
    }

    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement {
        return <HTMLInputElement> this.eGui.querySelector(cssSelector);
    }

    public appendChild(newChild: Node | IComponent<any>): void {
        if (_.isNodeOrElement(newChild)) {
            this.eGui.appendChild(<Node>newChild);
        } else {
            let childComponent = <IComponent<any>>newChild;
            this.eGui.appendChild(childComponent.getGui());
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
        if (visible !== this.visible) {
            this.visible = visible;
            _.addOrRemoveCssClass(this.eGui, 'ag-hidden', !visible);
            let event: VisibleChangedEvent = {
                type: Component.EVENT_VISIBLE_CHANGED,
                visible: this.visible
            };
            this.dispatchEvent(event);
        }
    }

    public addOrRemoveCssClass(className: string, addOrRemove: boolean): void {
        _.addOrRemoveCssClass(this.eGui, className, addOrRemove);
    }

    public destroy(): void {
        super.destroy();
        this.childComponents.forEach(childComponent => childComponent.destroy());
        this.childComponents.length = 0;

        this.removeAnnotatedEventListeners();
    }

    public addGuiEventListener(event: string, listener: (event: any) => void): void {
        this.getGui().addEventListener(event, listener);
        this.addDestroyFunc(() => this.getGui().removeEventListener(event, listener));
    }

    public addCssClass(className: string): void {
        _.addCssClass(this.getGui(), className);
    }

    public removeCssClass(className: string): void {
        _.removeCssClass(this.getGui(), className);
    }

    public getAttribute(key: string): string {
        let eGui = this.getGui();
        if (eGui) {
            return eGui.getAttribute(key);
        } else {
            return null;
        }
    }

    public getRefElement(refName: string): HTMLElement {
        return this.queryForHtmlElement('[ref="' + refName + '"]');
    }

}