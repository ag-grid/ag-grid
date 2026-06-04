import type { DomTemplate, ChildNode } from "./dom";
import { BaseComponent, type Renderer } from "./component";
import { DomElementWithChildren } from "./dom";
import { getInitialAttrsForTemplateElement } from "./dom";
import { EventDelegator } from "./event-delegator";
import { arrayOfValues } from "./utils";

export class DomRenderer implements Renderer {
  private rootEl: HTMLElement | Text | null = null;
  private childElements = new WeakMap<object, HTMLElement | Text>();
  private previousChildren = new Map<DomElementWithChildren, ChildNode[]>();
  readonly events: EventDelegator;

  constructor(
    private component: BaseComponent,
    events?: EventDelegator,
  ) {
    this.events = events ?? new EventDelegator();
  }

  mountRoot(parentEl: HTMLElement): void {
    this.#mountSubtree(parentEl);
    if (this.rootEl instanceof HTMLElement) {
      this.events.setRootElement(this.rootEl);
    }
  }

  #mountSubtree(parentEl: HTMLElement): void {
    const refNameToEl = new Map<string, HTMLElement | Text>();
    this.rootEl = this.#buildTemplate(this.component.__template, refNameToEl);
    parentEl.appendChild(this.rootEl);

    // Build and attach children before attaching our own component to the DOM,
    // so that attach order matches React's useLayoutEffect order
    for (const ref of this.component.__refs) {
      const node = refNameToEl.get(ref.name);
      if (!node) {
        throw new Error(ref.name);
      }
      if (ref instanceof DomElementWithChildren) {
        const el = node as HTMLElement;
        const children = ref.__children;
        for (const child of children) {
          if (child instanceof BaseComponent) {
            const childRenderer = new DomRenderer(child, this.events);
            childRenderer.#mountSubtree(el);
            this.childElements.set(child, childRenderer.rootEl!);
          } else {
            const childEl = this.#buildTemplate(child, refNameToEl);
            el.appendChild(childEl);
            this.childElements.set(child, childEl);
          }
        }
        if (children.length > 0) {
          this.previousChildren.set(ref, [...children]);
        }
      }
    }

    this.component.__attach(refNameToEl, this);
  }

  unmount(): void {
    this.#detachTree();
    this.rootEl?.remove();
    this.rootEl = null;
  }

  #detachTree(): void {
    for (const ref of this.component.__refs) {
      if (ref instanceof DomElementWithChildren) {
        for (const child of ref.__children) {
          if (child instanceof BaseComponent) {
            const childRenderer = child.__renderer;
            if (childRenderer instanceof DomRenderer) {
              childRenderer.#detachTree();
            }
          }
        }
      }
    }
    this.component.__detach();
  }

  onChildrenChanged(
    ref: DomElementWithChildren,
    children: Iterable<ChildNode>,
    parentEl: HTMLElement,
  ): void {
    const newChildren = Array.from(children);
    const oldChildren = this.previousChildren.get(ref) ?? [];
    let cursor: globalThis.ChildNode | null = parentEl.childNodes[0] ?? null;

    for (const child of newChildren) {
      let childEl: HTMLElement | Text | undefined =
        this.childElements.get(child);
      if (!childEl) {
        // New child — must be BaseComponent since only components can be added dynamically
        const childComponent = child as BaseComponent;
        const childRenderer = new DomRenderer(childComponent, this.events);
        childRenderer.#mountSubtree(parentEl);
        childEl = childRenderer.rootEl!;
        this.childElements.set(child, childEl);
      }

      if (cursor === childEl) {
        // Already in correct position, advance cursor
        cursor = childEl.nextSibling;
      } else {
        // Move/insert to correct position
        parentEl.insertBefore(childEl, cursor);
        // cursor stays — next child should also go before it
      }
    }

    // Remove children no longer present (must be BaseComponent since template children are structural)
    const newChildSet = new Set(newChildren);
    for (const old of oldChildren) {
      if (!newChildSet.has(old)) {
        if (old instanceof BaseComponent) {
          const renderer = old.__renderer;
          if (renderer instanceof DomRenderer) {
            renderer.unmount();
          }
          this.childElements.delete(old);
        }
      }
    }

    this.previousChildren.set(ref, newChildren);
  }

  #buildTemplate(
    template: DomTemplate,
    refNameToEl: Map<string, HTMLElement | Text>,
  ): HTMLElement | Text {
    if (!template.tag) {
      // Bare text node
      const textNode = document.createTextNode(template.text ?? "");
      if (template.ref) {
        refNameToEl.set(template.ref, textNode);
      }
      return textNode;
    }

    const { tag, ref: refName } = template;
    const el = document.createElement(tag);

    if (refName) {
      // ref elements are dynamic: register in refNameToEl, don't build children
      // (DomTemplate children are in DomChildrenRef.#children and handled by #mountSubtree)
      refNameToEl.set(refName, el);
    } else {
      // Non-ref elements are static: apply attrs and build children
      for (const [k, v] of getInitialAttrsForTemplateElement(template)) {
        el.setAttribute(k, v);
      }
      for (const child of arrayOfValues(template.children)) {
        el.appendChild(this.#buildTemplate(child, refNameToEl));
      }
    }

    return el;
  }
}
