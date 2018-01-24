<style>
    html, body {
        height: 100%;
    }

    .ag-theme-fresh .ag-value-change-value-highlight {
        background-color: #afbcff;
    }

    .align-right {
        text-align: right
    }

    .pct-change-green {
        background-color: lightgreen;
    }

    .pct-change-amber {
        background-color: lightgoldenrodyellow;
    }

    .pct-change-red {
        background-color: red;
    }

    .fx-null {
        background-color: rgb(98, 98, 98);
    }

    .fx-positive {
        background-color: green;
    }

    .fx-negative {
        background-color: red;
        /*background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48bGluZWFyR3JhZGllbnQgaWQ9Imxlc3NoYXQtZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzYWNmZDUiIHN0b3Atb3BhY2l0eT0iMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzNhNGVkNSIgc3RvcC1vcGFjaXR5PSIxIi8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJ1cmwoI2xlc3NoYXQtZ2VuZXJhdGVkKSIgLz48L3N2Zz4=),url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48bGluZWFyR3JhZGllbnQgaWQ9Imxlc3NoYXQtZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzYWNmZDUiIHN0b3Atb3BhY2l0eT0iMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzNhNGVkNSIgc3RvcC1vcGFjaXR5PSIxIi8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJ1cmwoI2xlc3NoYXQtZ2VuZXJhdGVkKSIgLz48L3N2Zz4=);*/

    }

    .blackish {
        background-color: #333333;
        padding-bottom: 10px;
    }

    .graphBox {
        color: white;
        border: 1px solid grey;
        margin-top: 22px;
    }

    span#deltaPanelPrice {
        font-size: 31px !important;
    }

    .graphBoxContainer {
        padding-left: 10px;
    }

    text {
        fill: grey;
    }

    .ag-value-change-delta-down {
        color: red !important
    }

    .ag-value-change-delta-up {
        color: #2d812f !important
    }

    .ag-value-change-value-highlight {
        background-color: rgb(98, 98, 98) !important;
        color: black !important;;
    }

    path {
    }
</style>

<section class="HomeSection HomeDemo hidden-xs">
    <div class="container">
        <div class="row">
            <h4 class="text-center">Live Update Grids While Only Re-Renderering Changed Data</h4>
        </div>

        <div class="row HomeDemo-main">
            <div class="col-md-12 blackish">
                <div>
                    <div style="float: left; margin-right: 25px">
                        <div style="width: 700px;">
                            Click on a row to view historical trends.
                            <a tabindex="0"
                               style="float: right"
                               data-toggle="popover"
                               data-trigger="focus"
                               data-html="true"
                               title="Subscription Based Updates"
                               data-content="Utilises a mechanism whereby a service is passed a callback per row, which is fired when that row's data changes. The Grid updates the row data with the Transaction API.<br/><br/>Only changed rows are re-rendered for improved performance."><i
                                        class="fa fa-question-circle-o" aria-hidden="true"></i></a>
                        </div>
                        <div id="priceChangesGrid" style="clear:both;height: 410px; width: 700px"
                             class="ag-theme-dark"></div>
                    </div>
                    <div style="float: left" class="graphBox">
                        <div class="graphBoxContainer">
                            <div>
                        <span id="deltaPanelPrice"
                              style="font-size: 2.6em; font-weight: bold;margin-right: 10px"></span>
                                <div style="display: inline-block">
                            <span style="font-weight: normal; font-size: 1.8em; vertical-align: bottom">
                                <span id="deltaPanelSwing"></span>
                                <span id="deltaPctPanelSwing"></span>
                            </span>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <span id="timestamp"></span>
                                    <div style="font-size: 11px; color: #6F6F6F">
                                        <span id="exchangeName"></span>
                                        <div>Currency in USD</div>
                                    </div>
                                </div>
                            </div>
                            <div style="font-size: 13px">
                                <table style="display: inline-block;vertical-align: top;border-collapse: collapse">
                                    <tbody>
                                    <tr>
                                        <td style="color: #666">Range</td>
                                        <td id="range" style="text-align: right">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666">52 week</td>
                                        <td id="fiftyTwoWeek" style="text-align: right">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666">Open</td>
                                        <td id="open" style="text-align: right">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666">Vol / Avg.</td>
                                        <td id="vol" style="text-align: right">
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                <table style="display: inline-block;vertical-align: top;border-collapse: collapse">
                                    <tbody>
                                    <tr>
                                        <td style="color: #666">Div/yield</td>
                                        <td id="dividendYield" style="text-align: right">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666">EPS</td>
                                        <td id="eps" style="text-align: right"></td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666">Shares</td>
                                        <td id="shares" style="text-align: right">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666">Market Cap</td>
                                        <td id="marketCap" style="text-align: right">
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div id="historyGraph" style="margin-top: 5px"></div>
                        </div>
                    </div>
                </div>
                <div style="width: 100%; clear: both; padding-top: 15px">
                    <div>
                        <div style="float: left; margin-right: 25px">
                            <div style="width: 700px;display: inline-block">
                                <a tabindex="0"
                                   style="float: right"
                                   data-toggle="popover"
                                   data-trigger="focus"
                                   data-html="true"
                                   title="Transaction Based Updates"
                                   data-content="A service will provide updates rows only, with the Grid updating the row data with the Transaction API.<br/><br/>Only changed rows are re-rendered for improved performance."><i
                                            class="fa fa-question-circle-o" aria-hidden="true"></i></a>
                            </div>
                            <div id="quoteMatrix" style="height: 410px; width: 700px" class="ag-theme-dark"></div>
                        </div>
                        <div style="float: left;display: inline-block;">
                            <div style="width: 415px;display: inline-block">
                                <a tabindex="0"
                                   style="float: right"
                                   data-toggle="popover"
                                   data-trigger="focus"
                                   data-placement="left"
                                   data-html="true"
                                   title="Subscription Based Updates"
                                   data-content="A service will provide the complete set of row data for each update, with altered rows within the data set. The Grid updates the row data using the <code>deltaRowDataMode</code>.<br/><br/>Only changed rows are re-rendered for improved performance."><i
                                            class="fa fa-question-circle-o" aria-hidden="true"></i></a>
                            </div>
                            <div id="topMovers" style="height: 410px; width: 415px" class="ag-theme-dark"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-12">
                <span style="float: right;"><a href="/ag-grid-trader-dashboard/">(view code)</a></span>
            </div>
        </div>
    </div>
</section>
