import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { IInternalFeatureFlagsBean, InternalFeatureFlags } from '../interfaces/iInternalFeatureFlags';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';

/**
 * Sets internal behaviour flags explicitly, overriding the Studio preset. Register it per grid so flags cannot leak.
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _createInternalFeatureFlagsModule(flags: InternalFeatureFlags): _ModuleWithoutApi {
    const frozenFlags = Object.freeze({ ...flags });

    class InternalFeatureFlagsBean extends BeanStub implements NamedBean, IInternalFeatureFlagsBean {
        beanName = 'internalFeatureFlags' as const;
        public readonly flags = frozenFlags;
    }

    return {
        moduleName: 'InternalFeatureFlags',
        version: VERSION,
        beans: [InternalFeatureFlagsBean],
    };
}
