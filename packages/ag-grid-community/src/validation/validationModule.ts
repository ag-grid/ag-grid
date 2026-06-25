import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { _registerModule } from '../modules/moduleRegistry';
import { VERSION } from '../version';
import { ValidationService } from './validationService';

/**
 * @feature Validation
 */
export const ValidationModule: _ModuleWithoutApi = {
    moduleName: 'Validation',
    version: VERSION,
    beans: [ValidationService],
};

/**
 * Registers the {@link ValidationModule}, which surfaces extended development-time diagnostics:
 * detailed console warnings for conflicting or invalid grid options and column definition
 * properties. Without it, console messages are reduced to an error code and a documentation link.
 *
 * The `ValidationModule` is intentionally excluded from the `AllCommunityModule` and
 * `AllEnterpriseModule` bundles to keep production builds small. Use this helper to opt into
 * validation during development, for example:
 *
 * ```js
 * if (process.env.NODE_ENV !== 'production') {
 *     enableDevValidations();
 * }
 * ```
 *
 * This is equivalent to registering the `ValidationModule` yourself, i.e.
 * `ModuleRegistry.registerModules([ValidationModule])` (or including it in the `modules` array
 * passed to a framework wrapper).
 *
 * Call this before any grid is created, and from the same scope (module/bundle) that registers
 * your other modules — registration is global, so it must run before grid initialisation to take
 * effect. Not intended for production builds.
 */
export function enableDevValidations(): void {
    _registerModule(ValidationModule, undefined);
}
