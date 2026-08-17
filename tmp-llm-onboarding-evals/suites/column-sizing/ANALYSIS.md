## What this measured

Thirteen column-sizing tasks, each a single realistic request against a working React app whose
starting state was verified in a browser. Every task was run three times cold (prompt only) and
three times primed (prompt plus a 103-line reference brief on the sizing mechanisms and how they
relate). Same model, same isolation, same templates. 78 runs.

The prompts name no API and no feature. The four bug-report criteria state a symptom; the rest
state a goal. Nothing was verified functionally — an earlier round of this investigation
established that these agents produce working software — so the only questions asked were *did it
use the mechanism the grid provides* and *is this close to the smallest change that does it*.

Every recorded failure was then read by hand. Where the implementation turned out to be reasonable
and the criterion was at fault, the criterion was rewritten and the affected runs redone. Three
criteria were corrected this way; the numbers below are after that audit.

## The headline

| | cold | primed |
| --- | --- | --- |
| Correct approach | 31/39 | **39/39** |
| Minimal | 27/39 | **36/39** |
| Both | 27/39 | **36/39** |

**Priming eliminated wrong-mechanism failures entirely.** No criterion did worse primed than cold.

The cold failures were concentrated, not spread:

- **01** 0/3. All three hand-wrote content measurement — 131, 110 and 153-line modules using canvas
  `measureText` or cloned DOM nodes, scraping fonts, padding and borders off the rendered grid.
  Primed: 3/3, one of them a +3/-3 line diff.
- **13** 0/3. All three discarded `fitGridWidth` and rebuilt it from `flex: 1` plus a
  `fitCellContents` strategy scoped to the exempt column — a combination the grid rejects with
  `warning #318`, so it did not work. `suppressSizeToFit` appeared in none of them. Primed: 3/3.
- **02** 2/3, the third being the same hand-rolled measurement module.
- **09** 2/3, the failure being `flex: widths[field]` — stored pixel values used as flex ratios.

Seven criteria were 3/3 in both stages and carry no information about priming.

## The failure mode is not ignorance

Every cold failure on 01, 02 and 11 named the built-in mechanism and rejected it. The stated reason
was always the same and always true: content fitting measures only the rendered rows, so a value in
an off-screen row can be truncated. No prompt asked about off-screen rows.

The same pattern drives what is left after priming. All nine remaining primed-and-cold minimality
failures are the correct mechanism wrapped in machinery that re-derives what the grid already
computes: a grow-only width ratchet around `autoSizeAllColumns` (11, three runs), a hand-rolled
available-width guard before `sizeColumnsToFit` (09), a per-column limit table rebuilt from
`getActualWidth()` (09, two runs), a redundant `autoSizeStrategy` on top of an existing fit (09),
and a magic-number `width` alongside a correct `suppressSizeToFit` (13).

These agents know the API. What they lack is a sense of when the built-in is the answer and the
edge case is not worth defending against. That is a judgement gap, not a knowledge gap, and it is
why "is this minimal" turned out to be the more discriminating question — priming fixed approach
completely and left a third of the minimality failures standing.

## What the audit found

Six of the twenty originally-recorded failures were errors in the criteria, not in the code. All
three were mine, and all three are the same mistake: encoding one implementation as *the* answer
instead of describing the required outcome.

- **10** — three runs called `applyColumnState` with state mapped from `columnDefs`. My expected
  text banned "a hand-built list of default widths", but these derive from the single source of
  truth, reset only `width` (which is what the prompt asked, where `resetColumnState` also restores
  order, sort and pinning), and need no `localStorage` clearing because applying state fires a
  resize that `onStateUpdated` persists. Criterion rewritten to accept both routes; now 3/3 and 3/3.
- **09** — two primed runs migrated to grid-owned state. The prompt asked that widths "still be
  there after a reload", which describes behaviour, not ownership, and they preserved the behaviour.
  The prompt now says explicitly to carry on keeping the widths in the application's own store.
- **13** — one primed run used `suppressSizeToFit: true` *and* a hardcoded `width: 130`. The
  mechanism is right; the magic number is a minimality problem. Rescored accordingly.

Across the whole investigation that is eight authoring errors and zero verifier errors. The
verifier has been faithful to the expected text every time, which keeps pointing at the text as the
weak link rather than the judge. Requiring quoted file-and-line evidence for every verdict is what
made each of these findable.

## Other observations

- **0/78 runs called `enableDevValidations()`.** All three cold runs of criterion 13 shipped a
  configuration the grid explicitly rejects, and the warning saying so was switched off. The only
  mechanically-detected defect in the experiment was invisible to the agent that caused it.
- **0/78 consulted ag-grid.com.** Everything came from model weights or the supplied brief.
- Hand-rolled measurement APIs — canvas, `measureText`, `getBoundingClientRect`, `offsetWidth` —
  appear only in cold runs. Priming eliminated them.

## What this does not show

Three runs per cell detects large effects, not small ones. The 0/3 → 3/3 movements on 01 and 13 are
unambiguous; single-run differences are not, and are reported here only where the mechanism was
identifiable in the diff.

The brief was written after seeing the cold failures. A goal-to-mechanism lookup table was cut from
it before the primed runs, along with a sentence that directly forbade hand-rolled measurement,
specifically so the result could not be attributed to an answer key — but the remaining text is
still informed by knowing where agents go wrong. This measures how well a well-targeted page can
work, not how well a page written blind would do.

One section of the brief is also known to be wrong as written. "Widths are grid state, not
application state" is not accurate: updating column definitions resets the grid's state to the
definitions' values, so an application chooses between setting the definitions once and letting the
grid own the state, or updating them and taking responsibility for supplying correct values on
every update. That framing also explains the React re-render behaviour and `initialFlex` as one
fact rather than three rules. The primed runs used the inaccurate wording.

---
