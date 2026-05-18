## ag-grid behavioural unit testing

In this project ag-grid is tested as a black box, we test the grid at the edges, instantiating the full grid to test complex behaviours and features.

The unit under test here is a behaviour, not a function, a class, a method, or a file.

Mocking is to be avoided as much as possible here, and the use of fakes is preferred (for example this project uses fake DOM).

## Running tests

To execute all tests, run from the repo root:

```sh
./behave.sh
```

To execute tests matching a file pattern:

```sh
./behave.sh "filename"
```

To run in watch mode:

```sh
./behave.sh --watch
```

To overwrite the snapshots for snapshot tests:

```sh
./behave.sh --update
```

### Updating GridRows inline snapshots

When diagram formatting or grid behaviour changes, you can automatically update all GridRows inline
snapshots (the template literals passed to `.check()`):

```sh
# Update all GridRows snapshots
./behave.sh --update-grid-rows

# Update snapshots in matching test files only
./behave.sh --update-grid-rows "cell-editing"

# Dry-run: show what would change without writing files
./behave.sh --update-grid-rows=dry

# Equivalent env var form
UPDATE_GRID_ROWS_SNAPSHOTS=1 ./behave.sh
UPDATE_GRID_ROWS_SNAPSHOTS=dry ./behave.sh
```

The updater uses TypeScript's parser to locate `.check()` calls and precisely rewrite the template
literal argument, preserving surrounding code and indentation. It handles direct inline template
literals, variable references (`const x = \`...\`; gridRows.check(x)`), and tagged templates.
Dynamic strings with `${}` interpolation are skipped with a warning.

To execute benchmarks:

```sh
./benches.sh
```

To execute benchmarks on a single file (any positional arg is forwarded to `vitest bench`):

```sh
./benches.sh "tree-data-path"
```

## References:

- https://www.youtube.com/watch?v=EZ05e7EMOLM
- https://docs.google.com/presentation/d/1bEK7sOindHAMIyzFK59VMdjuSzC-NFG3hlUZkwLeGT8
- https://martinfowler.com/articles/mocksArentStubs.html
- https://agilewarrior.wordpress.com/2015/04/18/classical-vs-mockist-testing/
