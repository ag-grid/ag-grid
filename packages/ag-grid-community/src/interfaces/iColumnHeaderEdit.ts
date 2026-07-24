export type ColumnHeaderEditApplyMode = 'live' | 'deferred';

export interface ColumnHeaderEditOptions {
    /**
     * When header name editor edits are applied: `'live'` applies every change immediately;
     * `'deferred'` applies changes via Apply and Cancel buttons.
     * @default 'live'
     */
    applyMode?: ColumnHeaderEditApplyMode;
    /**
     * Suppress highlighting the header currently being edited by the editor.
     * @default false
     */
    suppressColumnHighlighting?: boolean;
}
