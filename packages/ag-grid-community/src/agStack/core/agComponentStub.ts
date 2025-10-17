import type {
    AgBaseComponent,
    AgComponent,
    AgComponentEvent,
    AgComponentSelector,
    VisibleChangedEvent,
} from '../interfaces/agComponent';
import { RefPlaceholder } from '../interfaces/agComponent';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { CssClassManager } from '../rendering/cssClassManager';
import type { AgElementParams } from '../utils/dom';
import {
    DataRefAttribute,
    _createAgElement,
    _isNodeOrElement,
    _loadTemplate,
    _setDisplayed,
    _setVisible,
} from '../utils/dom';
import { AgBeanStub } from './agBeanStub';

let compIdSequence = 0;

export class AgComponentStub<
        TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
        TComponentSelectorType extends string,
        TLocalEventType extends string = AgComponentEvent,
    >
    extends AgBeanStub<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TLocalEventType | AgComponentEvent
    >
    implements AgComponent<TBeanCollection, TProperties, TGlobalEvents, TLocalEventType>
{
    private eGui: HTMLElement;
    private readonly componentSelectors: Map<
        TComponentSelectorType,
        AgComponentSelector<TComponentSelectorType, TBeanCollection>
    >;
    private suppressDataRefValidation: boolean = false;

    // if false, then CSS class "ag-hidden" is applied, which sets "display: none"
    private displayed = true;

    // if false, then CSS class "ag-invisible" is applied, which sets "visibility: hidden"
    private visible = true;

    private css: string[] | undefined;

    protected parentComponent: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any> | undefined;

    // unique id for this row component. this is used for getting a reference to the HTML dom.
    // we cannot use the RowNode id as this is not unique (due to animation, old rows can be lying
    // around as we create a new rowComp instance for the same row node).
    private readonly compId = compIdSequence++;

    private readonly cssManager: CssClassManager;

    constructor(
        templateOrParams?: string | AgElementParams<TComponentSelectorType>,
        componentSelectors?: AgComponentSelector<TComponentSelectorType, TBeanCollection>[]
    ) {
        super();

        this.cssManager = new CssClassManager(() => this.eGui);

        this.componentSelectors = new Map((componentSelectors ?? []).map((comp) => [comp.selector, comp]));
        if (templateOrParams) {
            this.setTemplate(templateOrParams);
        }
    }

    public preConstruct(): void {
        this.wireTemplate(this.getGui());
        const debugId = 'component-' + Object.getPrototypeOf(this)?.constructor?.name;
        for (const css of this.css ?? []) {
            this.beans.environment.addGlobalCSS(css, debugId);
        }
    }

    private wireTemplate(element: HTMLElement | undefined, paramsMap?: { [key: string]: any }): void {
        // ui exists if user sets template in constructor. when this happens,
        // We have to wait for the context to be autoWired first before we can create child components.
        if (element && this.gos) {
            this.applyElementsToComponent(element);
            this.createChildComponentsFromTags(element, paramsMap);
        }
    }

    public getCompId(): number {
        return this.compId;
    }

    private getDataRefAttribute(element: Element): string | null {
        if (element.getAttribute) {
            return element.getAttribute(DataRefAttribute);
        }
        // Plain text nodes don't have attributes or getAttribute method
        return null;
    }

    private applyElementsToComponent(
        element: Element,
        elementRef?: string | null,
        paramsMap?: { [key: string]: any },
        newComponent: AgBaseComponent<TBeanCollection> | null = null
    ) {
        if (elementRef === undefined) {
            elementRef = this.getDataRefAttribute(element);
        }
        if (elementRef) {
            // We store the reference to the element in the parent component under that same name
            // if there is a placeholder property with the same name.
            const current = (this as any)[elementRef];
            if (current === RefPlaceholder) {
                (this as any)[elementRef] = newComponent ?? element;
            } else {
                // Don't warn if the data-ref is used for passing parameters to the component
                const usedAsParamRef = paramsMap?.[elementRef];
                if (!this.suppressDataRefValidation && !usedAsParamRef) {
                    // This can happen because of:
                    // 1. The data-ref has a typo and doesn't match the property in the component
                    // 2. The  property is not initialised with the RefPlaceholder and should be.
                    // 3. The property is on a child component and not available on the parent during construction.
                    //    In which case you may need to pass the template via setTemplate() instead of in the super constructor.
                    // 4. The data-ref is not used by the component and should be removed from the template.
                    throw new Error(`data-ref: ${elementRef} on ${this.constructor.name} with ${current}`);
                }
            }
        }
    }

    // for registered components only, eg creates AgCheckbox instance from ag-checkbox HTML tag
    private createChildComponentsFromTags(parentNode: Element, paramsMap?: { [key: string]: any }): void {
        // we MUST take a copy of the list first, as the 'swapComponentForNode' adds comments into the DOM
        // which messes up the traversal order of the children.
        const childNodeList: Node[] = [];
        for (const childNode of parentNode.childNodes ?? []) {
            childNodeList.push(childNode);
        }

        for (const childNode of childNodeList) {
            if (!(childNode instanceof HTMLElement)) {
                continue;
            }

            const childComp = this.createComponentFromElement(
                childNode,
                (childComp) => {
                    // copy over all attributes, including css classes, so any attributes user put on the tag
                    // wll be carried across
                    const childGui = childComp.getGui();
                    if (childGui) {
                        for (const attr of childNode.attributes ?? []) {
                            childGui.setAttribute(attr.name, attr.value);
                        }
                    }
                },
                paramsMap
            );

            if (childComp) {
                if ((childComp as any).addItems && childNode.children.length) {
                    this.createChildComponentsFromTags(childNode, paramsMap);

                    // converting from HTMLCollection to Array
                    const items = Array.prototype.slice.call(childNode.children);

                    (childComp as any).addItems(items);
                }
                // replace the tag (eg ag-checkbox) with the proper HTMLElement (eg 'div') in the dom
                this.swapComponentForNode(childComp, parentNode, childNode);
            } else if (childNode.childNodes) {
                this.createChildComponentsFromTags(childNode, paramsMap);
            }
        }
    }

    private createComponentFromElement(
        element: HTMLElement,
        afterPreCreateCallback?: (comp: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>) => void,
        paramsMap?: { [key: string]: any }
    ): AgComponent<TBeanCollection, TProperties, TGlobalEvents, any> | null {
        const key = element.nodeName;

        const elementRef = this.getDataRefAttribute(element);

        const isAgGridComponent = key.indexOf('AG-') === 0;
        const componentSelector = isAgGridComponent ? this.componentSelectors.get(key as TComponentSelectorType) : null;
        let newComponent: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any> | null = null;
        if (componentSelector) {
            const componentParams = paramsMap && elementRef ? paramsMap[elementRef] : undefined;
            newComponent = new componentSelector.component(componentParams) as AgComponent<
                TBeanCollection,
                TProperties,
                TGlobalEvents,
                any
            >;
            newComponent.setParentComponent(
                this as unknown as AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>
            );

            this.createBean(newComponent, null, afterPreCreateCallback);
        } else if (isAgGridComponent) {
            throw new Error(`selector: ${key}`);
        }

        this.applyElementsToComponent(element, elementRef, paramsMap, newComponent);

        return newComponent;
    }

    private swapComponentForNode(
        newComponent: AgBaseComponent<TBeanCollection>,
        parentNode: Element,
        childNode: Node
    ): void {
        const eComponent = newComponent.getGui();
        parentNode.replaceChild(eComponent, childNode);
        parentNode.insertBefore(document.createComment(childNode.nodeName), eComponent);
        this.addDestroyFunc(this.destroyBean.bind(this, newComponent));
    }

    protected activateTabIndex(elements?: Element[], overrideTabIndex?: number): void {
        const tabIndex = overrideTabIndex ?? this.gos.get('tabIndex')!;

        if (!elements) {
            elements = [];
        }

        if (!elements.length) {
            elements.push(this.getGui());
        }

        for (const el of elements) {
            el.setAttribute('tabindex', tabIndex.toString());
        }
    }

    protected setTemplate(
        templateOrParams: AgElementParams<TComponentSelectorType> | string | null | undefined,
        componentSelectors?: AgComponentSelector<TComponentSelectorType, TBeanCollection>[],
        paramsMap?: { [key: string]: any }
    ): void {
        let eGui: HTMLElement;
        if (typeof templateOrParams === 'string' || templateOrParams == null) {
            eGui = _loadTemplate(templateOrParams);
        } else {
            eGui = _createAgElement(templateOrParams);
        }

        this.setTemplateFromElement(eGui, componentSelectors, paramsMap);
    }

    protected setTemplateFromElement(
        element: HTMLElement,
        components?: AgComponentSelector<TComponentSelectorType, TBeanCollection>[],
        paramsMap?: { [key: string]: any },
        suppressDataRefValidation = false
    ): void {
        this.eGui = element;
        this.suppressDataRefValidation = suppressDataRefValidation;
        if (components) {
            for (let i = 0; i < components.length; i++) {
                const component = components[i];
                this.componentSelectors.set(component.selector, component);
            }
        }
        this.wireTemplate(element, paramsMap);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public getFocusableElement(): HTMLElement {
        return this.eGui;
    }

    public getAriaElement(): Element {
        return this.getFocusableElement();
    }

    public setParentComponent(component: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>) {
        this.parentComponent = component;
    }

    public getParentComponent<T extends AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>>():
        | T
        | undefined {
        return this.parentComponent as T;
    }

    // this method is for older code, that wants to provide the gui element,
    // it is not intended for this to be in ag-Stack
    protected setGui(eGui: HTMLElement): void {
        this.eGui = eGui;
    }

    protected queryForHtmlElement(cssSelector: string): HTMLElement {
        return this.eGui.querySelector(cssSelector) as HTMLElement;
    }

    private getContainerAndElement(
        newChild: AgBaseComponent<TBeanCollection> | HTMLElement,
        container?: HTMLElement
    ): { element: HTMLElement; parent: HTMLElement } | null {
        let parent = container;

        if (newChild == null) {
            return null;
        }

        if (!parent) {
            parent = this.eGui;
        }

        if (_isNodeOrElement(newChild)) {
            return {
                element: newChild,
                parent,
            };
        }

        return {
            element: newChild.getGui(),
            parent,
        };
    }

    public prependChild(newChild: HTMLElement | AgBaseComponent<TBeanCollection>, container?: HTMLElement) {
        const { element, parent } = this.getContainerAndElement(newChild, container) || {};

        if (!element || !parent) {
            return;
        }

        parent.insertAdjacentElement('afterbegin', element);
    }

    public appendChild(newChild: HTMLElement | AgBaseComponent<TBeanCollection>, container?: HTMLElement): void {
        const { element, parent } = this.getContainerAndElement(newChild, container) || {};

        if (!element || !parent) {
            return;
        }

        parent.appendChild(element);
    }

    public isDisplayed(): boolean {
        return this.displayed;
    }

    public setVisible(visible: boolean, options: { skipAriaHidden?: boolean } = {}): void {
        if (visible !== this.visible) {
            this.visible = visible;
            const { skipAriaHidden } = options;
            _setVisible(this.eGui, visible, { skipAriaHidden });
        }
    }

    public setDisplayed(displayed: boolean, options: { skipAriaHidden?: boolean } = {}): void {
        if (displayed !== this.displayed) {
            this.displayed = displayed;
            const { skipAriaHidden } = options;
            _setDisplayed(this.eGui, displayed, { skipAriaHidden });

            const event: VisibleChangedEvent = {
                type: 'displayChanged',
                visible: this.displayed,
            };

            this.dispatchLocalEvent(event);
        }
    }

    public override destroy(): void {
        if (this.parentComponent) {
            this.parentComponent = undefined;
        }

        super.destroy();
    }

    public addGuiEventListener(event: string, listener: (event: any) => void, options?: AddEventListenerOptions): void {
        this.eGui.addEventListener(event, listener, options);
        this.addDestroyFunc(() => this.eGui.removeEventListener(event, listener));
    }

    public addCss(className: string): void {
        this.cssManager.toggleCss(className, true);
    }

    public removeCss(className: string): void {
        this.cssManager.toggleCss(className, false);
    }

    public toggleCss(className: string, addOrRemove: boolean): void {
        this.cssManager.toggleCss(className, addOrRemove);
    }

    protected registerCSS(css: string): void {
        this.css ||= [];
        this.css.push(css);
    }
}
