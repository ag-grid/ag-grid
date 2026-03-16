# AG Charts — Validation Commands

Run these commands to validate examples before committing.

## Gallery Examples

Located at `packages/ag-charts-website/src/content/gallery/_examples/${exampleName}/`

```bash
# Generate framework variants
yarn nx run ag-charts-website-gallery_${exampleName}_main.ts:generate

# Typecheck (CRITICAL — do not skip)
yarn nx run ag-charts-website-gallery_${exampleName}_main.ts:typecheck
```

## Docs Examples

Located at `packages/ag-charts-website/src/content/docs/${pageName}/_examples/${exampleName}/`

```bash
# Generate framework variants
yarn nx run ag-charts-website-${pageName}_${exampleName}_main.ts:generate

# Typecheck
yarn nx run ag-charts-website-${pageName}_${exampleName}_main.ts:typecheck
```

## Batch Validation

```bash
# Typecheck all examples (faster than individual targets)
yarn nx validate-examples

# Generate all framework variants
yarn nx generate-examples ag-charts-website

# Generate thumbnails
yarn nx generate-thumbnails ag-charts-website
```

## Validation Order

1. **Generate** — framework variant generation must succeed
2. **Typecheck** — TypeScript must compile without errors
3. **Visual verification** — check in dev server (`yarn nx dev`)
4. **Thumbnails** — generate if gallery example changed

## Framework Compatibility Decision Tree

```
Is this a public documentation or gallery example?
├─ YES → MUST be framework-compatible
│   ├─ Simple controls? → Implement with supported patterns
│   ├─ Complex patterns needed? → Redesign to be simpler
│   └─ Cannot simplify? → Reconsider if example belongs in public docs
│
└─ NO (benchmark or *-test page) → Can use @ag-skip-fws if needed
```

For detailed `@ag-skip-fws` usage patterns and restrictions, see `.rulesync/skills/example/ag-charts/framework-patterns.md`.

## Common Failure Fixes

| Failure | Likely Cause | Fix |
|---------|-------------|-----|
| "Property does not exist" | Generic `AgChartOptions` | Use `AgCartesianChartOptions` etc. |
| "Type 'string' not assignable" | Missing `as const` | Add `type: 'bar' as const` |
| "axes does not exist" | Wrong chart type | Use correct type (Cartesian vs Polar) |
| Typecheck fails | Missing `axes.*.type` | Add `type` to every axis |
| Framework generation fails | Complex DOM manipulation | Simplify to declarative patterns |
