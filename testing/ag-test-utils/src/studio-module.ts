import type { Module } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

/**
 * Stands in for the `studio` bean that AG Studio contributes to every grid it creates, so that tests
 * can exercise grid behaviour gated on running inside Studio. The bean carries no behaviour of its
 * own — the grid only ever checks whether it is present.
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
