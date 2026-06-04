import {
  createContext,
  createElement,
  createRef,
  memo,
  useContext,
  useLayoutEffect,
  useReducer,
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { BaseComponent } from "./component";
import type { DomTemplate } from "./dom";
import { DomElementWithChildren, DomTextNode } from "./dom";
import { getInitialAttrsForTemplateElement } from "./dom";
import { EventDelegator } from "./event-delegator";
import { arrayOfValues } from "./utils";

type ComponentRendererProps = {
  component: BaseComponent;
  isRoot?: boolean;
};

type ComponentRenderer = (props: ComponentRendererProps) => ReactNode;

const DelegationContext = createContext<EventDelegator | null>(null);

const namedRendererCache = new Map<string, ComponentRenderer>();

const childKeys = new WeakMap<object, number>();
let nextChildKey = 0;
function getChildKey(child: object): number {
  let key = childKeys.get(child);
  if (key === undefined) {
    key = nextChildKey++;
    childKeys.set(child, key);
  }
  return key;
}

function getNamedComponentRenderer(name: string) {
  let renderer = namedRendererCache.get(name);
  if (!renderer) {
    function ComponentNode({
      component,
      isRoot,
    }: ComponentRendererProps): ReactNode {
      const [, forceUpdate] = useReducer((x) => x + 1, 0);

      const delegator = useContext(DelegationContext)!;

      // Map from ref name to React ref object, created once
      const refMapRef = useRef<Map<
        string,
        RefObject<HTMLElement | null>
      > | null>(null);
      if (!refMapRef.current) {
        refMapRef.current = new Map();
        // Pre-populate for all refs in the component (skip text node refs — React manages those)
        for (const ref of component.__refs) {
          if (!(ref instanceof DomTextNode)) {
            refMapRef.current.set(ref.name, createRef<HTMLElement | null>());
          }
        }
      }
      const refNameToReactRef = refMapRef.current;

      useLayoutEffect(() => {
        // DOM already created by React - build elements map and attach
        const elements = new Map<string, HTMLElement | Text>();
        for (const [refName, reactRef] of refNameToReactRef) {
          if (reactRef.current) {
            elements.set(refName, reactRef.current);
          }
        }
        component.__attach(elements, {
          onChildrenChanged: () => forceUpdate(),
          onTextChanged: () => forceUpdate(),
          events: delegator,
          flushSync,
        });

        // Root component sets delegator root element
        if (isRoot) {
          const rootRefName = component.__template.ref!;
          const rootEl = refNameToReactRef.get(rootRefName)?.current;
          if (rootEl) {
            delegator.setRootElement(rootEl);
          }
        }

        return () => {
          component.__detach();
        };
      }, [component, refNameToReactRef, forceUpdate, delegator, isRoot]);

      return renderTemplateElement(
        component,
        component.__template,
        refNameToReactRef,
      );
    }
    renderer = Object.assign(memo(ComponentNode), { displayName: name });
    namedRendererCache.set(name, renderer);
  }
  return renderer;
}

/**
 * Render an agStack component as a React element with a proper display name.
 */
export function renderComponent(component: BaseComponent): ReactElement {
  const delegator = new EventDelegator();
  const Renderer = getNamedComponentRenderer(component.constructor.name);

  return createElement(
    DelegationContext.Provider,
    { value: delegator },
    createElement(Renderer, { component, isRoot: true }),
  );
}

function renderTemplateElement(
  component: BaseComponent,
  template: DomTemplate,
  refNameToReactRef: Map<string, RefObject<HTMLElement | null>>,
  key?: number,
): ReactNode {
  // Bare text node (no tag)
  if (!template.tag) {
    if (template.ref) {
      // Ref'd tagless text: React manages the text content
      const refObj = (component as any)[template.ref] as DomTextNode;
      return refObj.text;
    }
    // Unreffed tagless text: static string child
    return template.text;
  }

  const { tag, ref: refName } = template;
  const props: Record<string, unknown> = {};

  if (key !== undefined) {
    props.key = key;
  }

  const childElements: ReactNode[] = [];

  if (refName) {
    // ref elements are dynamic, DomRef manages their attributes imperatively
    const refObj = (component as any)[refName];
    props.ref = refNameToReactRef.get(refName);

    // Only render children for DomChildrenRef instances
    if (refObj instanceof DomElementWithChildren) {
      for (const child of refObj.__children) {
        if (child instanceof BaseComponent) {
          const ChildRenderer = getNamedComponentRenderer(
            child.constructor.name,
          );
          childElements.push(
            <ChildRenderer key={getChildKey(child)} component={child} />,
          );
        } else {
          // DomTemplate child
          childElements.push(
            renderTemplateElement(
              component,
              child,
              refNameToReactRef,
              getChildKey(child),
            ),
          );
        }
      }
    }
  } else {
    // element without ref: attributes set by react and never change
    for (const [k, v] of getInitialAttrsForTemplateElement(template)) {
      if (k === "class") {
        props.className = v;
      } else {
        props[k] = v;
      }
    }
    // Add static template children
    for (const child of arrayOfValues(template.children)) {
      childElements.push(
        renderTemplateElement(component, child, refNameToReactRef),
      );
    }
  }

  return createElement(tag, props, ...childElements);
}
