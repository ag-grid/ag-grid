import {Component} from "../../widgets/component";
import {_} from "../../utils";

export interface HtmlElementDecorable {
    withProperty(propertyName: string, propertyValue: any): this;

    withRef(ref: string): this;

    withTag(tag: string): this;

    withClass(className: string): this;

    withChild(child: HTMLElement | string | HtmlElementBuilder): this;

    withCondition (condition:boolean, ifTrue:(base:this)=>void): this;

    withEventHandler (eventName:string, handler:()=>void, element?: HTMLElement): this;

    withBase (base:HTMLElement): this;
}

export interface HtmlElementBuilder extends HtmlElementDecorable {
    build(): HTMLElement;

    withParent (parent:HtmlElementBuilder): this;
}

export class HtmlContent {
    public base:HTMLElement;
    public tagName: string;
    public properties: { [p: string]: any } = {};
    public children: HtmlElementBuilder[] = [];

    addChild(child: HtmlElementBuilder): void {
        if (child === null) throw Error(`ag-grid: Can not add null child to an HTML element`);
        this.children.push(child);
    }

    addClass(className: string): void {
        this.pushOrCreateArrayProperty('class', className);
    }

    private pushOrCreateArrayProperty(propertyName: string, value: any): void {
        if (!this.properties [propertyName]) {
            this.properties [propertyName] = [];
        }

        this.properties [propertyName].push(value);
    }

    withProperty(propertyName: string, propertyValue: any): void {
        this.properties [propertyName] = propertyValue;
    }

    withRef(ref: string): void {
        return this.withProperty('ref', ref);
    }
}

export abstract class BaseHtmlElementBuilder implements HtmlElementBuilder {
    public readonly content: HtmlContent = new HtmlContent();
    public boundTo: [Component, (element: HTMLElement) => void];
    public onDidMount: (element:HTMLElement, component:Component)=>void;
    public eventHandlers: ([string, () => void, HTMLElement]) [] = [];
    public parent:HtmlElementBuilder;

    public static fromString(template: string): BaseHtmlElementBuilder {
        let parsed = _.loadTemplate(template);
        if (parsed === null) {
            throw Error(`ag-grid: can not parse the template: ${template}`);
        }
        return this.fromHtmlElement(parsed);
    }

    public static fromHtmlElement(element: HTMLElement): BaseHtmlElementBuilder {
        class Custom extends BaseHtmlElementBuilder {
            enrich(decorable: HtmlElementDecorable): void {
                decorable
                    .withBase(element)

            }
        }

        return new Custom();
    }

    public static from(tagName: string, className: string, ref ?:string): BaseHtmlElementBuilder {
        class Custom extends BaseHtmlElementBuilder {
            enrich(decorable: HtmlElementDecorable): void {
                decorable
                    .withTag(tagName)
                    .withClass(className)
                    .withCondition(ref != null, (base)=>
                        base.withRef(ref)
                    )

            }
        }

        return new Custom();
    }

    withProperty(propertyName: string, propertyValue: any): this {
        this.content.withProperty(propertyName, propertyValue);
        return this;
    }

    withRef(ref: string): this {
        this.content.withRef(ref);
        return this;
    }


    withClass(className: string): this {
        this.content.addClass(className);
        return this;
    }

    withChild(child: HTMLElement | string | HtmlElementBuilder): this {
        let childBuilder: HtmlElementBuilder = null;
        if (typeof child === 'string') {
            childBuilder = BaseHtmlElementBuilder.fromString(child);
        } else if (_.isElement(child)){
            childBuilder = BaseHtmlElementBuilder.fromHtmlElement(<HTMLElement>child);
        } else{
            childBuilder = <HtmlElementBuilder>child;
        }

        this.content.addChild(childBuilder);
        childBuilder.withParent(this);
        return this;
    }

    withTag(tag: string): this {
        this.content.tagName = tag;
        return this;
    }

    withBinding(component: Component, enricher?: (element: HTMLElement) => void): this {
        this.boundTo = [component, enricher];
        return this;
    }

    withDidMount(callback:(element:HTMLElement, component:Component)=>void): this {
        this.onDidMount = callback;
        return this;
    }

    abstract enrich(decorable: HtmlElementDecorable): void;

    build(): HTMLElement {
        this.enrich(this);
        let thisHtmlElement = this.content.base ? this.content.base : _.loadTemplate(`<${this.content.tagName}></${this.content.tagName}>`);
        _.iterateObject(this.content.properties, (key, value) => {
            if (key === 'class') {
                thisHtmlElement.className = value.join(' ')
            } else {
                thisHtmlElement.setAttribute(key, value);
            }
        });
        this.content.children.forEach(child => thisHtmlElement.appendChild(child.build()));
        if (this.boundTo) {
            if (this.boundTo [1]) {
                this.boundTo [1](thisHtmlElement)
            }
            let component: Component = this.boundTo[0];
            component.setTemplateFromElement(thisHtmlElement);

            if (this.onDidMount){
                this.onDidMount(thisHtmlElement, component)
            }

            this.eventHandlers.forEach(refEventHandler => {
                let eventName:string = refEventHandler[0];
                let eventHandler: ()=>void = refEventHandler[1];
                let element:HTMLElement = refEventHandler[2];

                component.addDestroyableEventListener(element ? element : thisHtmlElement, eventName, eventHandler);
            });
        }

        if (this.parent){
            this.eventHandlers.forEach(refEventHandler => {
                let eventName:string = refEventHandler[0];
                let eventHandler: ()=>void = refEventHandler[1];
                let element:HTMLElement = refEventHandler[2];

                this.parent.withEventHandler(eventName, eventHandler, element ? element : thisHtmlElement)
            })
        }

        return thisHtmlElement;
    }

    withCondition(condition: boolean, ifTrue: (base: this) => void): this {
        if (condition){
            ifTrue(this);
        }
        return this;
    }

    withEventHandler(eventName: string, handler: () => void, element?:HTMLElement): this {
        this.eventHandlers.push ([eventName, handler, element]);
        return this;
    }

    withParent(parent: HtmlElementBuilder): this {
        this.parent = parent;
        return this;
    }

    withBase(base: HTMLElement): this {
        this.content.base = base;
        return this;
    }
}