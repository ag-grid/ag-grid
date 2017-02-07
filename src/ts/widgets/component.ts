import {Utils as _} from "../utils";
import {Context} from "../context/context";
import {BeanStub} from "../context/beanStub";
import {IComponent} from "../interfaces/iComponent";

export class Component extends BeanStub implements IComponent<any> {

    public static EVENT_VISIBLE_CHANGED = 'visibleChanged';

    private eGui: HTMLElement;

    private childComponents: IComponent<any>[] = [];

    private annotatedEventListeners: any[] = [];

    private visible = true;

    constructor(template?: string) {
        super();
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

    public attributesSet(): void {
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

    public appendChild(newChild: Node|IComponent<any>): void {
        if (_.isNodeOrElement(newChild)) {
            this.eGui.appendChild(<Node>newChild);
        } else {
            var childComponent = <IComponent<any>>newChild;
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
            this.dispatchEvent(Component.EVENT_VISIBLE_CHANGED, {visible: this.visible});
        }
    }

    public addOrRemoveCssClass(className: string, addOrRemove: boolean): void {
        _.addOrRemoveCssClass(this.eGui, className, addOrRemove);
    }
    
    public destroy(): void {
        super.destroy();
        this.childComponents.forEach( childComponent => childComponent.destroy() );
        this.childComponents.length = 0;

        this.removeAnnotatedEventListeners();
    }

    public addGuiEventListener(event: string, listener: (event: any)=>void): void {
        this.getGui().addEventListener(event, listener);
        this.addDestroyFunc( ()=> this.getGui().removeEventListener(event, listener));
    }

    public addCssClass(className: string): void {
        _.addCssClass(this.getGui(), className);
    }

    public removeCssClass(className: string): void {
        _.removeCssClass(this.getGui(), className);
    }

    public getAttribute(key: string): string {
        var eGui = this.getGui();
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