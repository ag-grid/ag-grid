# AG Grid Documentation Website

## Development

1. Install dependencies: `npm i`
2. Start the dev server: `npm run dev`

## Running an example against a different framework version

A standalone example page accepts a `version` URL parameter, which overrides the framework version its
import map resolves — React, Angular or Vue, depending on the example's framework:

```
https://localhost:4610/examples/column-sizing/column-flex/reactFunctionalTs/?version=18.3.1
```

Without the parameter the example resolves the version the docs pin (see
`src/utils/exampleModules/getImportMap.ts`). A value that is not a version aborts the load with a message
on the page instead of quietly falling back to the pinned version; a well-formed version that does not
exist fails when the CDN 404s.

Docs e2e specs select a version with the `version` field of the `loadPageOptions` fixture.
