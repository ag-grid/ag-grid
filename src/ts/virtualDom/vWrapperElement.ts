/// <reference path="vElement.ts" />

module awk.vdom {

    export class VWrapperElement extends VElement {

        private wrappedElement: Element;

        constructor(wrappedElement: Element) {
            super();
            this.wrappedElement = wrappedElement;
        }

        public toHtmlString(): string {
            return '<span v_element_id="' + this.getId() + '"></span>';
        }

        public elementAttached(element: Element) {
            var parent = element.parentNode;
            parent.insertBefore(this.wrappedElement, element);
            parent.removeChild(element);
        }

    }

}