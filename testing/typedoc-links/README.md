# ag-grid-typedoc-links

Guards the JSDoc `{@link}` references in our **published** type declarations.

Many consumers generate their API documentation with [TypeDoc](https://typedoc.org/) pointed at our
shipped `.d.ts` files. If a JSDoc comment contains a `{@link Target}` that TypeDoc cannot resolve, their
build prints `Failed to resolve link to "Target"`. This project reproduces that environment: it runs
TypeDoc against the built `main.d.ts` of `ag-grid-community` and `ag-grid-enterprise` and fails if any
link is unresolved.

## Running

```bash
yarn nx test ag-grid-typedoc-links
```

The `test` target depends on `ag-grid-community:build:types` and `ag-grid-enterprise:build:types`, so the
declarations are built first. CI picks it up via `nx affected -t test` like the other test projects.

## Fixing a failure

A failure names the symbol and the comment it appears in, e.g.:

```
Failed to resolve link to "distributeGroupValue" in comment for ColDef.groupRowValueSetter
```

The fix is almost always in the **source** JSDoc (`packages/ag-grid-*/src/...`), not here:

- **Referencing a symbol not exported from that package** (e.g. an `ag-grid-enterprise` export such as
  `distributeGroupValue` referenced from an `ag-grid-community` type) — TypeDoc has no symbol in scope to
  link to. Reference it as inline code (`` `distributeGroupValue` ``) instead.
- **Referencing an internal method/type not on the public surface** (e.g. a cross-service method) — same
  fix: use inline code. Only `{@link}` symbols that are exported from the same package or in scope.
- **A typo** in the target symbol name — correct it.

Do **not** try to fix this via TypeDoc's `externalSymbolLinkMappings`: that only fires once TypeDoc has
resolved the name to a real declaration, so it cannot rescue a bare symbol that is out of scope.

## Notes

- The TypeDoc version is pinned exactly — link-resolution behaviour varies between versions, so bump it
  deliberately.
- Only `invalidLink` validation is enabled. `notExported`/`notDocumented` are off because they flag the
  many intentional internal (`_`-prefixed) API types and would drown the real signal.
