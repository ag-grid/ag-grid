import {NumberSequence, Utils as _} from "../utils";
import {Context} from "../context/context";
import {BeanStub} from "../context/beanStub";
import {IComponent} from "../interfaces/iComponent";
import {AgEvent} from "../events";

let compIdSequence = new NumberSequence();

export interface VisibleChangedEvent extends AgEvent {
    visible: boolean;
}

interface AttrLists {
    normal: NameValue [];
    events: NameValue [];
    bindings: NameValue [];
}

interface NameValue {
    name: string;
    value: string;
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

        // we MUST take a copy of the list first, as the 'swapComponentForNode' adds comments into the DOM
        // which messes up the traversal order of the children.
        let childNodeList: Node[] = _.copyNodeList(parentNode.childNodes);

        childNodeList.forEach(childNode => {
            let childComp = context.createComponent(<Element>childNode, (childComp)=> {
                let attrList = this.getAttrLists(<Element>childNode);
                this.copyAttributesFromNode(attrList, childComp.getGui());
                this.createChildAttributes(attrList, childComp);
                this.addEventListenersToComponent(attrList, childComp);
            });
            if (childComp) {
                this.swapComponentForNode(childComp, parentNode, childNode);
            } else {
                if (childNode.childNodes) {
                    this.instantiateRecurse(<Element>childNode, context);
                }
                if (childNode instanceof HTMLElement) {
                    let attrList = this.getAttrLists(<Element>childNode);
                    this.addEventListenersToElement(attrList, <HTMLElement>childNode);
                }
            }
        });
    }

    private getAttrLists(child: Element): AttrLists {
        let res: AttrLists = {
            bindings: [],
            events: [],
            normal: []
        };
        _.iterateNamedNodeMap(child.attributes,
            (name: string, value: string) => {
                let firstCharacter = name.substr(0,1);
                if (firstCharacter==='(') {
                    let eventName = name.replace('(', '').replace(')', '');
                    res.events.push({
                        name: eventName,
                        value: value
                    });
                } else if (firstCharacter==='[') {
                    let bindingName = name.replace('[', '').replace(']', '');
                    res.bindings.push({
                        name: bindingName,
                        value: value
                    });
                } else {
                    res.normal.push({
                        name: name,
                        value: value
                    });
                }
            }
        );
        return res;
    }

    private addEventListenersToElement(attrLists: AttrLists, element: HTMLElement): void {
        this.addEventListenerCommon(attrLists, (eventName: string, listener: (event?: any)=>void )=> {
            this.addDestroyableEventListener(element, eventName, listener);
        });
    }

    private addEventListenersToComponent(attrLists: AttrLists, component: Component): void {
        this.addEventListenerCommon(attrLists, (eventName: string, listener: (event?: any)=>void )=> {
            this.addDestroyableEventListener(component, eventName, listener);
        });
    }

    private addEventListenerCommon(attrLists: AttrLists,
                                   callback: (eventName: string, listener: (event?: any)=>void)=>void): void {
        let methodAliases = this.getAgComponentMetaData('methods');

        attrLists.events.forEach( nameValue => {
            let methodName = nameValue.value;
            let methodAlias = _.find(methodAliases, 'alias', methodName);

            let methodNameToUse = _.exists(methodAlias) ? methodAlias.methodName : methodName;

            let listener = (<any>this)[methodNameToUse];
            if (typeof listener !== 'function') {
                console.warn('ag-Grid: count not find callback ' + methodName);
                return;
            }

            let eventCamelCase = _.hyphenToCamelCase(nameValue.name);

            callback(eventCamelCase, listener.bind(this));
        });
    }

    private createChildAttributes(attrLists: AttrLists, child: any): void {

        let childAttributes: any = {};

        attrLists.normal.forEach( nameValue => {
            let nameCamelCase = _.hyphenToCamelCase(nameValue.name);
            childAttributes[nameCamelCase] = nameValue.value;
        });

        attrLists.bindings.forEach( nameValue => {
            let nameCamelCase = _.hyphenToCamelCase(nameValue.name);
            childAttributes[nameCamelCase] = (<any>this)[nameValue.value];
        });

        child.props = childAttributes;
    }

    private copyAttributesFromNode(attrLists: AttrLists, childNode: Element): void {
        attrLists.normal.forEach( nameValue => {
            childNode.setAttribute(nameValue.name, nameValue.value);
        });
    }

    private swapComponentForNode(newComponent: Component, parentNode: Element, childNode: Node): void {
        let eComponent = newComponent.getGui();
        parentNode.replaceChild(eComponent, childNode);
        parentNode.insertBefore(document.createComment(childNode.nodeName), eComponent);
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

        let listenerMethods = this.getAgComponentMetaData('listenerMethods');

        if (_.missingOrEmpty(listenerMethods)) { return; }

        if (!this.annotatedEventListeners) {
            this.annotatedEventListeners = [];
        }

        listenerMethods.forEach((eventListener: any) => {
            let listener = (<any>this)[eventListener.methodName].bind(this);
            this.eGui.addEventListener(eventListener.eventName, listener);
            this.annotatedEventListeners.push({eventName: eventListener.eventName, listener: listener});
        });
    }

    private getAgComponentMetaData(key: string): any[] {
        let res: any[] = [];

        let thisProto: any = Object.getPrototypeOf(this);

        while (thisProto != null) {
            let metaData = thisProto.__agComponentMetaData;
            let currentProtoName = (thisProto.constructor).name;

            if (metaData && metaData[currentProtoName] && metaData[currentProtoName][key]) {
                res = res.concat(metaData[currentProtoName][key]);
            }

            thisProto = Object.getPrototypeOf(thisProto);
        }

        return res;
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