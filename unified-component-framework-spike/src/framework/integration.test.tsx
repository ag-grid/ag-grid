import { test, expect, beforeEach, afterEach, describe } from "bun:test";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Window } from "happy-dom";
import { defineComponent } from "./component";
import { DomRenderer } from "./dom-renderer";
import { renderComponent } from "./react-renderer";
import type { BaseComponent } from "./component";
import {
  DomElementRef,
  DomElementWithText,
  DomElementWithChildren,
  DomTextNode,
} from "./dom";
import type { DomTemplate } from "./dom";

interface RendererConfig {
  name: string;
  mount: (component: BaseComponent) => { unmount: () => void };
}

const configs: RendererConfig[] = [
  {
    name: "DomRenderer",
    mount: (component) => {
      new DomRenderer(component).mountRoot(document.body);
      return {
        unmount: () => (component.__renderer as DomRenderer).unmount(),
      };
    },
  },
  {
    name: "ReactRenderer",
    mount: (component) => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      flushSync(() => root.render(renderComponent(component)));
      return {
        unmount: () => {
          root.unmount();
          container.remove();
        },
      };
    },
  },
];

describe.each(configs)("$name", ({ mount }) => {
  beforeEach(createTestDOM);

  test("click events bubble from child to parent", () => {
    const parent = new Test("P");
    const child = new Test("c");
    parent.gui.add(child);

    const calls: string[] = [];
    parent.gui.on("click", () => calls.push("parent"));
    child.gui.on("click", () => calls.push("child"));

    mount(parent);
    getByTestId("c").click();

    expect(calls).toEqual(["child", "parent"]);
  });

  test("focus events do not bubble from child to parent", () => {
    const parent = new Test("P");
    const child = new Test("c");
    parent.gui.add(child);

    child.gui.attrs.tabindex = "0";
    const calls: string[] = [];
    parent.gui.on("focus", () => calls.push("parent"));
    child.gui.on("focus", () => calls.push("child"));

    mount(parent);
    getByTestId("c").focus();

    expect(calls).toEqual(["child"]);
  });

  // --- Child management tests ---

  test("parent with child: child added before mount", () => {
    const parent = new Test("P");
    const child = new Test("c");

    parent.gui.add(child);
    mount(parent);

    expect(dumpDom()).toBe("P(c)");
  });

  test("parent with child: child added after mount", async () => {
    const parent = new Test("P");
    mount(parent);

    const child = new Test("c");
    parent.gui.add(child);
    await waitForRender();

    expect(dumpDom()).toBe("P(c)");
  });

  test("unmount removes DOM", () => {
    const parent = new Test("P");
    const child = new Test("c");
    parent.gui.add(child);
    const { unmount } = mount(parent);

    expect(dumpDom()).toBe("P(c)");

    unmount();

    expect(queryByTestId("P")).toBeNull();
    expect(queryByTestId("c")).toBeNull();
  });

  test("remount after unmount", () => {
    const parent = new Test("P");
    const child = new Test("c");
    parent.gui.add(child);

    const { unmount } = mount(parent);
    unmount();

    mount(parent);

    expect(dumpDom()).toBe("P(c)");
  });

  test("remove child removes its DOM", async () => {
    const parent = new Test("P");
    const child = new Test("c");
    parent.gui.add(child);
    mount(parent);

    expect(dumpDom()).toBe("P(c)");

    child.remove();
    await waitForRender();

    expect(dumpDom()).toBe("P");
    expect(queryByTestId("c")).toBeNull();
  });

  test("double-add child is no-op", () => {
    const parent = new Test("P");
    const child = new Test("c");

    parent.gui.add(child);
    parent.gui.add(child);

    mount(parent);

    expect(dumpDom()).toBe("P(c)");
  });

  test("nested children render correctly", () => {
    const parent = new Test("a");
    const child = new Test("b");
    const grandchild = new Test("c");

    child.gui.add(grandchild);
    parent.gui.add(child);
    mount(parent);

    expect(dumpDom()).toBe("a(b(c))");
  });

  test("DomTextRef sets text before mount", () => {
    class TextComp extends defineComponent({
      tag: "div",
      text: "",
      attrs: { "data-testid": "text-comp" },
    }) {}

    const comp = new TextComp();
    comp.gui.text = "hello";
    mount(comp);

    expect(getByTestId("text-comp").textContent).toBe("hello");
  });

  test("DomTextRef sets text after mount", async () => {
    class TextComp extends defineComponent({
      tag: "div",
      text: "",
      attrs: { "data-testid": "text-comp" },
    }) {}

    const comp = new TextComp();
    mount(comp);

    expect(getByTestId("text-comp").textContent).toBe("");

    comp.gui.text = "updated";
    await waitForRender();

    expect(getByTestId("text-comp").textContent).toBe("updated");
  });

  test("DomChildrenRef has no text property", () => {
    const comp = new Test("P");
    expect("text" in comp.gui).toBe(false);
  });

  test("ref.styles() and template.style work correctly", () => {
    class StyledComp extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "styled" },
      style: { width: 100, display: "block" },
    }) {
      updateStyles(visible: boolean) {
        this.gui.styles({
          display: visible ? "block" : "none",
          backgroundColor: "red",
          marginTop: 10,
        });
      }
    }

    const comp = new StyledComp();
    mount(comp);
    const div = getByTestId("styled");

    expect(div.style.width).toBe("100px");
    expect(div.style.display).toBe("block");

    comp.updateStyles(false);
    expect(div.style.display).toBe("none");
    expect(div.style.backgroundColor).toBe("red");
    expect(div.style.marginTop).toBe("10px");

    comp.updateStyles(true);
    expect(div.style.display).toBe("block");
  });

  // --- Ordering tests ---

  test("appendChild moves existing child to end", async () => {
    const parent = new Test("P");
    const a = new Test("a");
    const b = new Test("b");
    const c = new Test("c");

    parent.gui.add(a);
    parent.gui.add(b);
    parent.gui.add(c);
    mount(parent);

    expect(dumpDom()).toBe("P(a,b,c)");

    parent.gui.add(a);
    await waitForRender();

    expect(dumpDom()).toBe("P(b,c,a)");
  });

  test("insertChildBefore at correct position", async () => {
    const parent = new Test("P");
    const a = new Test("a");
    const c = new Test("c");

    parent.gui.add(a);
    parent.gui.add(c);
    mount(parent);

    const b = new Test("b");
    parent.gui.add(b, { before: c });
    await waitForRender();

    expect(dumpDom()).toBe("P(a,b,c)");
  });

  test("insertChildAfter at correct position", async () => {
    const parent = new Test("P");
    const a = new Test("a");
    const c = new Test("c");

    parent.gui.add(a);
    parent.gui.add(c);
    mount(parent);

    const b = new Test("b");
    parent.gui.add(b, { after: a });
    await waitForRender();

    expect(dumpDom()).toBe("P(a,b,c)");
  });

  test("insertChildBefore same-parent reorder", async () => {
    const parent = new Test("P");
    const a = new Test("a");
    const b = new Test("b");
    const c = new Test("c");

    parent.gui.add(a);
    parent.gui.add(b);
    parent.gui.add(c);
    mount(parent);

    parent.gui.add(c, { before: a });
    await waitForRender();

    expect(dumpDom()).toBe("P(c,a,b)");
  });

  test("removeFromParent removes from parent", async () => {
    const parent = new Test("P");
    const child = new Test("c");

    parent.gui.add(child);
    mount(parent);

    expect(dumpDom()).toBe("P(c)");
    expect(child.parent).toBe(parent.gui);

    child.remove();
    await waitForRender();

    expect(dumpDom()).toBe("P");
    expect(child.parent).toBeNull();
  });

  test("cross-parent move with appendChild", async () => {
    const root = new Test("R");
    const p1 = new Test("p1");
    const p2 = new Test("p2");
    const child = new Test("c");

    root.gui.add(p1);
    root.gui.add(p2);
    p1.gui.add(child);
    mount(root);

    expect(dumpDom()).toBe("R(p1(c),p2)");

    p2.gui.add(child);
    await waitForRender();

    expect(dumpDom()).toBe("R(p1,p2(c))");
  });

  test("cross-parent move with insertChildBefore", async () => {
    const root = new Test("R");
    const p1 = new Test("p1");
    const p2 = new Test("p2");
    const a = new Test("a");
    const b = new Test("b");
    const c = new Test("c");

    root.gui.add(p1);
    root.gui.add(p2);
    p1.gui.add(a);
    p2.gui.add(b);
    p2.gui.add(c);
    mount(root);

    expect(dumpDom()).toBe("R(p1(a),p2(b,c))");

    p2.gui.add(a, { before: c });
    await waitForRender();

    expect(dumpDom()).toBe("R(p1,p2(b,a,c))");
  });

  test("getChildren returns ordered array", () => {
    const parent = new Test("P");
    const a = new Test("a");
    const b = new Test("b");
    const c = new Test("c");

    parent.gui.add(a);
    parent.gui.add(b);
    parent.gui.add(c);

    const children = parent.gui.__children;
    expect(children).toEqual([a, b, c]);
  });

  test("insertChildBefore throws if other not a child", () => {
    const parent = new Test("P");
    const a = new Test("a");
    const b = new Test("b");

    parent.gui.add(a);

    expect(() => parent.gui.add(b, { before: new Test("x") })).toThrow();
  });

  test("insertChildAfter throws if other not a child", () => {
    const parent = new Test("P");
    const a = new Test("a");
    const b = new Test("b");

    parent.gui.add(a);

    expect(() => parent.gui.add(b, { after: new Test("x") })).toThrow();
  });

  test("removeFromParent on unattached child is no-op", () => {
    const child = new Test("c");
    child.remove();
    expect(child.parent).toBeNull();
  });

  test("parent tracking set on add and cleared on remove", () => {
    const parent = new Test("P");
    const child = new Test("c");

    expect(child.parent).toBeNull();

    parent.gui.add(child);
    expect(child.parent).toBe(parent.gui);

    child.remove();
    expect(child.parent).toBeNull();
  });

  test("appendChild of already-last child is no-op", async () => {
    const parent = new Test("P");
    const a = new Test("a");
    const b = new Test("b");

    parent.gui.add(a);
    parent.gui.add(b);
    mount(parent);

    parent.gui.add(b);
    await waitForRender();

    expect(dumpDom()).toBe("P(a,b)");
  });

  // --- Template children (ChildNode) tests ---

  test("ref.__children includes initial DomTemplate children", () => {
    class WithTemplateChildren extends defineComponent({
      tag: "div",
      children: [
        { tag: "span", cls: "s1" },
        { tag: "span", cls: "s2" },
      ],
    }) {}

    const comp = new WithTemplateChildren();
    expect(comp.gui.__children.length).toBe(2);
    // Both children are DomTemplate objects
    for (const child of comp.gui.__children) {
      expect(child).toHaveProperty("tag", "span");
    }
  });

  test("template children render in correct DOM order", () => {
    class WithTemplateChildren extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [
        { tag: "span", cls: "first" },
        { tag: "em", cls: "second" },
      ],
    }) {}

    const comp = new WithTemplateChildren();
    mount(comp);

    const root = getByTestId("root");
    expect(root.children.length).toBe(2);
    expect(root.children[0].tagName).toBe("SPAN");
    expect(root.children[0].className).toBe("first");
    expect(root.children[1].tagName).toBe("EM");
    expect(root.children[1].className).toBe("second");
  });

  test("add(component) appends after template children", async () => {
    class WithTemplateChildren extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [{ tag: "span", cls: "static" }],
    }) {}

    const comp = new WithTemplateChildren();
    mount(comp);

    const child = new Test("c");
    comp.gui.add(child);
    await waitForRender();

    const root = getByTestId("root");
    expect(root.children.length).toBe(2);
    expect(root.children[0].tagName).toBe("SPAN");
    expect(root.children[0].className).toBe("static");
    expect(root.children[1].getAttribute("data-testid")).toBe("c");
  });

  test("add(component, { before: templateChild ref })", async () => {
    class WithTemplateChildren extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [{ tag: "span", ref: "slot", cls: "static" }],
    }) {}

    const comp = new WithTemplateChildren();
    mount(comp);

    const child = new Test("c");
    comp.gui.add(child, { before: comp.slot });
    await waitForRender();

    const root = getByTestId("root");
    expect(root.children.length).toBe(2);
    expect(root.children[0].getAttribute("data-testid")).toBe("c");
    expect(root.children[1].tagName).toBe("SPAN");
  });

  test("add(component, { after: templateChild ref })", async () => {
    class WithTemplateChildren extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [
        { tag: "span", ref: "first", cls: "first" },
        { tag: "span", ref: "second", cls: "second" },
      ],
    }) {}

    const comp = new WithTemplateChildren();
    mount(comp);

    const child = new Test("c");
    comp.gui.add(child, { after: comp.first });
    await waitForRender();

    const root = getByTestId("root");
    expect(root.children.length).toBe(3);
    expect(root.children[0].className).toBe("first");
    expect(root.children[1].getAttribute("data-testid")).toBe("c");
    expect(root.children[2].className).toBe("second");
  });

  test("mixed children render in correct DOM order", async () => {
    class WithTemplateChildren extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [
        { tag: "span", ref: "s1", cls: "s1" },
        { tag: "span", ref: "s2", cls: "s2" },
      ],
    }) {}

    const comp = new WithTemplateChildren();
    const a = new Test("a");
    const b = new Test("b");
    // Insert a between the two template children
    comp.gui.add(a, { after: comp.s1 });
    // Append b at end
    comp.gui.add(b);
    mount(comp);

    const root = getByTestId("root");
    expect(root.children.length).toBe(4);
    expect(root.children[0].className).toBe("s1");
    expect(root.children[1].getAttribute("data-testid")).toBe("a");
    expect(root.children[2].className).toBe("s2");
    expect(root.children[3].getAttribute("data-testid")).toBe("b");
  });

  test("add(component, { before: firstTemplateChild ref }) inserts at beginning", async () => {
    class WithTemplateChildren extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [
        { tag: "span", ref: "first", cls: "first" },
        { tag: "span", ref: "second", cls: "second" },
      ],
    }) {}

    const comp = new WithTemplateChildren();
    mount(comp);

    const child = new Test("c");
    comp.gui.add(child, { before: comp.first });
    await waitForRender();

    const root = getByTestId("root");
    expect(root.children.length).toBe(3);
    expect(root.children[0].getAttribute("data-testid")).toBe("c");
    expect(root.children[1].className).toBe("first");
    expect(root.children[2].className).toBe("second");
  });

  test("add(component, { after: lastTemplateChild ref }) inserts between template and end", async () => {
    class WithTemplateChildren extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [
        { tag: "span", ref: "first", cls: "first" },
        { tag: "span", ref: "last", cls: "last" },
      ],
    }) {}

    const comp = new WithTemplateChildren();
    mount(comp);

    const child = new Test("c");
    comp.gui.add(child, { after: comp.last });
    await waitForRender();

    const root = getByTestId("root");
    expect(root.children.length).toBe(3);
    expect(root.children[0].className).toBe("first");
    expect(root.children[1].className).toBe("last");
    expect(root.children[2].getAttribute("data-testid")).toBe("c");
  });

  test("template child with nested ref is functional after mount", () => {
    class WithNestedRef extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [{ tag: "span", ref: "label", text: "" }],
    }) {}

    const comp = new WithNestedRef();
    comp.label.text = "hello";
    mount(comp);

    const root = getByTestId("root");
    expect(root.children.length).toBe(1);
    expect(root.children[0].textContent).toBe("hello");
  });

  test("cross-parent move of component between refs with template children", async () => {
    class Parent extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [
        {
          tag: "div",
          ref: "containerA",
          children: [{ tag: "span", cls: "staticA" }],
        },
        {
          tag: "div",
          ref: "containerB",
          children: [{ tag: "span", cls: "staticB" }],
        },
      ],
    }) {}

    const parent = new Parent();
    const child = new Test("c");
    parent.containerA.add(child);
    mount(parent);

    const root = getByTestId("root");
    const containerA = root.children[0];
    const containerB = root.children[1];

    expect(containerA.children.length).toBe(2); // staticA + child
    expect(containerB.children.length).toBe(1); // staticB

    parent.containerB.add(child);
    await waitForRender();

    expect(containerA.children.length).toBe(1); // staticA only
    expect(containerB.children.length).toBe(2); // staticB + child
    expect(containerB.children[1].getAttribute("data-testid")).toBe("c");
  });

  // --- DomRef anchor tests ---

  test("add(component, { before: DomChildrenRef anchor })", async () => {
    class Parent extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [
        { tag: "div", ref: "slotA" },
        { tag: "div", ref: "slotB" },
      ],
    }) {}

    const parent = new Parent();
    const child = new Test("c");
    // slotA and slotB are DomChildrenRef instances whose templates are children of gui
    parent.gui.add(child, { before: parent.slotB });
    mount(parent);

    const root = getByTestId("root");
    // Should be: slotA, child, slotB
    expect(root.children.length).toBe(3);
    expect(root.children[1].getAttribute("data-testid")).toBe("c");
  });

  test("add(component, { before: DomTextRef anchor })", async () => {
    class Parent extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [
        { tag: "span", ref: "label", text: "hello" },
        { tag: "div", ref: "content" },
      ],
    }) {}

    const parent = new Parent();
    const child = new Test("c");
    // label is a DomTextRef whose template is a child of gui
    parent.gui.add(child, { before: parent.label });
    mount(parent);

    const root = getByTestId("root");
    // Should be: child, label, content
    expect(root.children.length).toBe(3);
    expect(root.children[0].getAttribute("data-testid")).toBe("c");
    expect(root.children[1].textContent).toBe("hello");
  });

  test("add(component, { after: DomRef anchor })", async () => {
    class Parent extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [
        { tag: "div", ref: "slotA" },
        { tag: "div", ref: "slotB" },
      ],
    }) {}

    const parent = new Parent();
    const child = new Test("c");
    parent.gui.add(child, { after: parent.slotA });
    mount(parent);

    const root = getByTestId("root");
    // Should be: slotA, child, slotB
    expect(root.children.length).toBe(3);
    expect(root.children[1].getAttribute("data-testid")).toBe("c");
  });

  test("add(component, { before: DomRef }) throws if ref not a template child", () => {
    const parent = new Test("P");
    const other = new Test("O");
    const child = new Test("c");

    // other.gui is a DomRef but its template is not a child of parent.gui
    expect(() => parent.gui.add(child, { before: other.gui })).toThrow();
  });

  test("parent returns the DomChildrenRef, not the owning component", () => {
    const parent = new Test("P");
    const child = new Test("c");

    parent.gui.add(child);

    expect(child.parent).toBe(parent.gui);
    expect(child.parent).toBeInstanceOf(DomElementWithChildren);
  });

  test("parent is null when not added to a ref", () => {
    const child = new Test("c");
    expect(child.parent).toBeNull();
  });

  test("DomTextRef initializes from template text property", () => {
    class TextWithDefault extends defineComponent({
      tag: "div",
      text: "hello",
      attrs: { "data-testid": "text-default" },
    }) {}

    const comp = new TextWithDefault();
    // Text should be initialized from template without calling .text =
    expect(comp.gui.text).toBe("hello");
    mount(comp);

    expect(getByTestId("text-default").textContent).toBe("hello");
  });

  // --- DomTextNode (tagless text) tests ---

  test("tagless text child creates Text node", () => {
    class WithTextChild extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [{ text: "hello" }],
    }) {}

    const comp = new WithTextChild();
    mount(comp);

    const root = getByTestId("root");
    expect(root.childNodes.length).toBe(1);
    expect(root.childNodes[0].nodeType).toBe(3); // Text node
    expect(root.childNodes[0].textContent).toBe("hello");
  });

  test("tagless text with ref: readable and updatable", async () => {
    class WithTextRef extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [{ ref: "label", text: "initial" }],
    }) {}

    const comp = new WithTextRef();
    mount(comp);

    const root = getByTestId("root");
    expect(root.textContent).toBe("initial");

    comp.label.text = "updated";
    await waitForRender();

    expect(root.textContent).toBe("updated");
  });

  test("tagless text ref is DomTextNode", () => {
    class WithTextRef extends defineComponent({
      tag: "div",
      children: [{ ref: "label", text: "hello" }],
    }) {}

    const comp = new WithTextRef();
    expect(comp.label).toBeInstanceOf(DomTextNode);
  });

  test("tagless text as component root", () => {
    class BareText extends defineComponent({ text: "bare text" }) {}

    const parent = new (defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
    }))();

    const child = new BareText();
    parent.gui.add(child);
    mount(parent);

    const root = getByTestId("root");
    expect(root.textContent).toBe("bare text");
  });

  test("mixed tagless text and elements", () => {
    class MixedContent extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [
        { text: "before " },
        { tag: "span", cls: "middle" },
        { text: " after" },
      ],
    }) {}

    const comp = new MixedContent();
    mount(comp);

    const root = getByTestId("root");
    expect(root.childNodes.length).toBe(3);
    expect(root.childNodes[0].nodeType).toBe(3); // Text
    expect(root.childNodes[0].textContent).toBe("before ");
    expect((root.childNodes[1] as HTMLElement).tagName).toBe("SPAN");
    expect(root.childNodes[2].nodeType).toBe(3); // Text
    expect(root.childNodes[2].textContent).toBe(" after");
  });

  test("tagless text set before mount", () => {
    class WithTextRef extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [{ ref: "label", text: "" }],
    }) {}

    const comp = new WithTextRef();
    comp.label.text = "pre-set";
    mount(comp);

    expect(getByTestId("root").textContent).toBe("pre-set");
  });

  test("tagless text set after mount", async () => {
    class WithTextRef extends defineComponent({
      tag: "div",
      attrs: { "data-testid": "root" },
      children: [{ ref: "label", text: "" }],
    }) {}

    const comp = new WithTextRef();
    mount(comp);

    expect(getByTestId("root").textContent).toBe("");

    comp.label.text = "post-set";
    await waitForRender();

    expect(getByTestId("root").textContent).toBe("post-set");
  });
});

class Test extends defineComponent({
  tag: "div",
}) {
  constructor(testId: string) {
    super();
    this.gui.attrs["data-testid"] = testId;
  }
}

function getByTestId(id: string): HTMLElement {
  const el = document.querySelector(`[data-testid="${id}"]`);
  if (!el) throw new Error(`data-testid="${id}" not found`);
  return el as HTMLElement;
}

function queryByTestId(id: string): HTMLElement | null {
  return document.querySelector(`[data-testid="${id}"]`);
}

function dumpDom(el?: HTMLElement | string): string {
  if (typeof el === "string") {
    el = getByTestId(el);
  }
  if (!el) {
    const node = document.body.querySelector(
      "[data-testid]",
    ) as HTMLElement | null;
    if (!node)
      throw new Error("No element with data-testid found in document.body");
    return dumpDom(node);
  }
  const id = el.getAttribute("data-testid");
  if (!id)
    throw new Error(`Expected data-testid on <${el.tagName.toLowerCase()}>`);
  if (el.tagName !== "DIV")
    throw new Error(
      `Expected <div> but got <${el.tagName.toLowerCase()}> for testid="${id}"`,
    );
  const children = [...el.children];
  if (children.length === 0) return id;
  return `${id}(${children.map((c) => dumpDom(c as HTMLElement)).join(",")})`;
}

function waitForRender(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1));
}

function createTestDOM() {
  const window = new Window({ url: "http://localhost" });
  const document = window.document;

  // Make available globally for tests
  globalThis.window = window as any;
  globalThis.document = document as any;
  globalThis.HTMLElement = window.HTMLElement as any;
  globalThis.Element = window.Element as any;
  globalThis.Text = window.Text as any;
  globalThis.Node = window.Node as any;
  globalThis.DocumentFragment = window.DocumentFragment as any;

  return { window, document };
}
