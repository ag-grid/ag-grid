# AG Charts — JIRA Product Configuration

## Identity

- **Project**: `AG`
- **Component**: `Charts` (ID: 11061)
- **Summary prefix**: `[Charts]`
- **Search**: Project `AG`, Component `Charts`, Status `Needs Review` for review

## API Field Values

```json
{
    "projectKey": "AG",
    "components": [{ "name": "Charts" }],
    "summary": "[Charts] ..."
}
```

## Version Relationship

Charts major version = Grid major version - 22.

- Charts v9 = Grid v31.
- Charts v10 = Grid v32.

The `versions` (Affects Version) field uses **Grid** version numbers (e.g., `[{"name": "31.0.0"}]`).

## Bug Version Testing

When creating bug tickets, test affected versions **from the browser** (not by analysing code):

1. Use the reproduction Plunker and change AG Charts version.
2. Binary search versions to find when the bug was introduced.
3. Set `versions` field to earliest affected version.

## Estimation Calibration Data

Use these baseline estimates for common AG Charts work items:

### Series Implementation

- **New series type** (extending AbstractBarSeries, CartesianSeries, etc.): **10 days / 2 weeks**.
    - Includes: Core implementation, type definitions, rendering logic, theme integration.
    - Includes: Unit tests, visual regression tests, documentation page, framework examples.
    - Examples: Overlapping bar/column series, timeline series, quadrant chart.
    - Does NOT include: Highly complex rendering algorithms, advanced interactions beyond standard.

### Annotation Implementation

- **New annotation type**: **15-20 days (3-4 weeks)**.
    - Includes: Core annotation class, rendering, drag/resize interactions, type definitions.
    - Includes: Comprehensive testing (unit, E2E, visual regression), documentation, examples.
    - Examples: Text annotations, shape annotations, measurement tools.
    - Complexity drivers: Drag/drop interactions, resize handles, connection points, styling system.

### Other Common Work Items

- **Simple bug fix** (isolated, clear root cause): 0.5-1 day.
- **Complex bug fix** (requires investigation, multiple areas): 2-3 days.
- **New chart option** (simple property, minimal logic): 1-2 days.
- **Event/callback addition**: 2-4 days (depending on complexity).
- **Performance optimisation**: 3-5 days (investigation + implementation).
- **Breaking API change**: Add 20-30% for migration guide, backward compatibility testing.

### Adjustment Guidelines

- **Add 20-30%** if implementation requires deep integration with multiple systems.
- **Add 30-50%** if feature has significant unknowns or unclear requirements.
- **Add 40-60%** for enterprise features requiring licensing checks, advanced theming.
- **Reduce by 20-30%** only if leveraging substantial existing infrastructure with minimal changes.

### Common Estimation Pitfalls

- Canvas rendering changes always require visual regression test updates — budget at least 30% of implementation time for test maintenance.
- Changes to AbstractSeries or CartesianSeries affect ALL series types — scope the blast radius before estimating.
- Theme integration is often underestimated — new properties need defaults in every theme variant.
