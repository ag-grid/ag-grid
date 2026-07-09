import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { _registerModule } from '../modules/moduleRegistry';
import { VERSION } from '../version';
import { renderBootstrapPanel } from './errorOverlay/bootstrapPanel';
import errorOverlayCSS from './errorOverlay/errorOverlay.css';
import { ErrorOverlayComponent } from './errorOverlay/errorOverlayComponent';
import { ErrorOverlayService } from './errorOverlay/errorOverlayService';
import { _provideBootstrapPanelRenderer } from './logging';
import type { DevValidationOptions } from './validationConfig';
import { _applyDevValidationConfig, _enableDiagnosticCapture } from './validationConfig';
import { ValidationService } from './validationService';

// Registering the module is the opt-in: enable capture so diagnostics buffer for the overlay, and
// provide the bootstrap panel renderer so a pre-init failure (which aborts before any bean exists) is
// still surfaced. Runs on every registration path, including enableDevValidations/ValidationModule.with.
function onValidationModuleRegister(): void {
    _enableDiagnosticCapture();
    _provideBootstrapPanelRenderer(renderBootstrapPanel);
}

type ValidationModuleType = {
    /**
     * Configures development-time diagnostics, then returns the module to register, e.g.
     * `ModuleRegistry.registerModules([ValidationModule.with({ throwOn: 'error' })])`. Configuration
     * is global (see {@link DevValidationOptions}) — passing different options per grid does not scope
     * them per grid; the last call wins for all grids.
     */
    with: (options?: DevValidationOptions) => _ModuleWithoutApi;
} & _ModuleWithoutApi;

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
export const ValidationModule: ValidationModuleType = {
    moduleName: 'Validation',
    version: VERSION,
    beans: [ValidationService, ErrorOverlayService],
    userComponents: {
        agErrorOverlay: ErrorOverlayComponent,
    },
    css: [errorOverlayCSS],
    onRegister: onValidationModuleRegister,
    with: (options) => {
        _applyDevValidationConfig(options);
        return ValidationModule;
    },
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
 * This is the promoted equivalent of registering the module yourself, i.e.
 * `ModuleRegistry.registerModules([ValidationModule.with(options)])` (or including
 * `ValidationModule.with(options)` in the `modules` array passed to a framework wrapper).
 *
 * Call this before any grid is created, and from the same scope (module/bundle) that registers
 * your other modules — registration is global, so it must run before grid initialisation to take
 * effect. Configuration is global too: calling again (or registering `ValidationModule.with` per
 * grid) replaces the previous options for all grids, with the last call winning. Not intended for
 * production builds.
 *
 * Pass {@link DevValidationOptions} to configure development-time diagnostics, e.g. `{ throwOn: 'error' }`.
 */
export function enableDevValidations(options?: DevValidationOptions): void {
    _registerModule(ValidationModule.with(options), undefined);
}
