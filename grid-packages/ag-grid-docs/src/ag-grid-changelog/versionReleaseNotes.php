<div class="note" style="display: none" fixVersionNote id="fix_version_23_0_0">
    <p>Release 23.0.0 (17th Mar 2020)</p>

    <p>Feature Highlights:</p>

    <ul>
        <li>
            AG-3110 - Allow charts to be created outside of grid
            (see <a href="/javascript-charts-overview/">Standalone Charting</a>).
        </li>

        <li>
            AG-2832 - Add new 'Alpine Theme'
            (see <a href="/javascript-grid-themes-provided/#themes-summary">Themes Summary</a>).
        </li>

        <li>AG-3872 - Improve Server-side Row Model docs and examples
            (see <a href="/javascript-grid-server-side-model/">Server-side Row Model</a>).
        </li>

        <li>
            AG-2025 - Add keyboard navigation to context menu
            (see <a href="/javascript-grid-context-menu/">Context Menu</a>).

        </li>

        <li>
            AG-3203 - Add API to download charts
            (see <a href="/javascript-grid-charts-integrated-chart-range-api/#saving-and-restoring-charts">Saving and Restoring Charts</a>).
        </li>

        <li>
            AG-3678 - Add additional chart lifecycle events to aid persisting charts
            (see <a href="/javascript-grid-charts-integrated-chart-events/">Chart Events</a>).
        </li>
    </ul>

    <p>Breaking Changes:</p>

    <ul>
        <li>
            <p>
                AG-3110 - We have undertaken a major rewrite of the Sass code behind our provided themes, with the goal of making it easier to write custom themes.
                See <a href="/javascript-grid-themes-v23-migration/">Migrating themes to ag-Grid 23.x</a> to understand why we've made these changes, and exactly what we've changed.
            </p>
        </li>

        <li>
            <p>
                AG-3802 - Migrate <code>ag-grid-angular</code> & <code>@ag-grid-community/angular</code> to use the Angular CLI to build.
                Angular 6+ is now the minimum supported version of Angular.
            </p>
        </li>


        <li>
            <p>
                AG-3110 - Tooltip renderer params: if a series has no `title` set, the tooltip renderer
                will receive the `title` as it, it won't be set to the value of the `yName` as before.
            </p>
        </li>
        <li>
            AG-3110 - Legend API changes:
            <ul>
                <li>legend.padding -> legend.spacing</li>
                <li>legend.itemPaddingX -> legend.layoutHorizontalSpacing</li>
                <li>legend.itemPaddingY -> legend.layoutVerticalSpacing</li>
                <li>legend.markerPadding -> legend.itemSpacing</li>
                <li>legend.markerStrokeWidth -> legend.strokeWidth</li>
                <li>legend.labelColor -> legend.textColor</li>
                <li>legend.labelFontStyle -> legend.fontStyle</li>
                <li>legend.labelFontWeight -> legend.fontWeight</li>
                <li>legend.labelFontSize -> legend.fontSize</li>
                <li>legend.labelFontFamily -> legend.fontFamily</li>
            </ul>
        </li>
    </ul>
</div>