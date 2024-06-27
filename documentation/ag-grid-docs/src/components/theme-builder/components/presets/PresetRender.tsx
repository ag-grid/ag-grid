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
<div class="ag-root-wrapper ag-ltr ag-layout-normal" role="presentation" grid-id="4"><div class="ag-column-drop-wrapper" role="presentation"></div><div class="ag-root-wrapper-body ag-focus-managed ag-layout-normal" role="presentation"><div class="ag-tab-guard ag-tab-guard-top" role="presentation" tabindex="0"></div><!-- AG Grid Body --><div class="ag-root ag-unselectable ag-layout-normal" role="treegrid" aria-colcount="6" aria-rowcount="501"><div class="ag-header ag-pivot-off ag-header-allow-overflow" role="presentation" style="position: relative; height: var(--ag-header-height); min-height: var(--ag-header-height); max-height: var(--ag-header-height);"><div class="ag-header-viewport " role="presentation"><div class="ag-header-container" role="rowgroup" style="width: 925.796875px;"><div class="ag-header-row ag-header-row-column" role="row" aria-rowindex="1" style="width: 910.796875px; position: static; display: flex;"><div class="ag-header-cell ag-column-first ag-header-cell-sortable ag-focus-managed" col-id="country" role="columnheader" aria-colindex="1" tabindex="-1" aria-sort="none" style="width: 152px; left: 0px; position: static;"><div class="ag-header-cell-resize" role="presentation" aria-hidden="false"></div><div role="presentation" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-header-select-all" aria-hidden="true">
                
                <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                    <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-619-input" tabindex="-1" aria-label="Press Space to toggle all rows selection (unchecked)">
                </div>
            </div><div class="ag-header-cell-comp-wrapper" role="presentation"><div class="ag-cell-label-container" role="presentation">
            <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button ag-header-menu-icon ag-header-menu-always-show" aria-hidden="true"><span class="ag-icon ag-icon-menu-alt" unselectable="on" role="presentation"></span></span>
            
            <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                <span ref="eText" class="ag-header-cell-text">Country</span>
                
                <!--AG-SORT-INDICATOR--><span class="ag-sort-indicator-container" ref="eSortIndicator">
            
            
            
            
            
        </span>
            </div>
        </div></div></div><div class="ag-header-cell ag-header-cell-sortable ag-focus-managed" col-id="sport" role="columnheader" aria-colindex="2" tabindex="-1" aria-sort="none" style="width: 152px; left: 152px; position: static;"><div class="ag-header-cell-resize" role="presentation" aria-hidden="false"></div><div class="ag-header-cell-comp-wrapper" role="presentation"><div class="ag-cell-label-container" role="presentation">
            <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button ag-header-menu-icon ag-header-menu-always-show" aria-hidden="true"><span class="ag-icon ag-icon-menu-alt" unselectable="on" role="presentation"></span></span>
            
            <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                <span ref="eText" class="ag-header-cell-text">Sport</span>
                
                <!--AG-SORT-INDICATOR--><span class="ag-sort-indicator-container" ref="eSortIndicator">
            
            
            
            
            
        </span>
            </div>
        </div></div></div><div class="ag-header-cell ag-header-cell-sortable ag-focus-managed" col-id="name" role="columnheader" aria-colindex="3" tabindex="-1" aria-sort="none" style="width: 152px; left: 304px; position: static;"><div class="ag-header-cell-resize" role="presentation" aria-hidden="false"></div><div class="ag-header-cell-comp-wrapper" role="presentation"><div class="ag-cell-label-container" role="presentation">
            <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button ag-header-menu-icon ag-header-menu-always-show" aria-hidden="true"><span class="ag-icon ag-icon-menu-alt" unselectable="on" role="presentation"></span></span>
            
            <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                <span ref="eText" class="ag-header-cell-text">Name</span>
                
                <!--AG-SORT-INDICATOR--><span class="ag-sort-indicator-container" ref="eSortIndicator">
            
            
            
            
            
        </span>
            </div>
        </div></div></div></div></div></div></div><!-- AG Pinned Top --><div class="ag-floating-top" role="presentation" style="height: 0px; min-height: 0px; display: none; overflow-y: hidden;"><!-- AG Row Container topLeft --><!-- AG Row Container topCenter --><div class="ag-floating-top-viewport" role="presentation"><div class="ag-floating-top-container" role="rowgroup" style="width: 910.796875px; transform: translateX(0px);"></div></div><!-- AG Row Container topRight --><!-- AG Row Container topFullWidth --><div class="ag-floating-top-full-width-container" role="rowgroup"></div></div><div class="ag-body ag-layout-normal" role="presentation"><!-- AG Middle --><div class="ag-body-viewport ag-row-no-animation ag-layout-normal" role="presentation" style="width: calc(100% + 0px);"><!-- AG Row Container left --><!-- AG Row Container center --><div class="ag-center-cols-viewport" role="presentation" style="height: 15000px;"><div class="ag-center-cols-container" role="rowgroup" style="width: 910.796875px; height: 15000px;"><div role="row" row-index="0" row-id="0" class="ag-row-even ag-row-no-focus ag-row ag-row-level-0 ag-row-position-absolute ag-row-first ag-row-not-inline-editing" aria-rowindex="2" aria-selected="false" style="position: relative;"><div tabindex="-1" role="gridcell" col-id="country" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-column-first ag-cell-range-left" aria-colindex="1" style="left: 0px; width: 152px;"><div class="ag-cell-wrapper" role="presentation"><div class="ag-selection-checkbox" role="presentation">
                <!--AG-CHECKBOX--><div role="presentation" ref="eCheckbox" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
                
                <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                    <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-647-input" tabindex="-1" aria-label="Press Space to toggle row selection (unchecked)">
                </div>
            </div>
            </div><span role="presentation" id="cell-country-804" class="ag-cell-value">Italy</span></div></div><div tabindex="-1" role="gridcell" col-id="sport" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 152px; width: 152px;">🏇 Horse Racing</div><div tabindex="-1" role="gridcell" col-id="name" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 304px; width: 152px;">Dimple Flanagan</div></div><div role="row" row-index="1" row-id="1" class="ag-row-odd ag-row-no-focus ag-row ag-row-level-0 ag-row-position-absolute ag-row-not-inline-editing ag-row-selected" aria-rowindex="3" aria-selected="false" style="position: relative;"><div tabindex="-1" role="gridcell" col-id="country" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-column-first ag-cell-range-left" aria-colindex="1" style="left: 0px; width: 152px;"><div class="ag-cell-wrapper" role="presentation"><div class="ag-selection-checkbox" role="presentation">
                <!--AG-CHECKBOX--><div role="presentation" ref="eCheckbox" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-checked">
                
                <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper ag-checked" role="presentation">
                    <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-649-input" tabindex="-1" aria-label="Press Space to toggle row selection (unchecked)">
                </div>
            </div>
            </div><span role="presentation" id="cell-country-810" class="ag-cell-value">Argentina</span></div></div><div tabindex="-1" role="gridcell" col-id="sport" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 152px; width: 152px;">🎳 Bowling</div><div tabindex="-1" role="gridcell" col-id="name" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 304px; width: 152px;">Olivia Brock</div></div><div role="row" row-index="2" row-id="2" class="ag-row-even ag-row-no-focus ag-row ag-row-level-0 ag-row-position-absolute ag-row-not-inline-editing" aria-rowindex="4" aria-selected="false" style="position: relative;"><div tabindex="-1" role="gridcell" col-id="country" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-column-first ag-cell-range-left" aria-colindex="1" style="left: 0px; width: 152px;"><div class="ag-cell-wrapper" role="presentation"><div class="ag-selection-checkbox" role="presentation">
                <!--AG-CHECKBOX--><div role="presentation" ref="eCheckbox" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
                
                <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                    <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-651-input" tabindex="-1" aria-label="Press Space to toggle row selection (unchecked)">
                </div>
            </div>
            </div><span role="presentation" id="cell-country-816" class="ag-cell-value">United Kingdom</span></div></div><div tabindex="-1" role="gridcell" col-id="sport" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 152px; width: 152px;">🛷 Bobsleigh</div><div tabindex="-1" role="gridcell" col-id="name" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 304px; width: 152px;">Ruby Connell</div></div><div role="row" row-index="3" row-id="3" class="ag-row-odd ag-row-no-focus ag-row ag-row-level-0 ag-row-position-absolute ag-row-not-inline-editing" aria-rowindex="5" aria-selected="false" style="position: relative;"><div tabindex="-1" role="gridcell" col-id="country" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-column-first ag-cell-range-left" aria-colindex="1" style="left: 0px; width: 152px;"><div class="ag-cell-wrapper" role="presentation"><div class="ag-selection-checkbox" role="presentation">
                <!--AG-CHECKBOX--><div role="presentation" ref="eCheckbox" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
                
                <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                    <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-653-input" tabindex="-1" aria-label="Press Space to toggle row selection (unchecked)">
                </div>
            </div>
            </div><span role="presentation" id="cell-country-822" class="ag-cell-value">Portugal</span></div></div><div tabindex="-1" role="gridcell" col-id="sport" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 152px; width: 152px;">🛹 Skateboarding</div><div tabindex="-1" role="gridcell" col-id="name" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 304px; width: 152px;">Amelia Cole</div></div><div role="row" row-index="4" row-id="4" class="ag-row-even ag-row-no-focus ag-row ag-row-level-0 ag-row-position-absolute ag-row-not-inline-editing" aria-rowindex="6" aria-selected="false" style="position: relative;"><div tabindex="-1" role="gridcell" col-id="country" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-column-first ag-cell-range-left" aria-colindex="1" style="left: 0px; width: 152px;"><div class="ag-cell-wrapper" role="presentation"><div class="ag-selection-checkbox" role="presentation">
                <!--AG-CHECKBOX--><div role="presentation" ref="eCheckbox" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
                
                <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                    <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-655-input" tabindex="-1" aria-label="Press Space to toggle row selection (unchecked)">
                </div>
            </div>
            </div><span role="presentation" id="cell-country-828" class="ag-cell-value">Belgium</span></div></div><div tabindex="-1" role="gridcell" col-id="sport" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 152px; width: 152px;">🎯 Darts</div><div tabindex="-1" role="gridcell" col-id="name" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 304px; width: 152px;">Freya Donovan</div></div><div role="row" row-index="5" row-id="5" class="ag-row-odd ag-row-no-focus ag-row ag-row-level-0 ag-row-position-absolute ag-row-not-inline-editing" aria-rowindex="7" aria-selected="false" style="position: relative;"><div tabindex="-1" role="gridcell" col-id="country" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-column-first ag-cell-range-left" aria-colindex="1" style="left: 0px; width: 152px;"><div class="ag-cell-wrapper" role="presentation"><div class="ag-selection-checkbox" role="presentation">
                <!--AG-CHECKBOX--><div role="presentation" ref="eCheckbox" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
                
                <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                    <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-657-input" tabindex="-1" aria-label="Press Space to toggle row selection (unchecked)">
                </div>
            </div>
            </div><span role="presentation" id="cell-country-834" class="ag-cell-value">Spain</span></div></div><div tabindex="-1" role="gridcell" col-id="sport" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 152px; width: 152px;">🏉 Rugby</div><div tabindex="-1" role="gridcell" col-id="name" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 304px; width: 152px;">Andrew Bryson</div></div><div role="row" row-index="6" row-id="6" class="ag-row-even ag-row-no-focus ag-row ag-row-level-0 ag-row-position-absolute ag-row-not-inline-editing" aria-rowindex="8" aria-selected="false" style="position: relative;"><div tabindex="-1" role="gridcell" col-id="country" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-column-first ag-cell-range-left" aria-colindex="1" style="left: 0px; width: 152px;"><div class="ag-cell-wrapper" role="presentation"><div class="ag-selection-checkbox" role="presentation">
                <!--AG-CHECKBOX--><div role="presentation" ref="eCheckbox" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
                
                <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                    <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-659-input" tabindex="-1" aria-label="Press Space to toggle row selection (unchecked)">
                </div>
            </div>
            </div><span role="presentation" id="cell-country-840" class="ag-cell-value">Germany</span></div></div><div tabindex="-1" role="gridcell" col-id="sport" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 152px; width: 152px;">🏑 Field Hockey</div><div tabindex="-1" role="gridcell" col-id="name" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 304px; width: 152px;">Amelia Keegan</div></div></div></div><!-- AG Row Container right --><!-- AG Row Container fullWidth --><div class="ag-full-width-container" role="rowgroup" style="height: 15000px;"></div></div><!-- AG Fake Vertical Scroll --></div><!-- AG Sticky Top --><div class="ag-sticky-top" role="presentation" style="height: 0px; top: 44px; width: 100%;"><!-- AG Row Container stickyTopLeft --><!-- AG Row Container stickyTopCenter --><div class="ag-sticky-top-viewport" role="presentation"><div class="ag-sticky-top-container" role="rowgroup" style="width: 910.796875px; transform: translateX(0px);"></div></div><!-- AG Row Container stickyTopRight --><!-- AG Row Container stickyTopFullWidth --><div class="ag-sticky-top-full-width-container" role="rowgroup"></div></div><div class="ag-sticky-bottom" role="presentation" style="height: 0px; bottom: 15px; width: 100%;"><!-- AG Row Container stickyBottomLeft --><!-- AG Row Container stickyBottomCenter --><div class="ag-sticky-bottom-viewport" role="presentation"><div class="ag-sticky-bottom-container" role="rowgroup" style="width: 910.796875px;"></div></div><!-- AG Row Container stickyBottomRight --><!-- AG Row Container stickyBottomFullWidth --><div class="ag-sticky-bottom-full-width-container" role="rowgroup"></div></div><!-- AG Pinned Bottom --><div class="ag-floating-bottom" role="presentation" style="height: 0px; min-height: 0px; display: none; overflow-y: hidden;"><!-- AG Row Container bottomLeft --><!-- AG Row Container bottomCenter --><div class="ag-floating-bottom-viewport" role="presentation"><div class="ag-floating-bottom-container" role="rowgroup" style="width: 910.796875px; transform: translateX(0px);"></div></div><!-- AG Row Container bottomRight --><!-- AG Row Container bottomFullWidth --><div class="ag-floating-bottom-full-width-container" role="rowgroup"></div></div><!-- AG Fake Horizontal Scroll --><div class="ag-body-horizontal-scroll ag-apple-scrollbar" aria-hidden="true" style="height: 15px; max-height: 15px; min-height: 15px;">
            <div class="ag-horizontal-left-spacer ag-scroller-corner" ref="eLeftSpacer" style="width: 0px; max-width: 0px; min-width: 0px;"></div>
            <div class="ag-body-horizontal-scroll-viewport" ref="eViewport" style="height: 15px; max-height: 15px; min-height: 15px;">
                <div class="ag-body-horizontal-scroll-container" ref="eContainer" style="width: 910.796875px; height: 15px; max-height: 15px; min-height: 15px;"></div>
            </div>
            <div class="ag-horizontal-right-spacer ag-scroller-corner" ref="eRightSpacer" style="width: 15px; max-width: 15px; min-width: 15px;"></div>
        </div><!-- AG Overlay Wrapper --></div><div class="ag-tab-guard ag-tab-guard-bottom" role="presentation" tabindex="0"></div></div></div>
`;
