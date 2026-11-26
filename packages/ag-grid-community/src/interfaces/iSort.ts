export type DisplaySortDef =
    | SortDef
    | {
          direction: 'mixed';
          type: SortType;
      };

export type SortDirection = 'asc' | 'desc' | null;

export type SortType = 'absolute' | 'default';

/**
 * Where missing values (`null` and `undefined`) are placed when sorting.
 * - `'inOrder'`: missing values are the smallest values, so they are first when sorting ascending and last when sorting descending.
 * - `'first'`: missing values are always first, in both directions.
 * - `'last'`: missing values are always last, in both directions.
 */
export type SortMissingValues = 'first' | 'last' | 'inOrder';

export type SortDef = {
    type: SortType;
    direction: SortDirection;
};

/** Locale-specific sort settings, passed to `Intl.Collator`. */
export interface AccentedSortOptions {
    /**
     * A BCP 47 language tag, or an array of tags, such as `'de'` or `['sv', 'en']`.
     * When not set, the browser's default locale is used.
     */
    locales?: string | string[];
    /**
     * Collator options, such as `sensitivity`, `caseFirst`, `numeric` or `ignorePunctuation`.
     * For example, `{ sensitivity: 'accent' }` sorts without regard to case.
     */
    options?: Intl.CollatorOptions;
}
