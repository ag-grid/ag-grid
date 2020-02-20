
generateVars(
    // extracted from ag-theme-base-default-params
    `
        background-color
        border-color
        border-radius
        borders
        borders-critical
        borders-secondary
        borders-side-button
        card-radius
        card-shadow
        cell-horizontal-border
        cell-horizontal-padding
        cell-widget-spacing
        checkbox-background-color
        checkbox-border-radius
        checkbox-checked-color
        checkbox-indeterminate-color
        checkbox-unchecked-color
        chip-background-color
        column-select-indent-size
        control-panel-background-color
        data-color
        disabled-foreground-color
        filter-tool-panel-group-indent
        filter-tool-panel-sub-level-row-height
        filter-tool-panel-top-level-row-height
        font-family
        font-size
        foreground-color
        full-width-tabs
        grid-size
        header-background-color
        header-cell-hover-background-color
        header-cell-moving-background-color
        header-column-resize-handle
        header-column-resize-handle-color
        header-column-resize-handle-height
        header-column-resize-handle-width
        header-column-separator
        header-column-separator-color
        header-column-separator-height
        header-column-separator-width
        header-foreground-color
        header-height
        icon-font-family
        icon-size
        icons-data
        icons-font-codes
        input-border-color
        input-disabled-background-color
        input-focus-border-color
        input-focus-box-shadow
        list-item-height
        minichart-selected-chart-color
        minichart-selected-page-color
        odd-row-background-color
        popup-shadow
        range-selection-background-color
        range-selection-border-color
        range-selection-chart-background-color
        range-selection-chart-category-background-color
        range-selection-highlight-color
        row-border-color
        row-group-indent-size
        row-height
        row-hover-color
        secondary-border-color
        secondary-foreground-color
        selected-row-background-color
        selected-tab-underline-color
        selected-tab-underline-transition-speed
        selected-tab-underline-width
        subheader-background-color
        toggle-button-height
        toggle-button-off-color
        toggle-button-on-color
        toggle-button-switch-border-width
        toggle-button-switch-color
        toggle-button-width
        value-change-delta-down-color
        value-change-delta-up-color
        value-change-value-highlight-background-color
        widget-container-horizontal-padding
        widget-container-vertical-padding
        widget-horizontal-spacing
        widget-vertical-spacing
    `.trim().split(/\s/),
    {
        // 'accent-color': 'TODO', // search pre refactor for usage
        // 'alt-icon-color': 'TODO', // search pre refactor for usage
        dialog-background-color
        dialog-border-color
        dialog-border-size
        dialog-border-style
        dialog-title-background-color
        dialog-title-font-family
        dialog-title-font-size
        dialog-title-font-weight
        dialog-title-foreground-color
        dialog-title-height
        dialog-title-icon-size
        dialog-title-padding

        font-weight
        foreground-opacity
        disabled-foreground-color-opacity
        secondary-foreground-color-opacity

        tool-panel-background-color

        virtual-item-height

        group-component-background-color
group-component-border-color
group-component-title-background-color

secondary-font-family
secondary-font-size
secondary-font-weight

customize-buttons // warn
customize-inputs // warn
rich-select-item-height // warn
scroll-spacer-border // warn



$ag-group-background-color: $ag-group-component-background-color !global;
$ag-group-title-background-color: $ag-group-component-title-background-color !global;
$ag-column-select-indent-size: $toolpanel-indent-size !global;
$ag-column-select-indent-size: $ag-toolpanel-indent-size !global;
$ag-foreground-color-opacity: $ag-foreground-opacity !global;
$ag-checkbox-background-color: $ag-alt-icon-color !global;
$ag-range-selection-border-color: $ag-primary-color !global;
$ag-selected-tab-underline-color: $ag-primary-color !global;
$ag-selected-tab-underline-color: $ag-primary-color !global;
$ag-selected-row-background-color: $ag-selected-color !global;
$ag-checkbox-check-color: $ag-accent-color !global;
$ag-row-hover-color: $ag-hover-color !global;
$ag-selected-row-background-color: $ag-menu-option-active-color !global;
$ag-filter-toolpanel-instance-filter: $ag-filter-air !global;
$ag-filter-toolpanel-instance-body: $ag-filter-toolpanel-body !global;
$ag-list-item-height: $ag-virtual-item-height;
$ag-group-border-color: $ag-group-component-border-color !global;
    }
)


function generateVars(params, renames) {
    const imports = [];
    let errors = false;
    // reverse iterate over renames because later entries should override earlier ones
    Object.entries(renames).reverse().forEach(([froms, tos]) => {
        tos.trim().split(/\s+/).forEach(to => {
            if (!params.includes(to)) {
                console.error(`Can't rename "${froms}" to "${to}" because "${to}" is not listed in params`);
                errors = true;
            }
            froms.trim().split(/\s+/).forEach(from => {
                imports.push({from: `ag-${from}`, to});
                imports.push({from, to});
            })
        })
    });
    Array.from(params).forEach(p => {
        imports.push({from: `ag-${p}`, to: p});
        imports.push({from: p, to: p});
    });
    imports.map(({from, to}) => `${from} to ${to}`).forEach((key, i, keys) => {
        if (keys.indexOf(key) != i) {
            console.error(`Rename "${key}" has been added multiple times.`);
            errors = true;
        }
    });
    if (errors && !process.argv.includes("--force")) {
        console.error("Skipping export due to errors");
    } else {
        imports.forEach(im => {
            console.log(`/* auto-generated do not edit */ $params: ag-merge-legacy-var($params, "${im.to}", if(variable-exists("${im.from}"), $${im.from}, $ag-not-defined), $defaults);`);
        });
    }
}