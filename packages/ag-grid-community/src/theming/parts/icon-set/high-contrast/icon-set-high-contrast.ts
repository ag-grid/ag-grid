import type { Part } from 'ag-stack';
import { createPart } from 'ag-stack';

import { getQuartzIconsCss } from '../quartz/quartz-icon-data';
import { highContrastIconSvgs } from './high-contrast-icon-data';

const getHighContrastIconsCss = () => {
    let result = getQuartzIconsCss();
    for (const iconName of Object.keys(highContrastIconSvgs)) {
        const iconSvg = highContrastIconSvgs[iconName];
        result += `.ag-icon-${iconName}::before { mask-image: url('data:image/svg+xml,${encodeURIComponent(iconSvg)}'); }\n`;
    }
    return result;
};

/**
 * The Quartz icon set with the icons the high contrast theme redraws on an
 * 18px grid, so they stay solid at its 18px icon size.
 */
export const iconSetHighContrast: Part<unknown> = /*#__PURE__*/ createPart({
    feature: 'iconSet',
    css: getHighContrastIconsCss,
});
