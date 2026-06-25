import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { _registerModule } from '../modules/moduleRegistry';
import { VERSION } from '../version';
import type { DevValidationOptions } from './validationConfig';
import { _applyDevValidationConfig } from './validationConfig';
import { ValidationService } from './validationService';

/**
 * Provides extended development-time diagnostics: detailed console warnings for conflicting or
 * invalid grid options and column definition properties. It is intentionally excluded from the
 * `AllCommunityModule` and `AllEnterpriseModule` bundles to keep production builds small.
 *
 * {@link enableDevValidations} is the recommended way to opt into validation; registering this
 * module directly is the equivalent low-level alternative.
 *
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
 *
 * Pass {@link DevValidationOptions} to configure development-time diagnostics, e.g. `{ throwOn: 'error' }`.
 */
export function enableDevValidations(options?: DevValidationOptions): void {
    _registerModule(ValidationModule, undefined);
    _applyDevValidationConfig(options);
}

/**
 * Configures the development-time diagnostics provided by the {@link ValidationModule} for users who
 * register the module directly (via the `modules` array or `ModuleRegistry.registerModules`) rather
 * than through {@link enableDevValidations}. Call before any grid is created. Not intended for
 * production builds.
 */
export function configureDevValidations(options: DevValidationOptions): void {
    _applyDevValidationConfig(options);
}
