import { type BaseComponent } from "./component";
import { arrayOfValues } from "./utils";
import {
  type HtmlElementWithRef,
  domRefElementKey,
  DELEGATED_EVENTS,
  NON_DELEGATED_EVENTS,
} from "./event-delegator";

/**
 * Type to help avoid typos, add new roles as required.
 *
 * @see https://www.w3.org/TR/wai-aria-1.2/#role_definitions
 */
export type RoleType =
  | "button"
  | "columnheader"
  | "gridcell"
  | "heading"
  | "listbox"
  | "menu"
  | "option"
  | "presentation"
  | "group"
  | "row"
  | "rowgroup"
  | "status"
  | "tab"
  | "tablist"
  | "tabpanel"
  | "treeitem";

/**
 * CSS style properties that can be set via ref.styles().
 * Keys are CSS property names (camelCase), values can be strings or numbers.
 * Numeric values are automatically converted to px.
 */
export type StyleProperties = {
  [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string
    ? K
    : never]?: string | number;
};

type DomElementTemplateBase<TRef extends string> = {
  /**
   * Reference name for this element. Used to create typed properties
   * on components that hold Ref instances.
   *
   * @example
   * ref: 'label'
   * // Creates: instance.label (Ref)
   */
  ref?: TRef;

  /**
   * Should be a single string of space-separated class names
   *
   * @example
   * cls: 'ag-header-cell ag-header-cell-sortable'
   */
  cls?: string;

  /**
   * The role attribute to add to the dom element
   */
  role?: RoleType;

  /**
   * Initial inline styles for the element
   */
  style?: StyleProperties;

  /**
   * Key Value pair of attributes to add to the dom element via
   * `element.setAttribute(key,value)`
   */
  attrs?: { [key: string]: string };
};

export type DomElementWithTextTemplate<TRef extends string = string> =
  DomElementTemplateBase<TRef> & { tag: string; text: string; children?: never };

export type DomElementWithChildrenTemplate<TRef extends string = string> =
  DomElementTemplateBase<TRef> & {
    tag: string;
    children?: (DomTemplate<TRef> | null | undefined)[];
    text?: never;
  };

// ?: never properties prevent element-only properties from being accepted on text nodes
export type DomTextNodeTemplate<TRef extends string = string> = {
  ref?: TRef;
  text: string;
  tag?: never;
  children?: never;
  cls?: never;
  role?: never;
  style?: never;
  attrs?: never;
};

/** Union of all template variants */
export type DomTemplate<TRef extends string = string> =
  | DomElementWithTextTemplate<TRef>
  | DomElementWithChildrenTemplate<TRef>
  | DomTextNodeTemplate<TRef>;

/** Element templates only (excludes bare text nodes) */
export type DomElementTemplate<TRef extends string = string> =
  | DomElementWithTextTemplate<TRef>
  | DomElementWithChildrenTemplate<TRef>;

/** Root template passed to defineComponent (ref forbidden — "gui" ref is added automatically) */
export type DomRootTemplate = DomTemplate & { ref?: never };

export type ChildNode = BaseComponent | DomTemplate;

const bannedProxyAttrs: Record<string, string> = {
  style: "styles()",
  class: "cls()",
};

const bannedTemplateAttrs: Record<string, string> = {
  style: "style",
  class: "cls",
  role: "role",
};

function throwIfBannedAttr(banned: Record<string, string>, key: string): void {
  const alt = banned[key];
  if (alt) {
    throw new Error(`attrs.${key} -> ${alt}`);
  }
}

export interface ResizeData {
  width: number;
  height: number;
}

export interface ScrollData {
  scrollTop: number;
  scrollLeft: number;
}

type ResizeCallback = (data: ResizeData) => void;
type ScrollCallback = (data: ScrollData) => void;

export class DomRef {
  readonly name: string;
  protected _owner: BaseComponent;
  #template: DomTemplate;
  protected _node: HTMLElement | Text | null = null;

  constructor(owner: BaseComponent, name: string, template: DomTemplate) {
    this.name = name;
    this._owner = owner;
    this.#template = template;
  }

  get __template(): DomTemplate {
    return this.#template;
  }

  get __owner(): BaseComponent {
    return this._owner;
  }

  __attachNode(node: HTMLElement | Text): void {
    this._node = node;
  }

  __detachNode(): void {
    this._node = null;
  }
}

export class DomElementRef extends DomRef {
  protected _el: HTMLElement | null = null;
  #attrs: Map<string, string>;
  #classes: Set<string> = new Set();
  #delegatedHandlers: Map<string, Set<() => void>> = new Map();
  #nonDelegatedHandlers: Map<string, Set<() => void>> = new Map();
  #style: Map<string, string>;
  #resizeObserver: ResizeObserver | null = null;
  #resizeCallbacks: Set<ResizeCallback> = new Set();
  #scrollCallbacks: Set<ScrollCallback> = new Set();
  #scrollHandler: ((event: Event) => void) | null = null;
  #attrsProxy: Record<string, string> | null = null;

  constructor(owner: BaseComponent, name: string, template: DomElementTemplate) {
    super(owner, name, template);
    this.#attrs = getInitialAttrsForTemplateElement(template);
    this.#style = getInitialStylesForTemplateElement(template);
  }

  // --- attrs ---

  get attrs(): Record<string, string> {
    if (!this.#attrsProxy) {
      const attrs = this.#attrs;
      this.#attrsProxy = new Proxy({} as Record<string, string>, {
        get(_target, prop: string) {
          throwIfBannedAttr(bannedProxyAttrs, prop);
          return attrs.get(prop) ?? undefined;
        },
        set: (_target, prop: string, value: string) => {
          throwIfBannedAttr(bannedProxyAttrs, prop);
          if (attrs.get(prop) === value) return true;
          attrs.set(prop, value);
          this._el?.setAttribute(prop, value);
          return true;
        },
        deleteProperty: (_target, prop: string) => {
          throwIfBannedAttr(bannedProxyAttrs, prop);
          if (!attrs.has(prop)) return true;
          attrs.delete(prop);
          this._el?.removeAttribute(prop);
          return true;
        },
      });
    }
    return this.#attrsProxy;
  }

  // --- events ---

  on(type: string, handler: () => void): void {
    if (DELEGATED_EVENTS.has(type)) {
      let handlers = this.#delegatedHandlers.get(type);
      if (!handlers) {
        handlers = new Set();
        this.#delegatedHandlers.set(type, handlers);
      }
      if (handlers.has(handler)) return;
      handlers.add(handler);
    } else if (NON_DELEGATED_EVENTS.has(type)) {
      let handlers = this.#nonDelegatedHandlers.get(type);
      if (!handlers) {
        handlers = new Set();
        this.#nonDelegatedHandlers.set(type, handlers);
      }
      if (handlers.has(handler)) return;
      handlers.add(handler);
      this._el?.addEventListener(type, handler);
    } else {
      throw new Error(
        `Unknown event type "${type}": add to DELEGATED_EVENTS or NON_DELEGATED_EVENTS`,
      );
    }
  }

  off(type: string, handler: () => void): void {
    if (DELEGATED_EVENTS.has(type)) {
      const handlers = this.#delegatedHandlers.get(type);
      if (!handlers || !handlers.has(handler)) return;
      handlers.delete(handler);
    } else if (NON_DELEGATED_EVENTS.has(type)) {
      const handlers = this.#nonDelegatedHandlers.get(type);
      if (!handlers || !handlers.has(handler)) return;
      handlers.delete(handler);
      this._el?.removeEventListener(type, handler);
    } else {
      throw new Error(
        `Unknown event type "${type}": add to DELEGATED_EVENTS or NON_DELEGATED_EVENTS`,
      );
    }
  }

  // --- class list ---

  cls(className: string, force: boolean = true): void {
    if (force) {
      if (this.#classes.has(className)) return;
      this.#classes.add(className);
      this._el?.classList.add(className);
    } else {
      if (!this.#classes.has(className)) return;
      this.#classes.delete(className);
      this._el?.classList.remove(className);
    }
  }

  hasCls(className: string): boolean {
    return this.#classes.has(className);
  }

  // --- styles ---

  styles(styles: { [key: string]: string | number }): void {
    for (const [property, rawValue] of Object.entries(styles)) {
      const value = typeof rawValue === "number" ? `${rawValue}px` : rawValue;
      if (this.#style.get(property) === value) continue;
      this.#style.set(property, value);
      if (this._el) {
        (this._el.style as any)[property] = value;
      }
    }
  }

  // --- resize/scroll observers ---

  observeResize(callback: ResizeCallback): void {
    if (this.#resizeCallbacks.has(callback)) return;
    this.#resizeCallbacks.add(callback);

    if (this._el) {
      if (!this.#resizeObserver) {
        this.#resizeObserver = new ResizeObserver(() => {
          const resizeData: ResizeData = {
            width: this._el!.clientWidth,
            height: this._el!.clientHeight,
          };
          for (const cb of this.#resizeCallbacks) {
            cb(resizeData);
          }
        });
        this.#resizeObserver.observe(this._el);
      }
    }
  }

  unobserveResize(callback: ResizeCallback): void {
    this.#resizeCallbacks.delete(callback);

    if (this.#resizeCallbacks.size === 0 && this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }
  }

  observeScroll(callback: ScrollCallback): void {
    if (this.#scrollCallbacks.has(callback)) return;
    this.#scrollCallbacks.add(callback);

    if (this._el) {
      if (!this.#scrollHandler) {
        this.#scrollHandler = () => {
          const scrollData: ScrollData = {
            scrollTop: this._el!.scrollTop,
            scrollLeft: this._el!.scrollLeft,
          };
          for (const cb of this.#scrollCallbacks) {
            cb(scrollData);
          }
        };
        this._el.addEventListener("scroll", this.#scrollHandler);
        queueMicrotask(() => {
          if (this.#scrollHandler && this._el) {
            this.#scrollHandler(new Event("scroll"));
          }
        });
      }
    }
  }

  unobserveScroll(callback: ScrollCallback): void {
    this.#scrollCallbacks.delete(callback);

    if (this.#scrollCallbacks.size === 0 && this.#scrollHandler && this._el) {
      this._el.removeEventListener("scroll", this.#scrollHandler);
      this.#scrollHandler = null;
    }
  }

  // --- internal __ methods (framework use only) ---

  override __attachNode(node: HTMLElement | Text): void {
    super.__attachNode(node);
    const el = node as HTMLElement;
    this._el = el;

    // Store back-reference from element to ref
    const elWithRef: HtmlElementWithRef = el;
    elWithRef[domRefElementKey] = this;

    // Apply all attrs to DOM
    for (const [key, value] of this.#attrs) {
      el.setAttribute(key, value);
    }

    // Apply classes to DOM via classList
    if (this.#classes.size > 0) {
      el.classList.add(...this.#classes);
    }

    // Apply styles
    for (const [property, value] of this.#style) {
      (el.style as any)[property] = value;
    }

    // Apply pending non-delegated event handlers (delegated are handled by EventDelegator)
    for (const [type, handlers] of this.#nonDelegatedHandlers) {
      for (const handler of handlers) {
        el.addEventListener(type, handler);
      }
    }

    // Set up resize observer if there are callbacks
    if (this.#resizeCallbacks.size > 0) {
      this.#resizeObserver = new ResizeObserver(() => {
        const resizeData: ResizeData = {
          width: el.clientWidth,
          height: el.clientHeight,
        };
        for (const callback of this.#resizeCallbacks) {
          callback(resizeData);
        }
      });
      this.#resizeObserver.observe(el);
    }

    // Set up scroll handler if there are callbacks
    if (this.#scrollCallbacks.size > 0) {
      this.#scrollHandler = () => {
        const scrollData: ScrollData = {
          scrollTop: el.scrollTop,
          scrollLeft: el.scrollLeft,
        };
        for (const callback of this.#scrollCallbacks) {
          callback(scrollData);
        }
      };
      el.addEventListener("scroll", this.#scrollHandler);
      // Fire initial scroll position via microtask
      queueMicrotask(() => {
        if (this.#scrollHandler && this._el) {
          this.#scrollHandler(new Event("scroll"));
        }
      });
    }
  }

  override __detachNode(): void {
    if (this._el) {
      // Remove element→ref back-reference
      const elWithRef: HtmlElementWithRef = this._el;
      delete elWithRef[domRefElementKey];

      // Remove per-element listeners for non-delegated events only
      for (const [type, handlers] of this.#nonDelegatedHandlers) {
        for (const handler of handlers) {
          this._el.removeEventListener(type, handler);
        }
      }

      // Clean up resize observer
      if (this.#resizeObserver) {
        this.#resizeObserver.disconnect();
        this.#resizeObserver = null;
      }

      // Clean up scroll handler
      if (this.#scrollHandler) {
        this._el.removeEventListener("scroll", this.#scrollHandler);
        this.#scrollHandler = null;
      }
    }
    this._el = null;
    super.__detachNode();
  }

  __dispatchDelegated(type: string): void {
    const handlers = this.#delegatedHandlers.get(type);
    if (handlers) {
      for (const handler of handlers) {
        handler();
      }
    }
  }
}

/**
 * A ref that manages text content directly via el.textContent.
 * No renderer involvement — sets text imperatively.
 */
export class DomElementWithText extends DomElementRef {
  #text: string;

  constructor(owner: BaseComponent, name: string, template: DomElementWithTextTemplate) {
    super(owner, name, template);
    this.#text = template.text ?? "";
  }

  get text(): string {
    return this.#text;
  }

  set text(value: string) {
    if (this.#text === value) return;
    this.#text = value;
    if (this._el) {
      this._el.textContent = value;
    }
  }

  override __attachNode(node: HTMLElement | Text): void {
    super.__attachNode(node);
    (node as HTMLElement).textContent = this.#text;
  }
}

/**
 * A ref for a bare Text node (no tag). Only supports getting/setting text.
 */
export class DomTextNode extends DomRef {
  #text: string;

  constructor(owner: BaseComponent, name: string, template: DomTextNodeTemplate) {
    super(owner, name, template);
    this.#text = template.text ?? "";
  }

  get text(): string {
    return this.#text;
  }

  /**
   * Set the text of the node
   *
   * IMPORTANT: This is synchronous in the DOM renderer, but asynchronous React.
   */
  set text(value: string) {
    if (this.#text === value) return;
    this.#text = value;
    if (this._node instanceof Text) {
      this._node.data = value;
    }
    this._owner.__renderer?.onTextChanged?.();
  }

  override __attachNode(node: HTMLElement | Text): void {
    super.__attachNode(node);
    (node as Text).data = this.#text;
  }
}

export type ChildAnchor = BaseComponent | DomRef;

/**
 * A ref that manages component children via the renderer.
 */
export class DomElementWithChildren extends DomElementRef {
  #children: ChildNode[] = [];

  constructor(owner: BaseComponent, name: string, template: DomElementWithChildrenTemplate) {
    super(owner, name, template);
    for (const child of arrayOfValues(template.children)) {
      this.#children.push(child);
    }
  }

  get __children(): readonly ChildNode[] {
    return this.#children;
  }

  add(
    child: BaseComponent,
    options?: { before?: ChildAnchor; after?: ChildAnchor },
  ): void {
    if (options?.before) {
      // Insert before
      const otherIndex = this.#resolveAnchorIndex(options.before);

      const existingIndex = this.#children.indexOf(child);

      if (existingIndex !== -1) {
        if (existingIndex === otherIndex - 1) return;
        this.#children.splice(existingIndex, 1);
        const newOtherIndex = this.#resolveAnchorIndex(options.before);
        this.#children.splice(newOtherIndex, 0, child);
        this.#notifyChildrenChanged();
        return;
      }

      const parentRef = child.__parent;
      if (parentRef) {
        parentRef.__removeChild(child);
      }

      const insertIndex = this.#resolveAnchorIndex(options.before);
      this.#children.splice(insertIndex, 0, child);
      child.__parent = this;

      this.#notifyChildrenChanged();
    } else if (options?.after) {
      // Insert after
      const otherIndex = this.#resolveAnchorIndex(options.after);

      const existingIndex = this.#children.indexOf(child);

      if (existingIndex !== -1) {
        if (existingIndex === otherIndex + 1) return;
        this.#children.splice(existingIndex, 1);
        const newOtherIndex = this.#resolveAnchorIndex(options.after);
        this.#children.splice(newOtherIndex + 1, 0, child);
        this.#notifyChildrenChanged();
        return;
      }

      const parentRef = child.__parent;
      if (parentRef) {
        parentRef.__removeChild(child);
      }

      const insertIndex = this.#resolveAnchorIndex(options.after);
      this.#children.splice(insertIndex + 1, 0, child);
      child.__parent = this;

      this.#notifyChildrenChanged();
    } else {
      // Append
      const existingIndex = this.#children.indexOf(child);

      if (existingIndex !== -1) {
        if (existingIndex === this.#children.length - 1) return;
        this.#children.splice(existingIndex, 1);
        this.#children.push(child);
        this.#notifyChildrenChanged();
        return;
      }

      const parentRef = child.__parent;
      if (parentRef) {
        parentRef.__removeChild(child);
      }

      this.#children.push(child);
      child.__parent = this;

      this.#notifyChildrenChanged();
    }
  }

  __removeChild(child: BaseComponent): void {
    const index = this.#children.indexOf(child);
    if (index === -1) return;

    this.#children.splice(index, 1);
    child.__parent = null;

    this.#notifyChildrenChanged();
  }

  #resolveAnchorIndex(anchor: ChildAnchor): number {
    let index: number;
    if (anchor instanceof DomRef) {
      index = this.#children.indexOf(anchor.__template);
    } else {
      index = this.#children.indexOf(anchor);
    }
    if (index === -1) {
      throw new Error("anchor is not a child of ref");
    }
    return index;
  }

  #notifyChildrenChanged(): void {
    const renderer = this._owner.__renderer;
    if (renderer) {
      renderer.onChildrenChanged(this, this.#children, this._el!);
    }
  }
}

// --- Template helpers ---

export function getInitialAttrsForTemplateElement({
  cls,
  role,
  attrs,
}: DomElementTemplate): Map<string, string> {
  const combined = new Map<string, string>();

  if (attrs) {
    for (const key of Object.keys(attrs)) {
      throwIfBannedAttr(bannedTemplateAttrs, key);
      combined.set(key, attrs[key]);
    }
  }
  if (cls) combined.set("class", cls);
  if (role) combined.set("role", role);
  return combined;
}

function getInitialStylesForTemplateElement(
  el: DomElementTemplate,
): Map<string, string> {
  const styles = new Map<string, string>();

  // FIXME shouldn't happen here, if we support numbers let's have one place we handle the px logic
  if (el.style) {
    for (const [key, rawValue] of Object.entries(el.style)) {
      if (rawValue != null) {
        const value = typeof rawValue === "number" ? `${rawValue}px` : rawValue;
        styles.set(key, value);
      }
    }
  }

  return styles;
}
