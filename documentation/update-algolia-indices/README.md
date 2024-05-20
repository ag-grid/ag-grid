# Markdoc migration

Script to update Grid Algolia indices.

Requires an env file including algolia admin key, see .env.example

## To run

Local run, no algolia changes, results in /output

```
npm run updateLocal
```

Update dev indices

```
npm run updateDev
```

Update prod indices

```
npm run updateProd
```
