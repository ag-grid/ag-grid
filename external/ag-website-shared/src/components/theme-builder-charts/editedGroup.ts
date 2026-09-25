import { atom, useAtomValue, useSetAtom } from 'jotai';

/**
 * Which group of params the user is working in, so the preview can put something
 * on screen for as long as it is being edited. A tooltip is drawn per hover, so
 * editing `tooltipBackgroundColor` otherwise changes nothing the user can see.
 */
const editedGroupAtom = atom<string | null>(null);

export const useEditedGroup = () => useAtomValue(editedGroupAtom);

export const useSetEditedGroup = () => useSetAtom(editedGroupAtom);
