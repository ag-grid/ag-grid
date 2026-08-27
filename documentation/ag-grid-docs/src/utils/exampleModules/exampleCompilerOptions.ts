import type { InternalFramework } from '@ag-grid-types';
import type { NamedCompilerOptions } from '@ag-website-shared/components/example-runner/utils/transformExampleModule';
import { isReactInternalFramework } from '@utils/framework';

/**
 * The compiler options an example is transpiled with. Unlike the other sites, examples here
 * are built per framework, so each gets only the options it needs: `jsx` would rewrite a
 * plain `.ts` example's angle brackets, and the decorator options are Angular's alone.
 *
 * Named rather than resolved, so the in-page transpiler can be handed them as data.
 */
export const getCompilerOptionNames = (internalFramework: InternalFramework): NamedCompilerOptions => ({
    module: 'ESNext',
    target: 'ES2022',
    ...(isReactInternalFramework(internalFramework) ? { jsx: 'React' } : {}),
    // `emitDecoratorMetadata` is what lets the Angular JIT compiler resolve constructor
    // injection: without the emitted `design:paramtypes`, any component or service with
    // constructor dependencies fails to instantiate (NG0202).
    ...(internalFramework === 'angular' ? { experimentalDecorators: true, emitDecoratorMetadata: true } : {}),
});
