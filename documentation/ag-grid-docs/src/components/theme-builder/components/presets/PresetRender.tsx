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
<div class="ag-theme-buttonStyle-1 ag-theme-checkboxStyle-2 ag-theme-iconSet-3 ag-theme-tabStyle-4 ag-theme-inputStyle-5 ag-theme-columnDropStyle-6 ag-theme-params-10" style="height: 100%; --ag-internal-row-border-width: 1px;">
	<div class="ag-root-wrapper ag-ltr ag-layout-normal" role="presentation" grid-id="2">
		<div class="ag-root-wrapper-body ag-focus-managed ag-layout-normal" role="presentation">
			<div class="ag-root ag-unselectable ag-layout-normal ag-body-horizontal-content-no-gap ag-has-left-pinned-cols ag-body-vertical-content-no-gap" role="presentation" style="--ag-internal-pinned-left-sticky-offset: 0px; --ag-internal-pinned-right-sticky-offset: 15px;">
				<div class="ag-grid-viewport ag-layout-normal" role="grid" aria-colcount="7" aria-multiselectable="true" aria-rowcount="501">
					<div class="ag-grid-scrollable-area" role="rowgroup" style="width: 1335px;">
						<div class="ag-grid-pinned-top-rows" role="presentation" style="--ag-top-rows-height: 0px; min-height: calc(var(--ag-header-rows-height, 0px) + 0px); height: calc(var(--ag-header-rows-height, 0px) + 0px); --ag-header-rows-height: 49px;">
							<div role="presentation" class="ag-header ag-pivot-off ag-header-allow-overflow" style="height: 49px;">
								<div class="ag-header-row ag-header-row-column ag-focus-managed" role="row" tabindex="0" aria-rowindex="1" style="top: 0px; height: 48px; width: 1335px;">
									<div class="ag-grid-pinned-left-cells" role="presentation" style="width: 60px;">
										<div class="ag-header-cell ag-column-first ag-header-parent-hidden ag-row-number-header ag-row-number-selection-enabled ag-focus-managed" role="columnheader" col-id="ag-Grid-RowNumbersColumn" aria-colindex="1" tabindex="-1" aria-label="Row Number" style="top: 0px; height: 48px; width: 60px; left: 0px;">
											<div class="ag-header-cell-resize ag-hidden" role="presentation" aria-hidden="true">
											</div>
											<div class="ag-header-cell-comp-wrapper" role="presentation">
												<div class="ag-cell-label-container" role="presentation">
													<div class="ag-header-cell-label" data-ref="eLabel" role="presentation">
														<span class="ag-header-cell-text" data-ref="eText"></span> <span class="ag-header-icon ag-header-label-icon ag-filter-icon ag-hidden" data-ref="eFilter" aria-hidden="true"><span class="ag-icon ag-icon-filter" role="presentation" unselectable="on"></span></span> 
														<span class="ag-sort-indicator-container" data-ref="eSortIndicator"> <span class="ag-sort-indicator-icon ag-sort-order ag-hidden" data-ref="eSortOrder" aria-hidden="true"></span> <span class="ag-sort-indicator-icon ag-sort-ascending-icon ag-hidden" data-ref="eSortAsc" aria-hidden="true"></span> <span class="ag-sort-indicator-icon ag-sort-descending-icon ag-hidden" data-ref="eSortDesc" aria-hidden="true"></span> <span class="ag-sort-indicator-icon ag-sort-mixed-icon ag-hidden" data-ref="eSortMixed" aria-hidden="true"><span class="ag-icon ag-icon-none" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-absolute-ascending-icon ag-hidden" data-ref="eSortAbsoluteAsc" aria-hidden="true"></span> <span class="ag-sort-indicator-icon ag-sort-absolute-descending-icon ag-hidden" data-ref="eSortAbsoluteDesc" aria-hidden="true"></span> <span class="ag-sort-indicator-icon ag-sort-none-icon ag-hidden" data-ref="eSortNone" aria-hidden="true"></span> </span> 
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="ag-grid-scrolling-cells" role="presentation" style="width: 1260px;">
										<div class="ag-header-cell ag-header-parent-hidden ag-header-cell-sortable ag-focus-managed" role="columnheader" col-id="country" aria-colindex="2" tabindex="-1" aria-sort="none" style="top: 0px; height: 48px; width: 210px; left: 0px; touch-action: none;">
											<div class="ag-header-cell-resize ag-hidden" role="presentation" aria-hidden="true">
											</div>
											<div class="ag-header-cell-comp-wrapper" role="presentation">
												<div class="ag-cell-label-container" role="presentation">
													<span class="ag-header-icon ag-header-cell-menu-button ag-header-menu-icon ag-header-menu-always-show" data-ref="eMenu" aria-hidden="true"><span class="ag-icon ag-icon-menu-alt" role="presentation" unselectable="on"></span></span> <span class="ag-header-icon ag-header-cell-filter-button" data-ref="eFilterButton" aria-hidden="true"><span class="ag-icon ag-icon-filter" role="presentation" unselectable="on"></span></span> 
													<div class="ag-header-cell-label" data-ref="eLabel" role="presentation">
														<span class="ag-header-cell-text" data-ref="eText">Country</span> 
														<span class="ag-sort-indicator-container" data-ref="eSortIndicator"> <span class="ag-sort-indicator-icon ag-sort-order ag-hidden" data-ref="eSortOrder" aria-hidden="true"></span> <span class="ag-sort-indicator-icon ag-sort-ascending-icon ag-hidden" data-ref="eSortAsc" aria-hidden="true"><span class="ag-icon ag-icon-asc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-descending-icon ag-hidden" data-ref="eSortDesc" aria-hidden="true"><span class="ag-icon ag-icon-desc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-mixed-icon ag-hidden" data-ref="eSortMixed" aria-hidden="true"><span class="ag-icon ag-icon-none" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-absolute-ascending-icon ag-hidden" data-ref="eSortAbsoluteAsc" aria-hidden="true"><span class="ag-icon ag-icon-aasc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-absolute-descending-icon ag-hidden" data-ref="eSortAbsoluteDesc" aria-hidden="true"><span class="ag-icon ag-icon-adesc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-none-icon ag-hidden" data-ref="eSortNone" aria-hidden="true"><span class="ag-icon ag-icon-none" role="presentation" unselectable="on"></span></span> </span> 
													</div>
												</div>
											</div>
										</div>
										<div class="ag-header-cell ag-header-parent-hidden ag-header-cell-sortable ag-focus-managed" role="columnheader" col-id="sport" aria-colindex="3" tabindex="-1" aria-sort="none" style="top: 0px; height: 48px; width: 210px; left: 210px; touch-action: none;">
											<div class="ag-header-cell-resize ag-hidden" role="presentation" aria-hidden="true">
											</div>
											<div class="ag-header-cell-comp-wrapper" role="presentation">
												<div class="ag-cell-label-container" role="presentation">
													<span class="ag-header-icon ag-header-cell-menu-button ag-header-menu-icon ag-header-menu-always-show" data-ref="eMenu" aria-hidden="true"><span class="ag-icon ag-icon-menu-alt" role="presentation" unselectable="on"></span></span> <span class="ag-header-icon ag-header-cell-filter-button" data-ref="eFilterButton" aria-hidden="true"><span class="ag-icon ag-icon-filter" role="presentation" unselectable="on"></span></span> 
													<div class="ag-header-cell-label" data-ref="eLabel" role="presentation">
														<span class="ag-header-cell-text" data-ref="eText">Sport</span> 
														<span class="ag-sort-indicator-container" data-ref="eSortIndicator"> <span class="ag-sort-indicator-icon ag-sort-order ag-hidden" data-ref="eSortOrder" aria-hidden="true"></span> <span class="ag-sort-indicator-icon ag-sort-ascending-icon ag-hidden" data-ref="eSortAsc" aria-hidden="true"><span class="ag-icon ag-icon-asc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-descending-icon ag-hidden" data-ref="eSortDesc" aria-hidden="true"><span class="ag-icon ag-icon-desc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-mixed-icon ag-hidden" data-ref="eSortMixed" aria-hidden="true"><span class="ag-icon ag-icon-none" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-absolute-ascending-icon ag-hidden" data-ref="eSortAbsoluteAsc" aria-hidden="true"><span class="ag-icon ag-icon-aasc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-absolute-descending-icon ag-hidden" data-ref="eSortAbsoluteDesc" aria-hidden="true"><span class="ag-icon ag-icon-adesc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-none-icon ag-hidden" data-ref="eSortNone" aria-hidden="true"><span class="ag-icon ag-icon-none" role="presentation" unselectable="on"></span></span> </span> 
													</div>
												</div>
											</div>
										</div>
										<div class="ag-header-cell ag-header-parent-hidden ag-header-cell-sortable ag-focus-managed" role="columnheader" col-id="name" aria-colindex="4" tabindex="-1" aria-sort="none" style="top: 0px; height: 48px; width: 210px; left: 420px; touch-action: none;">
											<div class="ag-header-cell-resize ag-hidden" role="presentation" aria-hidden="true">
											</div>
											<div class="ag-header-cell-comp-wrapper" role="presentation">
												<div class="ag-cell-label-container" role="presentation">
													<span class="ag-header-icon ag-header-cell-menu-button ag-header-menu-icon ag-header-menu-always-show" data-ref="eMenu" aria-hidden="true"><span class="ag-icon ag-icon-menu-alt" role="presentation" unselectable="on"></span></span> <span class="ag-header-icon ag-header-cell-filter-button" data-ref="eFilterButton" aria-hidden="true"><span class="ag-icon ag-icon-filter" role="presentation" unselectable="on"></span></span> 
													<div class="ag-header-cell-label" data-ref="eLabel" role="presentation">
														<span class="ag-header-cell-text" data-ref="eText">Name</span> 
														<span class="ag-sort-indicator-container" data-ref="eSortIndicator"> <span class="ag-sort-indicator-icon ag-sort-order ag-hidden" data-ref="eSortOrder" aria-hidden="true"></span> <span class="ag-sort-indicator-icon ag-sort-ascending-icon ag-hidden" data-ref="eSortAsc" aria-hidden="true"><span class="ag-icon ag-icon-asc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-descending-icon ag-hidden" data-ref="eSortDesc" aria-hidden="true"><span class="ag-icon ag-icon-desc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-mixed-icon ag-hidden" data-ref="eSortMixed" aria-hidden="true"><span class="ag-icon ag-icon-none" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-absolute-ascending-icon ag-hidden" data-ref="eSortAbsoluteAsc" aria-hidden="true"><span class="ag-icon ag-icon-aasc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-absolute-descending-icon ag-hidden" data-ref="eSortAbsoluteDesc" aria-hidden="true"><span class="ag-icon ag-icon-adesc" role="presentation" unselectable="on"></span></span> <span class="ag-sort-indicator-icon ag-sort-none-icon ag-hidden" data-ref="eSortNone" aria-hidden="true"><span class="ag-icon ag-icon-none" role="presentation" unselectable="on"></span></span> </span> 
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="ag-grid-scrolling-rows ag-layout-normal" role="presentation">
							<div class="ag-grid-scrolling-container ag-row-no-animation" role="presentation" style="width: 1335px; --ag-pinned-row-border-width: 1px; height: 21000px;">
								<div role="row" row-index="0" row-id="0" tabindex="0" class="ag-row-even ag-row-no-focus ag-row ag-row-level-0 ag-row-first" aria-rowindex="2">
									<div class="ag-grid-pinned-left-cells" role="presentation" style="width: 60px;">
										<div class="ag-grid-container-wrapper" role="presentation" style="width: 60px;">
											<div role="rowheader" col-id="ag-Grid-RowNumbersColumn" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-last-left-pinned ag-column-first ag-row-number-cell ag-row-number-selection-enabled ag-cell-value" aria-colindex="1" style="left: 0px; width: 60px;">
												1
											</div>
										</div>
									</div>
									<div class="ag-grid-scrolling-cells" role="presentation">
										<div class="ag-grid-container-wrapper" role="presentation" style="width: 1260px;">
											<div role="gridcell" col-id="country" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 0px; width: 210px;">
												Iceland
											</div>
											<div role="gridcell" col-id="sport" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 210px; width: 210px;">
												🏑 Field Hockey
											</div>
											<div role="gridcell" col-id="name" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="4" style="left: 420px; width: 210px;">
												Dimple Kade
											</div>
										</div>
									</div>
								</div>
								<div role="row" row-index="1" row-id="1" tabindex="0" class="ag-row-odd ag-row-no-focus ag-row ag-row-level-0" aria-rowindex="3">
									<div class="ag-grid-pinned-left-cells" role="presentation" style="width: 60px;">
										<div class="ag-grid-container-wrapper" role="presentation" style="width: 60px;">
											<div role="rowheader" col-id="ag-Grid-RowNumbersColumn" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-last-left-pinned ag-column-first ag-row-number-cell ag-row-number-selection-enabled ag-cell-value" aria-colindex="1" style="left: 0px; width: 60px;">
												2
											</div>
										</div>
									</div>
									<div class="ag-grid-scrolling-cells" role="presentation">
										<div class="ag-grid-container-wrapper" role="presentation" style="width: 1260px;">
											<div role="gridcell" col-id="country" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 0px; width: 210px;">
												Venezuela
											</div>
											<div role="gridcell" col-id="sport" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 210px; width: 210px;">
												🏒 Ice Hockey
											</div>
											<div role="gridcell" col-id="name" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="4" style="left: 420px; width: 210px;">
												Isabella Jacoby
											</div>
										</div>
									</div>
								</div>
								<div role="row" row-index="2" row-id="2" tabindex="0" class="ag-row-even ag-row-no-focus ag-row ag-row-level-0" aria-rowindex="4">
									<div class="ag-grid-pinned-left-cells" role="presentation" style="width: 60px;">
										<div class="ag-grid-container-wrapper" role="presentation" style="width: 60px;">
											<div role="rowheader" col-id="ag-Grid-RowNumbersColumn" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-last-left-pinned ag-column-first ag-row-number-cell ag-row-number-selection-enabled ag-cell-value" aria-colindex="1" style="left: 0px; width: 60px;">
												3
											</div>
										</div>
									</div>
									<div class="ag-grid-scrolling-cells" role="presentation">
										<div class="ag-grid-container-wrapper" role="presentation" style="width: 1260px;">
											<div role="gridcell" col-id="country" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 0px; width: 210px;">
												Belgium
											</div>
											<div role="gridcell" col-id="sport" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 210px; width: 210px;">
												🏹 Archery
											</div>
											<div role="gridcell" col-id="name" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="4" style="left: 420px; width: 210px;">
												Daisy Kingston
											</div>
										</div>
									</div>
								</div>
								<div role="row" row-index="3" row-id="3" tabindex="0" class="ag-row-odd ag-row-no-focus ag-row ag-row-level-0" aria-rowindex="5">
									<div class="ag-grid-pinned-left-cells" role="presentation" style="width: 60px;">
										<div class="ag-grid-container-wrapper" role="presentation" style="width: 60px;">
											<div role="rowheader" col-id="ag-Grid-RowNumbersColumn" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-last-left-pinned ag-column-first ag-row-number-cell ag-row-number-selection-enabled ag-cell-value" aria-colindex="1" style="left: 0px; width: 60px;">
												4
											</div>
										</div>
									</div>
									<div class="ag-grid-scrolling-cells" role="presentation">
										<div class="ag-grid-container-wrapper" role="presentation" style="width: 1260px;">
											<div role="gridcell" col-id="country" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="2" style="left: 0px; width: 210px;">
												Norway
											</div>
											<div role="gridcell" col-id="sport" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="3" style="left: 210px; width: 210px;">
												🏏 Cricket
											</div>
											<div role="gridcell" col-id="name" tabindex="-1" class="ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value" aria-colindex="4" style="left: 420px; width: 210px;">
												Grace Jett
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

`;
