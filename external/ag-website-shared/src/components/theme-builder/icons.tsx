import type { ReactNode } from 'react';

export const verticalSpacingIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="var(--color-input-border)"
        strokeLinecap="round"
        strokeWidth="1.5"
    >
        <path strokeLinejoin="round" d="M4 3v3h16V3" />
        <path d="M7 12h10" />
        <path strokeLinejoin="round" d="M4 21v-3h16v3" />
    </svg>
);

export const horizontalSpacingIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="var(--color-input-border)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
    >
        <path d="M21 4L18 4L18 20L21 20" />
        <path d="M12 7L12 17" />
        <path d="M3 4L6 4L6 20L3 20" />
    </svg>
);

export const radiusIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
            <path
                d="M4.5 6.75L9 6.75C12.7279 6.75 15.75 9.77208 15.75 13.5L15.75 18.375"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
    </svg>
);

// Weights rise down the icon; inline styles, as the input's icon slot sets one stroke width for all.
export const borderWidthIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" strokeLinecap="round">
        <path d="M4 6h16" style={{ strokeWidth: 1.25 }} />
        <path d="M4 12h16" style={{ strokeWidth: 2.75 }} />
        <path d="M4 18h16" style={{ strokeWidth: 4.5 }} />
    </svg>
);

/** A border's heading icon: the bordered part drawn solid over a faint sketch of its surroundings. */
const borderIcon = (surroundings: ReactNode, border: ReactNode) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <g opacity="0.35">{surroundings}</g>
        {border}
    </svg>
);

const gridFrame = <rect x="2" y="3" width="12" height="10" rx="1.5" />;

export const gridOutlineBorderIcon = borderIcon(
    <>
        <line x1="2" y1="6.5" x2="14" y2="6.5" />
        <line x1="8" y1="6.5" x2="8" y2="13" />
    </>,
    gridFrame
);

export const gridRowsBorderIcon = borderIcon(
    gridFrame,
    <>
        <line x1="2" y1="6.33" x2="14" y2="6.33" />
        <line x1="2" y1="9.67" x2="14" y2="9.67" />
    </>
);

export const gridColumnsBorderIcon = borderIcon(
    gridFrame,
    <>
        <line x1="6" y1="3" x2="6" y2="13" />
        <line x1="10" y1="3" x2="10" y2="13" />
    </>
);

export const gridHeaderRowBorderIcon = borderIcon(
    <>
        {gridFrame}
        <line x1="2" y1="9.5" x2="14" y2="9.5" />
    </>,
    <line x1="2" y1="6" x2="14" y2="6" />
);

const studioFrame = <rect x="2" y="2" width="12" height="12" rx="1.5" />;

const studioWrapperBorderIcon = borderIcon(<rect x="4.5" y="4.5" width="7" height="7" rx="1" />, studioFrame);

const studioCanvasBorderIcon = borderIcon(studioFrame, <rect x="4.5" y="4.5" width="7" height="7" rx="1" />);

const studioWidgetBorderIcon = borderIcon(
    studioFrame,
    <>
        <rect x="4" y="4" width="3.5" height="8" rx="0.75" />
        <rect x="9" y="4" width="3" height="3.25" rx="0.75" />
        <rect x="9" y="8.75" width="3" height="3.25" rx="0.75" />
    </>
);

const studioWidgetToolbarBorderIcon = borderIcon(
    <rect x="2" y="5" width="12" height="9" rx="1.5" />,
    <rect x="6.5" y="2" width="7.5" height="4.5" rx="1" />
);

const seriesLabelBorderIcon = borderIcon(
    <>
        <line x1="3" y1="14" x2="3" y2="10" />
        <line x1="8" y1="14" x2="8" y2="8.5" />
        <line x1="13" y1="14" x2="13" y2="11" />
    </>,
    <rect x="4.5" y="2" width="7" height="4.5" rx="1" />
);

const menuBorderIcon = borderIcon(
    <>
        <line x1="5.5" y1="5.5" x2="10.5" y2="5.5" />
        <line x1="5.5" y1="8" x2="10.5" y2="8" />
        <line x1="5.5" y1="10.5" x2="10.5" y2="10.5" />
    </>,
    <rect x="3" y="2" width="10" height="12" rx="1.5" />
);

const tooltipBorderIcon = borderIcon(
    <>
        <line x1="4.5" y1="5" x2="11.5" y2="5" />
        <line x1="4.5" y1="7.5" x2="9" y2="7.5" />
    </>,
    <polygon points="2,2.5 14,2.5 14,10.5 9.5,10.5 8,13 6.5,10.5 2,10.5" />
);

const legendBorderIcon = borderIcon(
    <>
        <rect x="4" y="5.5" width="1.5" height="1.5" />
        <rect x="4" y="9" width="1.5" height="1.5" />
        <line x1="7.5" y1="6.25" x2="11.5" y2="6.25" />
        <line x1="7.5" y1="9.75" x2="11.5" y2="9.75" />
    </>,
    <rect x="2" y="3" width="12" height="10" rx="1.5" />
);

const buttonBorderIcon = borderIcon(
    <line x1="5.5" y1="8" x2="10.5" y2="8" />,
    <rect x="1.5" y="4.5" width="13" height="7" rx="3.5" />
);

const inputBorderIcon = borderIcon(
    <line x1="4.5" y1="6.5" x2="4.5" y2="9.5" />,
    <rect x="1.5" y="4.5" width="13" height="7" rx="1.5" />
);

const scrollbarTrackBorderIcon = borderIcon(
    <line x1="5" y1="8" x2="9" y2="8" />,
    <rect x="2" y="6" width="12" height="4" rx="2" />
);

const scrollbarThumbBorderIcon = borderIcon(
    <rect x="2" y="5" width="12" height="6" rx="3" />,
    <rect x="4" y="6.75" width="5.5" height="2.5" rx="1.25" />
);

const navigatorSeries = <polyline points="3,10 5.5,7.5 8,9 10.5,6 13,7.5" />;

const navigatorTrackBorderIcon = borderIcon(navigatorSeries, <rect x="1.5" y="4" width="13" height="8" rx="1" />);

const navigatorHandleBorderIcon = borderIcon(
    <>
        <rect x="1.5" y="4" width="13" height="8" rx="1" />
        {navigatorSeries}
    </>,
    <>
        <rect x="3.5" y="5" width="2" height="6" rx="1" />
        <rect x="10.5" y="5" width="2" height="6" rx="1" />
    </>
);

const paramIcons = {
    radius: radiusIcon,
    verticalSpacing: verticalSpacingIcon,
    horizontalSpacing: horizontalSpacingIcon,
    borderWidth: borderWidthIcon,
    studioWrapperBorder: studioWrapperBorderIcon,
    studioCanvasBorder: studioCanvasBorderIcon,
    studioWidgetBorder: studioWidgetBorderIcon,
    studioWidgetToolbarBorder: studioWidgetToolbarBorderIcon,
    seriesLabelBorder: seriesLabelBorderIcon,
    menuBorder: menuBorderIcon,
    tooltipBorder: tooltipBorderIcon,
    legendBorder: legendBorderIcon,
    buttonBorder: buttonBorderIcon,
    inputBorder: inputBorderIcon,
    scrollbarTrackBorder: scrollbarTrackBorderIcon,
    scrollbarThumbBorder: scrollbarThumbBorderIcon,
    navigatorTrackBorder: navigatorTrackBorderIcon,
    navigatorHandleBorder: navigatorHandleBorderIcon,
};

/** The icons a param can carry: in a length input, or beside a border's heading. */
export type ParamIcon = keyof typeof paramIcons;

export const iconFor = (icon?: ParamIcon): ReactNode => icon && paramIcons[icon];
