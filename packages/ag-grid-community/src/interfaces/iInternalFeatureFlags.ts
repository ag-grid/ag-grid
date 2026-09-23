/**
 * Behaviour enabled for internal consumers only, so it is not public API. Name each flag after the behaviour.
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface InternalFeatureFlags {
    /**
     * Clicking the row that is the whole selection deselects it rather than re-selecting it.
     */
    clickToggleSelection?: boolean;
}

export type InternalFeatureFlag = keyof InternalFeatureFlags;

export interface IInternalFeatureFlagsBean {
    readonly flags: Readonly<InternalFeatureFlags>;
}
