# AG Grid Documentation Website

## Development

1. Install dependencies: `npm i`
2. Start the dev server: `npm run dev`

## Running an example against a different framework version or build

A standalone example page accepts two URL parameters, both of which change what its import map resolves:

- `version` — the framework version: React, Angular or Vue, depending on the example's framework.
- `prod` — `prod=false` resolves the framework's development build, with its warnings and dev-only
  validations. Only React has a separate one; examples otherwise run against the production build.

```
https://localhost:4610/examples/column-sizing/column-flex/reactFunctionalTs/?version=18.3.1&prod=false
```

Without the parameters an example resolves the version the docs pin and the production build, as it did
under SystemJS (see `src/utils/exampleModules/getImportMap.ts`). A `version` that is not a version aborts
the load with a message on the page instead of quietly falling back to the pinned version; a well-formed
version that does not exist fails when the CDN 404s.

Docs e2e specs select both with the `version` and `prod` fields of the `loadPageOptions` fixture.
