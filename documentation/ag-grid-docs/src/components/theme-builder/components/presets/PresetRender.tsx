import styled from '@emotion/styled';

export const PresetRender = () => {
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

const previewHTML = `
<div class="ag-root-wrapper ag-ltr ag-layout-normal" role="presentation" grid-id="4">
    <div class="ag-root-wrapper-body ag-focus-managed ag-layout-normal" role="presentation">
        <div class="ag-root ag-unselectable ag-layout-normal" role="treegrid" aria-colcount="4" aria-rowcount="8">
            <div class="ag-grid-viewport ag-layout-normal" role="presentation">
                <div class="ag-grid-scrollable-area" role="presentation" style="width: 920px;">
                    <div class="ag-grid-pinned-top-rows" role="presentation" style="--ag-header-rows-height: 44px; --ag-top-rows-height: 0px; min-height: 44px; height: 44px;">
                        <div class="ag-grid-pinned-top-rows-container ag-focus-managed ag-pivot-off ag-header-allow-overflow" role="rowgroup" style="width: 920px;">
                            <div class="ag-row ag-header-row ag-header-row-column" role="row" aria-rowindex="1" style="top: 0px; height: 44px; width: 920px;">
                                <div class="ag-grid-pinned-left-cells" role="presentation" style="width: 56px;">
                                    <div class="ag-header-cell ag-row-number-header ag-column-first" role="columnheader" aria-colindex="1" style="top: 0px; height: 44px; width: 56px; left: 0px;"></div>
                                </div>
                                <div class="ag-grid-scrolling-cells" role="presentation">
                                    <div class="ag-header-cell ag-column-first" role="columnheader" aria-colindex="2" style="top: 0px; height: 44px; width: 220px; left: 0px;"><div class="ag-header-cell-comp-wrapper"><div class="ag-header-cell-label"><span class="ag-header-cell-text">Country</span></div></div></div>
                                    <div class="ag-header-cell" role="columnheader" aria-colindex="3" style="top: 0px; height: 44px; width: 220px; left: 220px;"><div class="ag-header-cell-comp-wrapper"><div class="ag-header-cell-label"><span class="ag-header-cell-text">Sport</span></div></div></div>
                                    <div class="ag-header-cell" role="columnheader" aria-colindex="4" style="top: 0px; height: 44px; width: 220px; left: 440px;"><div class="ag-header-cell-comp-wrapper"><div class="ag-header-cell-label"><span class="ag-header-cell-text">Name</span></div></div></div>
                                </div>
                                <div class="ag-grid-pinned-right-cells" role="presentation" style="width: 0px; display: none;"></div>
                            </div>
                        </div>
                        <div class="ag-grid-pinned-top-rows-full-width-container" role="rowgroup"></div>
                    </div>
                    <div class="ag-grid-scrolling-rows" role="presentation">
                        <div class="ag-grid-scrolling-container" role="rowgroup" style="width: 920px; height: 1400px;">
                            <div class="ag-row ag-row-position-absolute ag-row-even" role="row" aria-rowindex="2" style="top: 0px; height: 42px; width: 920px;">
                                <div class="ag-grid-pinned-left-cells" role="presentation" style="width: 56px;"><div class="ag-cell ag-column-first" role="gridcell" aria-colindex="1" style="top: 0px; height: 42px; width: 56px; left: 0px;"><span class="ag-cell-value">1</span></div></div>
                                <div class="ag-grid-scrolling-cells" role="presentation">
                                    <div class="ag-cell ag-column-first" role="gridcell" aria-colindex="2" style="top: 0px; height: 42px; width: 220px; left: 0px;"><span class="ag-cell-value">Italy</span></div>
                                    <div class="ag-cell" role="gridcell" aria-colindex="3" style="top: 0px; height: 42px; width: 220px; left: 220px;"><span class="ag-cell-value">Horse Racing</span></div>
                                    <div class="ag-cell" role="gridcell" aria-colindex="4" style="top: 0px; height: 42px; width: 220px; left: 440px;"><span class="ag-cell-value">Dimple Flanagan</span></div>
                                </div>
                                <div class="ag-grid-pinned-right-cells" role="presentation" style="width: 0px; display: none;"></div>
                            </div>
                            <div class="ag-row ag-row-position-absolute ag-row-odd ag-row-selected" role="row" aria-rowindex="3" style="top: 42px; height: 42px; width: 920px;">
                                <div class="ag-grid-pinned-left-cells" role="presentation" style="width: 56px;"><div class="ag-cell ag-column-first" role="gridcell" aria-colindex="1" style="top: 0px; height: 42px; width: 56px; left: 0px;"><span class="ag-cell-value">2</span></div></div>
                                <div class="ag-grid-scrolling-cells" role="presentation">
                                    <div class="ag-cell ag-column-first" role="gridcell" aria-colindex="2" style="top: 0px; height: 42px; width: 220px; left: 0px;"><span class="ag-cell-value">Argentina</span></div>
                                    <div class="ag-cell" role="gridcell" aria-colindex="3" style="top: 0px; height: 42px; width: 220px; left: 220px;"><span class="ag-cell-value">Bowling</span></div>
                                    <div class="ag-cell" role="gridcell" aria-colindex="4" style="top: 0px; height: 42px; width: 220px; left: 440px;"><span class="ag-cell-value">Olivia Brock</span></div>
                                </div>
                                <div class="ag-grid-pinned-right-cells" role="presentation" style="width: 0px; display: none;"></div>
                            </div>
                            <div class="ag-row ag-row-position-absolute ag-row-even" role="row" aria-rowindex="4" style="top: 84px; height: 42px; width: 920px;">
                                <div class="ag-grid-pinned-left-cells" role="presentation" style="width: 56px;"><div class="ag-cell ag-column-first" role="gridcell" aria-colindex="1" style="top: 0px; height: 42px; width: 56px; left: 0px;"><span class="ag-cell-value">3</span></div></div>
                                <div class="ag-grid-scrolling-cells" role="presentation">
                                    <div class="ag-cell ag-column-first" role="gridcell" aria-colindex="2" style="top: 0px; height: 42px; width: 220px; left: 0px;"><span class="ag-cell-value">United Kingdom</span></div>
                                    <div class="ag-cell" role="gridcell" aria-colindex="3" style="top: 0px; height: 42px; width: 220px; left: 220px;"><span class="ag-cell-value">Bobsleigh</span></div>
                                    <div class="ag-cell" role="gridcell" aria-colindex="4" style="top: 0px; height: 42px; width: 220px; left: 440px;"><span class="ag-cell-value">Ruby Connell</span></div>
                                </div>
                                <div class="ag-grid-pinned-right-cells" role="presentation" style="width: 0px; display: none;"></div>
                            </div>
                        </div>
                        <div class="ag-full-width-container" role="rowgroup" style="height: 1400px;"></div>
                    </div>
                    <div class="ag-grid-pinned-bottom-rows ag-no-bottom-rows" role="presentation" style="min-height: 0px; height: 0px;">
                        <div class="ag-grid-pinned-bottom-rows-container" role="rowgroup" style="width: 920px;"></div>
                        <div class="ag-grid-pinned-bottom-rows-full-width-container" role="rowgroup"></div>
                    </div>
                </div>
            </div>
            <div class="ag-body-horizontal-scroll ag-apple-scrollbar" aria-hidden="true" style="height: 15px; max-height: 15px; min-height: 15px;">
                <div class="ag-body-horizontal-scroll-viewport" style="height: 15px; max-height: 15px; min-height: 15px; width: calc(100% - 15px);">
                    <div class="ag-body-horizontal-scroll-container" style="width: 920px; height: 15px; max-height: 15px; min-height: 15px;"></div>
                </div>
                <div class="ag-body-horizontal-scroll-end-spacer" style="width: 15px; max-width: 15px; min-width: 15px; height: 15px;"></div>
            </div>
            <div class="ag-body-vertical-scroll ag-apple-scrollbar" aria-hidden="true" style="width: 15px; max-width: 15px; min-width: 15px; top: 44px; bottom: 15px; right: 0px; position: absolute; z-index: 3;">
                <div class="ag-body-vertical-scroll-viewport" style="width: 15px; max-width: 15px; min-width: 15px;"><div class="ag-body-vertical-scroll-container" style="width: 15px; max-width: 15px; min-width: 15px; height: 1400px;"></div></div>
            </div>
        </div>
    </div>
</div>
`;
