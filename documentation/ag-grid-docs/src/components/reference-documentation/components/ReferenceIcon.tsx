import iconStyles from '@ag-website-shared/components/icon/Icon.module.scss';
import classnames from 'classnames';
import type { FunctionComponent } from 'react';

export const REFERENCE_ICON_SPRITE_ID_PREFIX = 'ag-reference-icon-';

export const REFERENCE_ICON_NAMES = ['chevronDown', 'enterprise', 'module', 'newTab'] as const;

export type ReferenceIconName = (typeof REFERENCE_ICON_NAMES)[number];

/**
 * A reference table repeats these icons once per property row, so they point at the page's
 * <ReferenceIconSprite> rather than inlining the SVG at every call site. Emits the same
 * element and classes as <Icon>, so the shared reference styles apply unchanged.
 */
export const ReferenceIcon: FunctionComponent<{ name: ReferenceIconName; svgClasses?: string }> = ({
    name,
    svgClasses,
}) => {
    return (
        <svg aria-hidden="true" className={classnames(iconStyles.icon, 'icon', svgClasses)}>
            <use href={`#${REFERENCE_ICON_SPRITE_ID_PREFIX}${name}`}></use>
        </svg>
    );
};
