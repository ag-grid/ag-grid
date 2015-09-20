/// <reference path="../utils.ts" />

module ag.vdom {

    var _ = ag.grid.Utils;

    export class VElement {

        static idSequence = 0;

        private id: number;

        private elementAttachedListeners: {(element: Element): void} [];

        constructor() {
            this.id = VElement.idSequence++;
        }

        public getId(): number {
            return this.id;
        }

        public addElementAttachedListener(listener: (element: Element)=>void) {
            if (!this.elementAttachedListeners) {
                this.elementAttachedListeners = [];
            }
            this.elementAttachedListeners.push(listener);
        }

        protected fireElementAttached(element: Element) {
            if (!this.elementAttachedListeners) {
                return;
            }
            for (var i = 0; i<this.elementAttachedListeners.length; i++) {
                var listener = this.elementAttachedListeners[i];
                listener(element);
            }
        }

        // abstract
        public elementAttached(element: Element) {
            this.fireElementAttached(element);
        }

        public toHtmlString(): string { return null; }

    }

}