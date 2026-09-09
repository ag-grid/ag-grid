import type { InternalFramework } from '@ag-grid-types';

/**
 * Closest internal frameworks to fall back to, in order, when an example does not support the one
 * the docs are set to.
 */
const BEST_ALTERNATIVE: Record<InternalFramework, InternalFramework[]> = {
    vanilla: ['typescript'],
    typescript: ['vanilla'],
    reactFunctional: ['reactFunctionalTs', 'typescript', 'vanilla'],
    reactFunctionalTs: ['reactFunctional', 'typescript', 'vanilla'],
    angular: ['typescript', 'vanilla'],
    vue3: ['typescript', 'vanilla'],
};

export interface ResolvedInternalFramework {
    internalFramework: InternalFramework;
    /** The example does not support the docs framework, so a fallback is shown */
    isUsingAlternativeInternalFramework: boolean;
}

/**
 * Work out which internal framework the example runner shows for an example.
 *
 * Starts from the docs internal framework, falls back to the best supported alternative when the
 * example restricts its `supportedFrameworks`, and is pinned to TypeScript for `typescriptOnly`
 * examples.
 */
export function resolveInternalFramework({
    docsInternalFramework,
    supportedFrameworks,
    typescriptOnly,
}: {
    docsInternalFramework: InternalFramework;
    supportedFrameworks?: InternalFramework[];
    typescriptOnly?: boolean;
}): ResolvedInternalFramework {
    let internalFramework = docsInternalFramework;
    let isUsingAlternativeInternalFramework = false;

    if (supportedFrameworks && supportedFrameworks.length > 0 && !supportedFrameworks.includes(docsInternalFramework)) {
        const alternative = BEST_ALTERNATIVE[docsInternalFramework].find((candidate) =>
            supportedFrameworks.includes(candidate)
        );
        if (alternative) {
            internalFramework = alternative;
            isUsingAlternativeInternalFramework = true;
        }
    }

    return {
        internalFramework: typescriptOnly ? 'typescript' : internalFramework,
        isUsingAlternativeInternalFramework,
    };
}
