import styled from '@emotion/styled';
import { _asThemeImpl } from 'ag-stack';
import { studioTheme } from 'ag-studio';
import { useEffect, useMemo } from 'react';

import type { PresetVariant } from './presets';

// A compact dashboard-shaped thumbnail rendered purely from the variant's
// accent / background swatch colours, so the preset strip stays cheap to render.
// Fills the height of its card (the PresetScroller sizes the row); the card
// supplies the width.
export const PresetPreview = ({
    label,
    variant,
    className,
}: {
    label: string;
    variant: PresetVariant;
    className?: string;
}) => {
    const theme = useMemo(() => _asThemeImpl(studioTheme.withParams(variant.params)), [variant]);
    useEffect(() => {
        const stylesheet = new CSSStyleSheet();
        stylesheet.replaceSync(theme._getParamsCss());
        document.adoptedStyleSheets.push(stylesheet);

        return () => {
            const index = document.adoptedStyleSheets.indexOf(stylesheet);
            if (index !== -1) {
                document.adoptedStyleSheets.splice(index, 1);
            }
        };
    }, [theme]);

    const studioWidgetBorder = variant.params.studioWidgetBorder as any[] | undefined;
    const studioWidgetBorderColor = studioWidgetBorder?.find((param) => typeof param === 'string');
    const studioWidgetBorderWidth = studioWidgetBorder?.find((param) => typeof param === 'number');

    const svgContent = useMemo(
        () => (
            <svg
                width="180"
                height="130"
                viewBox="0 0 180 130"
                xmlns="http://www.w3.org/2000/svg"
                style={{ background: 'var(--ag-studio-canvas-background-color)' }}
            >
                <path
                    d="M171.5 36.5V121.5H104.5V36.5H171.5ZM99.5 89.5V121.5H8.5V89.5H99.5ZM99.5 36.5V84.5H8.5V36.5H99.5ZM171.5 8.5V31.5H8.5V8.5H171.5Z"
                    fill="var(--ag-studio-widget-background-color)"
                    stroke={studioWidgetBorderColor}
                    strokeWidth={studioWidgetBorderWidth}
                />
                <path
                    d="M29 118H12V117H29V118ZM50 118H38V117H50V118ZM67 118H57V117H67V118ZM78 118H72V117H78V118ZM96 118H87V117H96V118ZM26 114H12V113H26V114ZM50 114H38V113H50V114ZM67 114H60V113H67V114ZM78 114H72V113H78V114ZM96 114H85V113H96V114ZM31 110H12V109H31V110ZM50 110H38V109H50V110ZM67 110H57V109H67V110ZM78 110H72V109H78V110ZM96 110H87V109H96V110ZM25 106H12V105H25V106ZM50 106H38V105H50V106ZM67 106H58V105H67V106ZM78 106H72V105H78V106ZM96 106H90V105H96V106ZM28 102H12V101H28V102ZM50 102H38V101H50V102ZM67 102H55V101H67V102ZM78 102H72V101H78V102ZM96 102H83V101H96V102ZM23 98H12V97H23V98ZM50 98H38V97H50V98ZM67 98H62V97H67V98ZM78 98H72V97H78V98ZM96 98H86V97H96V98ZM27 94H12V93H27V94ZM50 94H38V93H50V94ZM67 94H59V93H67V94ZM78 94H72V93H78V94ZM96 94H87V93H96V94Z"
                    fill="var(--ag-text-color)"
                />
                <path
                    d="M126 122H110V81H126V122ZM93.5 40C94.8807 40 96 41.1193 96 42.5C96 43.8807 94.8807 45 93.5 45C92.9065 45 92.3624 44.7918 91.9336 44.4463L60.7041 70.3223C60.8921 70.6734 61 71.0739 61 71.5C61 72.8807 59.8807 74 58.5 74C57.1193 74 56 72.8807 56 71.5C56 71.0235 56.1349 70.5791 56.3662 70.2002L45.9531 60.5303C45.5432 60.8242 45.0428 61 44.5 61C43.8022 61 43.1723 60.713 42.7188 60.252L16.6357 77.207C16.8649 77.5847 17 78.026 17 78.5C17 79.8807 15.8807 81 14.5 81C13.1193 81 12 79.8807 12 78.5C12 77.1193 13.1193 76 14.5 76C15.0394 76 15.5378 76.1724 15.9463 76.4629L42.1748 59.4141C42.0633 59.1307 42 58.8229 42 58.5C42 57.1193 43.1193 56 44.5 56C45.8807 56 47 57.1193 47 58.5C47 58.9764 46.864 59.4199 46.6328 59.7988L57.0459 69.4688C57.4558 69.1748 57.9571 69 58.5 69C59.0928 69 59.6359 69.208 60.0645 69.5527L91.2949 43.6768C91.1073 43.3259 91 42.9256 91 42.5C91 41.1193 92.1193 40 93.5 40Z"
                    fill="var(--ag-chart-palette-fills-1-color)"
                />
                <path d="M150 49H166V122H150V49Z" fill="var(--ag-chart-palette-fills-2-color)" />
                <path d="M130 65H146V122H130V65Z" fill="var(--ag-chart-palette-fills-3-color)" />
                <text
                    x="12"
                    y="25"
                    fill="var(--ag-text-color)"
                    style={{ fontFamily: 'var(--ag-studio-canvas-font-family)', fontSize: '14px' }}
                >
                    {label}
                </text>
            </svg>
        ),
        [label, studioWidgetBorderColor, studioWidgetBorderWidth]
    );

    return <Preview className={`${theme._getParamsClassName()} ${className}`}>{svgContent}</Preview>;
};

const Preview = styled('div')`
    flex: 1;
    min-height: 0;
    background: var(--ag-studio-canvas-background-color);
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: 1px solid
        color-mix(in srgb, var(--ag-studio-canvas-background-color), var(--ag-chart-palette-fills-1-color) 20%);
    border-radius: 8px;
    overflow: hidden;
    transition:
        box-shadow 0.2s,
        border-color 0.2s;
`;
