import { describe, expect, it } from 'vitest';

import { resolveInternalFramework } from './resolveInternalFramework';

describe('resolveInternalFramework', () => {
    it('keeps the docs framework when the example places no restriction', () => {
        expect(resolveInternalFramework({ docsInternalFramework: 'vue3' })).toEqual({
            internalFramework: 'vue3',
            isUsingAlternativeInternalFramework: false,
        });
        expect(resolveInternalFramework({ docsInternalFramework: 'vue3', supportedFrameworks: [] })).toEqual({
            internalFramework: 'vue3',
            isUsingAlternativeInternalFramework: false,
        });
    });

    it('keeps the docs framework when the example supports it', () => {
        expect(
            resolveInternalFramework({
                docsInternalFramework: 'reactFunctional',
                supportedFrameworks: ['reactFunctional', 'typescript'],
            })
        ).toEqual({ internalFramework: 'reactFunctional', isUsingAlternativeInternalFramework: false });
    });

    it('falls back to the closest supported alternative', () => {
        expect(
            resolveInternalFramework({
                docsInternalFramework: 'reactFunctional',
                supportedFrameworks: ['typescript', 'reactFunctionalTs'],
            })
        ).toEqual({ internalFramework: 'reactFunctionalTs', isUsingAlternativeInternalFramework: true });

        expect(
            resolveInternalFramework({ docsInternalFramework: 'angular', supportedFrameworks: ['vanilla'] })
        ).toEqual({ internalFramework: 'vanilla', isUsingAlternativeInternalFramework: true });
    });

    it('keeps the docs framework when no alternative is supported either', () => {
        expect(resolveInternalFramework({ docsInternalFramework: 'vue3', supportedFrameworks: ['angular'] })).toEqual({
            internalFramework: 'vue3',
            isUsingAlternativeInternalFramework: false,
        });
    });

    it('pins typescriptOnly examples to TypeScript', () => {
        expect(
            resolveInternalFramework({
                docsInternalFramework: 'reactFunctional',
                supportedFrameworks: ['reactFunctionalTs'],
                typescriptOnly: true,
            })
        ).toEqual({ internalFramework: 'typescript', isUsingAlternativeInternalFramework: true });
    });
});
