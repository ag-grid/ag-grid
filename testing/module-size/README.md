# AG Grid Module Size Measurement

This project measures the self-size of each AG Grid module — the increase in bundle size that registering that module in a dummy app gives over the core of AG Grid alone.

```
npm run module-combinations
```

This writes `module-size-results.json`. The live signal is the Module Size Comparison report posted on every pull request, which runs the same measurement against the base branch and the PR and reports the difference.
