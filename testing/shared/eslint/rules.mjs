// Shared by testing/behavioural and testing/ag-test-utils. Harness files moved from the former to the
// latter, and a rule configured in only one of them silently exempts whichever side a file now sits on.

/**
 * Bans a guessed `asyncSetTimeout(n > 0)`. The backlog is swept (AG-18026), so this is an `error`: a new
 * guessed delay fails the build, and a genuine timer window needs an eslint-disable naming it.
 */
export const noGuessedDelays = [
    'error',
    {
        selector: "CallExpression[callee.name='asyncSetTimeout'] > Literal[value>0]",
        message:
            'Guessed delay. Poll with waitFor, or drop the sleep if the next call already polls. asyncSetTimeout(0) is allowed; (1) is identical to (0) in Node. A genuine timer window needs an eslint-disable naming it. See .rulesync/rules/testing.md.',
    },
];
