import styled from '@emotion/styled';

import { useGridPreviewHTML } from './grid-dom';

export const PresetRender = () => {
    const previewHTML = useGridPreviewHTML();
    return (
        <Wrapper className="preset-render" tabIndex={1}>
            <GridContainer dangerouslySetInnerHTML={{ __html: previewHTML }} />
        </Wrapper>
    );
};

const Wrapper = styled('div')`
    width: 350px;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    cursor: pointer;

    background-color: color-mix(in srgb, var(--page-background-color, transparent), var(--color-fg-primary) 3%);
    border: solid 1px color-mix(in srgb, var(--page-background-color, transparent), var(--color-fg-primary) 7%);

    transition:
        background-color 0.25s,
        border-color 0.25s;

    :hover {
        border-color: color-mix(in srgb, var(--page-background-color, transparent), var(--color-fg-primary) 10%);
        background-color: color-mix(in srgb, var(--page-background-color, transparent), var(--color-fg-primary) 6%);
    }
`;

const GridContainer = styled('div')`
    position: absolute;
    top: 25px;
    left: 25px;
    width: 600px;
    height: 500px;
    pointer-events: none;

    transition: transform 0.25s;

    .preset-render:hover & {
        transform: translate(-5px, -5px);
    }
`;
