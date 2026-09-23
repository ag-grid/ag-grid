import type { Module } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

/**
 * Stands in for the `studio` bean AG Studio adds to every grid, to test what running inside Studio turns on. It also
 * skips licence validation, so test a single behaviour with `_createInternalFlagsModule` instead.
 */
class StudioStub {
    beanName = 'studio' as const;
}

/** Register per grid (`{ modules: [StudioStubModule] }`) to make the grid behave as if inside AG Studio. */
export const StudioStubModule: Module = {
    moduleName: 'Studio' as Module['moduleName'],
    // borrowed from a real module so the registry's version check stays quiet
    version: ClientSideRowModelModule.version,
    beans: [StudioStub],
};
