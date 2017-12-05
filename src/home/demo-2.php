<style>
    .ag-theme-dark .ag-value-change-value-highlight {
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
        height: 410px;
    }

    span#deltaPanelPrice {
        font-size: 31px !important;
    }

    .graphBoxContainer {
        padding-left: 10px;
        font-family: 'Roboto', sans-serif;
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

</style>

<div class="container-fluid blackish text-light pt-2" id="dashboard-demo">
<div class="row">
    <div class="col-md-7"> Click on a row to view historical trends.
    <a tabindex="0"
    data-toggle="popover"
    data-trigger="focus"
    data-html="true"
    title="Subscription Based Updates"
    data-content="Utilises a mechanism whereby a service is passed a callback per row, which is fired when that row's data changes. The Grid updates the row data with the Transaction API.<br/><br/>Only changed rows are re-rendered for improved performance."><i
            class="fa fa-question-circle-o" aria-hidden="true"></i></a>
    </div>
</div>

<div class="row mb-3">
    <div class="col-md-7">
        <div id="priceChangesGrid" style="width: 100%; height: 410px;" class="ag-theme-dark"></div>
    </div>

    <div class="col-md-5">
        <div class="graphBox">
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
</div>

<div class="row text-right">
<div class="col-md-7">
<a tabindex="0"
data-toggle="popover"
data-trigger="focus"
data-html="true"
title="Transaction Based Updates"
data-content="A service will provide updates rows only, with the Grid updating the row data with the Transaction API.<br/><br/>Only changed rows are re-rendered for improved performance."><i class="fa fa-question-circle-o" aria-hidden="true"></i></a>
</div>
<div class="col-md-5">
<a tabindex="0"
   data-toggle="popover"
   data-trigger="focus"
   data-placement="left"
   data-html="true"
   title="Subscription Based Updates"
   data-content="A service will provide the complete set of row data for each update, with altered rows within the data set. The Grid updates the row data using the <code>deltaRowDataMode</code>.<br/><br/>Only changed rows are re-rendered for improved performance."><i
            class="fa fa-question-circle-o" aria-hidden="true"></i></a>
</div>
</div>

<div class="row">
<div class="col-md-7">
<div id="quoteMatrix" style="height: 410px; width: 100%" class="ag-theme-dark"></div>
</div>
<div class="col-md-5">
<div id="topMovers" style="height: 410px; width: 100%" class="ag-theme-dark"></div>
</div>
</div>

</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.9.1/d3.min.js"></script>
<script src="ag-grid-trader-dashboard/components/renderers/HorizontalBarComponent.js" ></script>
<script src="ag-grid-trader-dashboard/services/ExchangeService.js" ></script>
<script src="ag-grid-trader-dashboard/services/FxDataService.js" ></script>
<script src="ag-grid-trader-dashboard/components/StockHistoricalChart.js" ></script>
<script src="ag-grid-trader-dashboard/components/StockDetailPanel.js" ></script>
<script src="ag-grid-trader-dashboard/components/PriceChangesGrid.js" ></script>
<script src="ag-grid-trader-dashboard/components/FxQuoteMatrix.js" ></script>
<script src="ag-grid-trader-dashboard/components/TopMoversGrid.js" ></script>
<script src="ag-grid-trader-dashboard/dashboard.js" ></script>
