/// <reference path="vElement.ts" />
/// <reference path="../utils.ts" />

module ag.vdom {

    var _ = ag.grid.Utils;

    export class VHtmlElement extends VElement {

        private type: string;
        private classes: string[];
        private eventListeners: VEventListener[];
        private attributes: {[key: string]: string};
        private children: VElement[];
        private innerHtml: string;
        private style = <any>{};

        private bound: boolean;
        private element: HTMLElement;

        constructor(type: string) {
            super();
            this.type = type;
        }

        public getElement(): HTMLElement {
            return this.element;
        }

        public setInnerHtml(innerHtml: string): void {
            if (this.bound) {
                this.element.innerHTML = innerHtml;
            } else {
                this.innerHtml = innerHtml;
            }
        }

        public addStyles(styles: any): void {
            if (!styles) {
                return;
            }
            if (!this.bound && !this.style) {
                this.style = {};
            }
            _.iterateObject(styles, (key: string, value: string)=> {
                if (this.bound) {
                    var style = <any> this.element.style;
                    style[key] = value;
                } else {
                    this.style[key] = value;
                }
            });
        }

        private attachEventListeners(node: Node): void {
            if (!this.eventListeners) {
                return;
            }
            for (var i = 0; i<this.eventListeners.length; i++) {
                var listener = this.eventListeners[i];
                node.addEventListener(listener.event, listener.listener);
            }
        }

        public addClass(newClass: string): void {
            if (this.bound) {
                _.addCssClass(this.element, newClass);
            } else {
                if (!this.classes) {
                    this.classes = [];
                }
                this.classes.push(newClass);
            }
        }

        public removeClass(oldClass: string): void {
            if (this.bound) {
                _.removeCssClass(this.element, oldClass);
            } else {
                if (!this.classes) {
                    return;
                }
                while (this.classes.indexOf(oldClass)>=0) {
                    _.removeFromArray(this.classes, oldClass);
                }
            }
        }

        public addClasses(classes: string[]): void {
            if (!classes || classes.length <= 0) {
                return;
            }
            if (this.bound) {
                for (var i = 0; i<classes.length; i++) {
                    _.addCssClass(this.element, classes[i])
                }
            } else {
                if (!this.classes) {
                    this.classes = [];
                }
                for (var j = 0; j<classes.length; j++) {
                    this.classes.push(classes[j]);
                }
            }
        }

        public toHtmlString(): string {
            var buff = '';

            // opening element
            buff += '<' + this.type + ' v_element_id="'+this.getId()+'" ';
            buff += this.toHtmlStringClasses();
            buff += this.toHtmlStringAttributes();
            buff += this.toHtmlStringStyles();
            buff += '>';

            // contents
            if (this.innerHtml) {
                buff += this.innerHtml;
            }
            buff += this.toHtmlStringChildren();

            // closing element
            buff += '</' + this.type + '>';

            return buff;
        }

        private toHtmlStringChildren(): string {
            if (!this.children) {
                return '';
            }
            var result = '';
            for (var i = 0; i<this.children.length; i++) {
                result += this.children[i].toHtmlString();
            }
            return result;
        }

        private toHtmlStringAttributes(): string {
            if (!this.attributes) {
                return '';
            }
            var result = '';
            _.iterateObject(this.attributes, (key: string, value: string)=> {
                result += ' ' + key + '="'+value+'"';
            });
            return result;
        }

        private toHtmlStringClasses(): string {
            if (!this.classes) {
                return '';
            }
            return ' class="'+this.classes.join(' ')+'"';
        }

        private toHtmlStringStyles(): string {
            var result = ' style="';
            var atLeastOne = false;
            _.iterateObject(this.style, (key: string, value: string)=> {
                result += ' ' + key + ': '+value+';';
                atLeastOne = true;
            });
            result += '"';
            if (atLeastOne) {
                return result;
            } else {
                return '';
            }
        }

        public appendChild(child: any) {
            if (this.bound) {
                if (_.isNodeOrElement(child)){
                    this.element.appendChild(child);
                } else {
                    console.error('cannot appendChild with virtual child to already bound VHTMLElement');
                }
            } else {
                if (!this.children) {
                    this.children = [];
                }
                if (_.isNodeOrElement(child)) {
                    this.children.push(new VWrapperElement(child));
                } else {
                    this.children.push(child);
                }
            }
        }

        public setAttribute(key: string, value: string) {
            if (this.bound) {
                this.element.setAttribute(key, value);
            } else {
                if (!this.attributes) {
                    this.attributes = {};
                }
                this.attributes[key] = value;
            }
        }

        public addEventListener(event: string, listener: EventListener) {
            if (this.bound) {
                this.element.addEventListener(event, listener);
            } else {
                if (!this.eventListeners) {
                    this.eventListeners = [];
                }
                var entry = new VEventListener(event, listener);
                this.eventListeners.push(entry);
            }
        }

        public elementAttached(element: Element): void {
            super.elementAttached(element);
            this.element = <HTMLElement> element;
            this.attachEventListeners(element);
            this.fireElementAttachedToChildren(element);
            this.bound = true;
        }

        public fireElementAttachedToChildren(element: Element) {
            if (!this.children) {
                return;
            }
            for (var i = 0; i<this.children.length; i++) {
                var child = this.children[i];
                var childElement = element.querySelector('[v_element_id="'+child.getId()+'"]');
                child.elementAttached(childElement);
            }
        }
    }

    class VEventListener {
        constructor(public event: string, public listener: EventListener) {}
    }
}