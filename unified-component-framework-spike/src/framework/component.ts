import type {
  DomTemplate,
  DomRootTemplate,
  DomTextNodeTemplate,
  DomElementWithTextTemplate,
  ChildNode,
} from "./dom";
import {
  DomRef,
  DomElementRef,
  DomElementWithText,
  DomElementWithChildren,
  DomTextNode,
} from "./dom";
import type { EventDelegator } from "./event-delegator";
import { arrayOfValues } from "./utils";

export type FlushSyncFunction = <T>(fn: () => T) => T;

export interface Renderer {
  onChildrenChanged(
    ref: DomElementWithChildren,
    children: Iterable<ChildNode>,
    parentEl: HTMLElement,
  ): void;
  onTextChanged?(): void;
  events: EventDelegator;
  flushSync?: FlushSyncFunction;
}

function createRef(
  owner: BaseComponent,
  name: string,
  template: DomTemplate,
): DomRef {
  if (template.tag === undefined) {
    return new DomTextNode(owner, name, template);
  }
  if (template.text !== undefined) {
    return new DomElementWithText(owner, name, template);
  }
  return new DomElementWithChildren(owner, name, template);
}

/**
 * Base component class that all components extend.
 */
export class BaseComponent {
  #template: DomTemplate;
  #refs: DomRef[];
  #renderer: Renderer | null = null;
  #parentRef: DomElementWithChildren | null = null;

  constructor(template: DomTemplate) {
    this.#template = template;
    this.#refs = [];

    // Create gui — the root reference, always present
    const guiRef = createRef(this, "gui", template);
    (this as any).gui = guiRef;
    this.#refs.push(guiRef);

    // Walk children to create remaining DomRefs
    const setRefs = (templateNode: DomTemplate) => {
      if (templateNode.ref) {
        const ref = createRef(this, templateNode.ref, templateNode);
        (this as any)[templateNode.ref] = ref;
        this.#refs.push(ref);
      }
      for (const child of arrayOfValues(templateNode.children)) {
        setRefs(child);
      }
    };
    for (const child of arrayOfValues(template.children)) {
      setRefs(child);
    }
  }

  get parent(): DomElementWithChildren | null {
    return this.#parentRef;
  }

  remove(): void {
    if (this.#parentRef) {
      this.#parentRef.__removeChild(this);
    }
  }

  flushSync<T>(fn: () => T): T {
    const impl = this.#renderer?.flushSync;
    if (impl) {
      return impl(fn);
    }
    return fn();
  }

  // --- __ internal methods/getters (framework use only) ---

  __attach(
    elements: Map<string, HTMLElement | Text>,
    renderer: Renderer,
  ): void {
    for (const ref of this.#refs) {
      const node = elements.get(ref.name);
      if (!node) {
        // DomTextNode in React: React manages the text node, skip
        if (ref instanceof DomTextNode) continue;
        throw new Error(ref.name);
      }
      ref.__attachNode(node);
    }
    this.#renderer = renderer;
  }

  __detach(): void {
    for (const ref of this.#refs) {
      ref.__detachNode();
    }
    this.#renderer = null;
  }

  get __refs(): DomRef[] {
    return this.#refs;
  }

  get __template(): DomTemplate {
    return this.#template;
  }

  get __renderer(): Renderer | null {
    return this.#renderer;
  }

  get __parent(): DomElementWithChildren | null {
    return this.#parentRef;
  }

  set __parent(ref: DomElementWithChildren | null) {
    this.#parentRef = ref;
  }
}

// Map a single template node to the correct DomRef subclass
type RefType<T extends DomTemplate> = T extends DomTextNodeTemplate
  ? DomTextNode
  : T extends DomElementWithTextTemplate
    ? DomElementWithText
    : DomElementWithChildren;

// Walk the template tree, collecting { [refName]: RefType<node> } via intersection
type CollectRefs<T extends DomTemplate> = (T extends {
  ref: infer R extends string;
}
  ? { [K in R]: RefType<T> }
  : {}) &
  CollectChildRefs<T extends { children: readonly any[] } ? T["children"] : []>;

type CollectChildRefs<C extends readonly any[]> = C extends readonly [
  infer First,
  ...infer Rest extends readonly any[],
]
  ? (First extends DomTemplate ? CollectRefs<First> : {}) &
      CollectChildRefs<Rest>
  : {};

export type Component<TRefs extends string> = {
  readonly [K in TRefs | "gui"]: DomElementRef;
} & BaseComponent;

export type ComponentClass<TRefs extends string> = new () => Component<TRefs>;

export function defineComponent<const T extends DomRootTemplate>(
  template: T,
): new () => { gui: RefType<T> } & CollectRefs<T> & BaseComponent {
  const storedTemplate: DomTemplate = { ...template, ref: "gui" };

  return class extends BaseComponent {
    constructor() {
      super(storedTemplate);
    }
  } as any;
}
