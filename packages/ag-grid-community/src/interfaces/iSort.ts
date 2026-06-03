export type DisplaySortDef =
    | SortDef
    | {
          direction: 'mixed';
          type: SortType;
      };

export type SortDirection = 'asc' | 'desc' | null;

export type SortType = 'absolute' | 'default';

export type SortDef = {
    type: SortType;
    direction: SortDirection;
};
