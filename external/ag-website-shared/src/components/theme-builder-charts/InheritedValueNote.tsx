import { ParamModel, useParamAtom } from '@ag-website-shared/theming/ParamModel';
import type { ThemeParam } from '@ag-website-shared/theming/utils';
import styled from '@emotion/styled';

import { INHERITED_SOURCES } from './params';

/**
 * A line under a field saying its value is inherited, and from where. The panel
 * shows every param at the value it resolves to, so without this a colour the
 * theme keeps in step looks the same as one pinned where it is.
 */
export const InheritedValueNote = ({ param }: { param: string }) => {
    const [value] = useParamAtom(ParamModel.for(param as ThemeParam));
    const sources = INHERITED_SOURCES[param];

    if (value != null || !sources) {
        return null;
    }

    return <Note>Inherited from {andList(sources.map((source) => ParamModel.for(source as ThemeParam).label))}</Note>;
};

const andList = (items: string[]) =>
    items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

// Quieter than the label: a param panel is almost entirely inherited values, so
// at label weight it would read as a wall of this one sentence.
const Note = styled('span')`
    color: var(--color-fg-secondary);
    opacity: 0.6;
    font-size: 11px;
    line-height: 1.3;
`;
