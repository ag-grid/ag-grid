// TODO(AG-6000): Remove once v2 filters is released.
type Mode =
    'disabled' | // V2 filters module maybe loaded, but doesn't get used.
    'mixed' | // IFilterManagerAdapter & controllers used, V1 provided filters still used.
    'full'; // V2 implementation only, with backwards-compatibility for custom filters only.

export const MODULE_MODE: Mode = 'disabled';
