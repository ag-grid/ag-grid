# Low Performance CSS Selectors

This document explains the `ag/no-low-performance-key-selector` lint rule and how to fix violations.

## Why this is an issue for AG Grid

Our customers often put the grid into applications that push the boundaries of the number of DOM elements a browser page can contain. Many grid applications have hundreds of thousands of DOM elements, most of them outside of the grid.

But the way CSS works, it is very easy to write a selector that requires checking every DOM element on the page, even those not part of a grid, to see if they match.

To prevent slowing down our customers' applications, we need to carefully write our CSS in such a way that it does not have to be checked against every element on the page.

## Background: right to left matching and key selectors

When the browser matches a CSS selector, it starts from the **key selector** (the rightmost part) and works leftward. A "low performance" key selector forces the browser to check many elements before narrowing down candidates.

The key selector is the rightmost or innermost bit of CSS selector, up to a nesting boundary or the descendant combinator (ie a space between rule parts).

Examples:

```css
/* ".bar" is key selector, ".foo" is not part of it because of
   the space (descendent combinator) */
.foo .bar {
    color: red;
}
/* ".foo" and ".bar" are key selectors - ", " is a list separator
   not a descendent combinator  */
.foo,
.bar {
    color: red;
}
/* ".foo" and ".bar" and ":after" are all key selectors - This is
   counterintuitive since the "&" has the semantic effect of joining
   it directly to the parents, like ".foo:after, .bar:after" But that
   is not how Chrome treats it. */
.foo,
.bar {
    &:after {
        content: '';
    }
}
```

## High-performance CSS

The rule for high-performance CSS is that **the key selector should be fast to match, by containing a class or ID**.

The classic slow selector is `.foo > *` which feels like it should be fast to match because it's saying "Select all children of the .foo element". But in fact what it does with right to left matching is first select literally every element in the page, and then narrow them down by whether they have a .foo parent. This is slow.

Browsers aren't very smart here, so it's often possible to take a low-performance selector and make it high-performance by doing a simple transformation, often involving duplicating some code, to transform it into a high-performance selector.

## Categories and Fixes

### 1. Nested Pseudo-Elements (`&:after`, `&:before`)

**Problem:**

```css
.foo {
    &:after {
        content: '';
    } /* key: &:after - LOW PERFORMANCE */
}
```

**Fix:** Move the class into the key selector:

```css
.foo:after {
    content: '';
} /* key: .foo:after - HIGH PERFORMANCE (has .foo) */
```

---

### 3. `:where()` with Selector Lists

**Problem:**

`:where()` is used to lower the specificity of a selector. When it contains a single high performance selector, it is also high performance. But when it contains a list of selectors it is low performance, _even if the list contains only high performance selectors_.

```css
:where(.foo, .bar, .baz) {
    color: red;
} /* LOW PERFORMANCE - multiple selectors inside :where */
```

**Fix:** Split into separate `:where()` calls:

```css
:where(.foo),
:where(.bar),
:where(.baz) {
    color: red;
} /* HIGH PERFORMANCE - each has single class */
```

---

### 4. Type Selectors (`div`, `span`, `input`)

**Problem:**

Under right-to-left matching, these match every element of the specified type in the page, then narrow by the parent selector part:

```css
.container > div {
    margin: 10px;
} /* key: div - LOW PERFORMANCE */
```

**Fix:** Add a class to the element:

```css
.container > .container-item {
    margin: 10px;
} /* key: .container-item - HIGH PERFORMANCE */
```

---

### 5. Universal Selector (`*`)

**Problem:**

```css
.foo > * {
    box-sizing: border-box;
} /* key: * - LOW PERFORMANCE */
```

**Fix:** Target specific classes or use inheritance where possible:

```css
.foo-child {
    box-sizing: border-box;
} /* key: .foo-child - HIGH PERFORMANCE */
```

---

### 6. `:not()` and `:has()` Selectors

These are always low performance on their own because they require checking every element on the page against a condition.

- `:not()` matches broadly (everything that ISN'T something)
- `:has()` requires checking descendants

**Problem:**

```css
.list :not(.disabled) {
    opacity: 1;
} /* key: :not(.disabled) - LOW PERFORMANCE */
```

**Fix:** This is a hidden universal selector - `:not(.disabled)` is effectively
`*:not(.disabled)`, and the fix is the same - include a class in addition to
`:not` so that it doesn't first match everything and then narrow down:

```css
.list .item:not(.disabled) {
    opacity: 1;
} /* key: .item:not(.disabled) - HIGH PERFORMANCE */
```
