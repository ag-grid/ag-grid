import { Autowired, Context, PreConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { IComponent } from "../interfaces/iComponent";
import { AgEvent } from "../events";
import { _, NumberSequence } from "../utils";

const compIdSequence = new NumberSequence();

export interface VisibleChangedEvent extends AgEvent {
    visible: boolean;
}

export class Component extends BeanStub {//implements IComponent<any> {

    public static EVENT_VISIBLE_CHANGED = 'visibleChanged';

    private eGui: HTMLElement;

    private childComponents: IComponent<any>[] = [];

    private annotatedEventListeners: any[] = [];

    private visible = true;

    protected parentComponent: Component | undefined;

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

    // for registered components only, eg creates AgCheckbox instance from ag-checkbox HTML tag
    private createChildComponentsFromTags(parentNode: Element): void {

        // we MUST take a copy of the list first, as the 'swapComponentForNode' adds comments into the DOM
        // which messes up the traversal order of the children.
        const childNodeList: Node[] = _.copyNodeList(parentNode.childNodes);

        childNodeList.forEach((childNode: Node) => {
            const childComp = this.getContext().createComponentFromElement(childNode as Element, (childComp) => {
                // copy over all attributes, including css classes, so any attributes user put on the tag
                // wll be carried across
                this.copyAttributesFromNode(childNode as Element, childComp.getGui());
            });
            if (childComp) {
                if ((childComp as any).addItems && (childNode as Element).children.length) {
                    this.createChildComponentsFromTags(childNode as Element);

                    // converting from HTMLCollection to Array
                    const items = Array.prototype.slice.call((childNode as Element).children);

                    (childComp as any).addItems(items);
                }
                // replace the tag (eg ag-checkbox) with the proper HTMLElement (eg 'div') in the dom
                this.swapComponentForNode(childComp, parentNode, childNode);
            } else if (childNode.childNodes) {
                this.createChildComponentsFromTags(childNode as Element);
            }
        });
    }

    private copyAttributesFromNode(source: Element, dest: Element): void {
        _.iterateNamedNodeMap(source.attributes,
            (name: string, value: string) => {
                dest.setAttribute(name, value);
            }
        );
    }

    private swapComponentForNode(newComponent: Component, parentNode: Element, childNode: Node): void {
        const eComponent = newComponent.getGui();
        parentNode.replaceChild(eComponent, childNode);
        parentNode.insertBefore(document.createComment(childNode.nodeName), eComponent);
        this.childComponents.push(newComponent);
        this.swapInComponentForQuerySelectors(newComponent, childNode);
    }

    private swapInComponentForQuerySelectors(newComponent: Component, childNode: Node): void {

        let thisProto: any = Object.getPrototypeOf(this);

        const thisNoType = this as any;
        while (thisProto != null) {
            const metaData = thisProto.__agComponentMetaData;
            const currentProtoName = (thisProto.constructor).name;

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
        const eGui = _.loadTemplate(template as string);
        this.setTemplateFromElement(eGui);
    }

    public setTemplateFromElement(element: HTMLElement): void {
        this.eGui = element;
        (this.eGui as any).__agComponent = this;
        this.addAnnotatedEventListeners();
        this.wireQuerySelectors();

        // context will not be available when user sets template in constructor
        const contextIsAvailable = !!this.getContext();
        if (contextIsAvailable) {
            this.createChildComponentsFromTags(this.getGui());
        }
    }

    @PreConstruct
    private createChildComponentsPreConstruct(): void {
        // ui exists if user sets template in constructor. when this happens, we have to wait for the context
        // to be autoWired first before we can create child components.
        const uiExists = !!this.getGui();
        if (uiExists) {
            this.createChildComponentsFromTags(this.getGui());
        }
    }

    protected wireQuerySelectors(): void {
        if (!this.eGui) {
            return;
        }

        let thisProto: any = Object.getPrototypeOf(this);

        while (thisProto != null) {
            const metaData = thisProto.__agComponentMetaData;
            const currentProtoName = (thisProto.constructor).name;

            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                const thisNoType = this as any;
                metaData[currentProtoName].querySelectors.forEach((querySelector: any) => {
                    const resultOfQuery = this.eGui.querySelector(querySelector.querySelector);
                    if (resultOfQuery) {
                        const backingComponent = (resultOfQuery as any).__agComponent;
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

        const listenerMethods = this.getAgComponentMetaData('listenerMethods');

        if (_.missingOrEmpty(listenerMethods)) {
            return;
        }

        if (!this.annotatedEventListeners) {
            this.annotatedEventListeners = [];
        }

        listenerMethods.forEach((eventListener: any) => {
            const listener = (this as any)[eventListener.methodName].bind(this);
            this.eGui.addEventListener(eventListener.eventName, listener);
            this.annotatedEventListeners.push({eventName: eventListener.eventName, listener: listener});
        });
    }

    private getAgComponentMetaData(key: string): any[] {
        let res: any[] = [];

        let thisProto: any = Object.getPrototypeOf(this);

        while (thisProto != null) {
            const metaData = thisProto.__agComponentMetaData;
            let currentProtoName = (thisProto.constructor).name;

            // IE does not support Function.prototype.name, so we need to extract
            // the name using a RegEx
            // from: https://matt.scharley.me/2012/03/monkey-patch-name-ie.html
            if (currentProtoName === undefined) {
                const funcNameRegex = /function\s([^(]{1,})\(/;
                const results = funcNameRegex.exec(thisProto.constructor.toString());
                if (results && results.length > 1) {
                    currentProtoName = results[1].trim();
                }
            }

            if (metaData && metaData[currentProtoName] && metaData[currentProtoName][key]) {
                res = res.concat(metaData[currentProtoName][key]);
            }

            thisProto = Object.getPrototypeOf(thisProto);
        }

        return res;
    }

    private removeAnnotatedEventListeners(): void {
        if (!this.annotatedEventListeners || !this.eGui) {
            return;
        }

        this.annotatedEventListeners.forEach((eventListener: any) => {
            this.eGui.removeEventListener(eventListener.eventName, eventListener.listener);
        });
        this.annotatedEventListeners = [];
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public setParentComponent(component: Component) {
        this.parentComponent = component;
    }

    public getParentComponent(): Component | undefined {
        return this.parentComponent;
    }

    // this method is for older code, that wants to provide the gui element,
    // it is not intended for this to be in ag-Stack
    protected setGui(eGui: HTMLElement): void {
        this.eGui = eGui;
    }

    protected queryForHtmlElement(cssSelector: string): HTMLElement {
        return this.eGui.querySelector(cssSelector) as HTMLElement;
    }

    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement {
        return this.eGui.querySelector(cssSelector) as HTMLInputElement;
    }

    public appendChild(newChild: Node | IComponent<any>): void {
        if (_.isNodeOrElement(newChild)) {
            this.eGui.appendChild(newChild as Node);
        } else {
            const childComponent = newChild as IComponent<any>;
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

    public setVisible(visible: boolean, visibilityMode?: 'display' | 'visibility'): void {
        const isDisplay = visibilityMode !== 'visibility';
        if (visible !== this.visible) {
            this.visible = visible;
            _.addOrRemoveCssClass(this.eGui, isDisplay ? 'ag-hidden' : 'ag-invisible', !visible);
            const event: VisibleChangedEvent = {
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
        this.childComponents.forEach(childComponent => {
            if (childComponent && childComponent.destroy) {
                (childComponent as any).destroy();
            }
        });
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

    public getAttribute(key: string): string | null {
        const eGui = this.getGui();
        return eGui ? eGui.getAttribute(key) : null;
    }

    public getRefElement(refName: string): HTMLElement {
        return this.queryForHtmlElement('[ref="' + refName + '"]');
    }

}