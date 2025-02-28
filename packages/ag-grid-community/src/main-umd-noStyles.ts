/*
 * Used for umd bundles without styles
 */
import { AllCommunityModule, ModuleRegistry, _setUmd } from './main';

_setUmd();
ModuleRegistry.registerModules([AllCommunityModule]);

export * from './main';
