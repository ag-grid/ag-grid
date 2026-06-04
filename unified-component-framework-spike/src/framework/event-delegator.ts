import type { DomElementRef } from "./dom";

export const DELEGATED_EVENTS: ReadonlySet<string> = new Set([
  "click",
  "dblclick",
  "mousedown",
  "mouseup",
  "mousemove",
  "contextmenu",
  "keydown",
  "focusin",
  "focusout",
  "change",
  "input",
  "submit",
  "paste",
  "touchstart",
  "touchmove",
  "touchend",
  "dragstart",
  "dragover",
  "dragenter",
  "dragleave",
  "drop",
  "transitionstart",
  "transitionend",
  "animationstart",
  "animationend",
]);

export const NON_DELEGATED_EVENTS: ReadonlySet<string> = new Set([
  "focus",
  "blur",
  "mouseenter",
  "mouseleave",
  "pointerenter",
  "pointerleave",
  "scroll",
  "scrollend",
  "load",
  "error",
  "resize",
]);

export const domRefElementKey = Symbol("domRef");

export type HtmlElementWithRef = HTMLElement & {
  [domRefElementKey]?: DomElementRef;
};

export function __refFromElement(el: HtmlElementWithRef): DomElementRef | null {
  return el[domRefElementKey] ?? null;
}

export class EventDelegator {
  #rootEl: HTMLElement | null = null;

  setRootElement(el: HTMLElement): void {
    this.#rootEl = el;
    for (const type of DELEGATED_EVENTS) {
      el.addEventListener(type, (e) => this.#dispatch(e));
    }
  }

  #dispatch(event: Event): void {
    let el = event.target as HtmlElementWithRef | null;
    while (el && el !== this.#rootEl?.parentElement) {
      const ref = el[domRefElementKey];
      if (ref) {
        ref.__dispatchDelegated(event.type);
      }
      el = el.parentElement as HtmlElementWithRef | null;
    }
  }
}
