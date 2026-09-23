import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { IInternalFlagsBean, InternalFlags } from '../interfaces/iInternalFlags';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';

/**
 * Sets internal behaviour flags explicitly, overriding the Studio preset. Register it per grid so flags cannot leak.
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _createInternalFlagsModule(flags: InternalFlags): _ModuleWithoutApi {
    const frozenFlags = Object.freeze({ ...flags });

    class InternalFlagsBean extends BeanStub implements NamedBean, IInternalFlagsBean {
        beanName = 'internalFlags' as const;
        public readonly flags = frozenFlags;
    }

    return {
        moduleName: 'InternalFlags',
        version: VERSION,
        beans: [InternalFlagsBean],
    };
}
