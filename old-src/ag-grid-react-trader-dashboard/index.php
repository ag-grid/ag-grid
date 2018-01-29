<!DOCTYPE html>
<html class="height-100">

<head>
    <title>ag-Grid Data Grid Example</title>
    <meta name="description" content="Example of using ag-Grid together with React and Redux, with realtime updates.">
    <meta name="keywords" content="react data grid redux example"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script type="text/javascript" src="/framework-examples/react-examples/trader/dist/react-trader.js" charset="utf-8"></script>

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
            border-top: 20px solid #3ACFD5;
            border-right: 20px solid #3a4ed5;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            background-position: 0 0, 0 100%;
            background-repeat: no-repeat;
            -webkit-background-size: 100% 20px;
            -moz-background-size: 100% 20px;
            background-size: 100% 20px;
            /*background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48bGluZWFyR3JhZGllbnQgaWQ9Imxlc3NoYXQtZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzYWNmZDUiIHN0b3Atb3BhY2l0eT0iMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzNhNGVkNSIgc3RvcC1vcGFjaXR5PSIxIi8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJ1cmwoI2xlc3NoYXQtZ2VuZXJhdGVkKSIgLz48L3N2Zz4=),url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48bGluZWFyR3JhZGllbnQgaWQ9Imxlc3NoYXQtZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzYWNmZDUiIHN0b3Atb3BhY2l0eT0iMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzNhNGVkNSIgc3RvcC1vcGFjaXR5PSIxIi8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJ1cmwoI2xlc3NoYXQtZ2VuZXJhdGVkKSIgLz48L3N2Zz4=);*/
            background-image: -webkit-linear-gradient(top, #afbcff 0%, #c1d5c9 100%), -webkit-linear-gradient(top, #afbcff 0%, #c1d5c9 100%);
            background-image: -moz-linear-gradient(top, #afbcff 0%, #c1d5c9 100%), -moz-linear-gradient(top, #afbcff 0%, #c1d5c9 100%);
            background-image: -o-linear-gradient(top, #afbcff 0%, #c1d5c9 100%), -o-linear-gradient(top, #afbcff 0%, #c1d5c9 100%);
            background-image: linear-gradient(to bottom, #afbcff 0%, #c1d5c9 100%), linear-gradient(to bottom, #afbcff 0%, #c1d5c9 100%);
        }

        .fx-positive {
            border-top: 20px solid #3ACFD5;
            border-right: 20px solid #3a4ed5;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            background-position: 0 0, 0 100%;
            background-repeat: no-repeat;
            -webkit-background-size: 100% 20px;
            -moz-background-size: 100% 20px;
            background-size: 100% 20px;
            /*background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48bGluZWFyR3JhZGllbnQgaWQ9Imxlc3NoYXQtZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzYWNmZDUiIHN0b3Atb3BhY2l0eT0iMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzNhNGVkNSIgc3RvcC1vcGFjaXR5PSIxIi8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJ1cmwoI2xlc3NoYXQtZ2VuZXJhdGVkKSIgLz48L3N2Zz4=),url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48bGluZWFyR3JhZGllbnQgaWQ9Imxlc3NoYXQtZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzYWNmZDUiIHN0b3Atb3BhY2l0eT0iMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzNhNGVkNSIgc3RvcC1vcGFjaXR5PSIxIi8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJ1cmwoI2xlc3NoYXQtZ2VuZXJhdGVkKSIgLz48L3N2Zz4=);*/
            background-image: -webkit-linear-gradient(top, #00FF00 0%, #c1d5c9 100%), -webkit-linear-gradient(top, #00FF00 0%, #c1d5c9 100%);
            background-image: -moz-linear-gradient(top, #00FF00 0%, #c1d5c9 100%), -moz-linear-gradient(top, #00FF00 0%, #c1d5c9 100%);
            background-image: -o-linear-gradient(top, #00FF00 0%, #c1d5c9 100%), -o-linear-gradient(top, #00FF00 0%, #c1d5c9 100%);
            background-image: linear-gradient(to bottom, #00FF00 0%, #c1d5c9 100%), linear-gradient(to bottom, #00FF00 0%, #c1d5c9 100%);
        }

        .fx-negative {
            border-top: 20px solid #3ACFD5;
            border-right: 20px solid #3a4ed5;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            background-position: 0 0, 0 100%;
            background-repeat: no-repeat;
            -webkit-background-size: 100% 20px;
            -moz-background-size: 100% 20px;
            background-size: 100% 20px;
            /*background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48bGluZWFyR3JhZGllbnQgaWQ9Imxlc3NoYXQtZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzYWNmZDUiIHN0b3Atb3BhY2l0eT0iMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzNhNGVkNSIgc3RvcC1vcGFjaXR5PSIxIi8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJ1cmwoI2xlc3NoYXQtZ2VuZXJhdGVkKSIgLz48L3N2Zz4=),url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMSAxIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj48bGluZWFyR3JhZGllbnQgaWQ9Imxlc3NoYXQtZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzYWNmZDUiIHN0b3Atb3BhY2l0eT0iMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzNhNGVkNSIgc3RvcC1vcGFjaXR5PSIxIi8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJ1cmwoI2xlc3NoYXQtZ2VuZXJhdGVkKSIgLz48L3N2Zz4=);*/
            background-image: -webkit-linear-gradient(top, #FF0000 0%, #d5b3af 100%), -webkit-linear-gradient(top, #FF0000 0%, #d5b3af 100%);
            background-image: -moz-linear-gradient(top, #FF0000 0%, #d5b3af 100%), -moz-linear-gradient(top, #FF0000 0%, #d5b3af 100%);
            background-image: -o-linear-gradient(top, #FF0000 0%, #d5b3af 100%), -o-linear-gradient(top, #FF0000 0%, #d5b3af 100%);
            background-image: linear-gradient(to bottom, #FF0000 0%, #d5b3af 100%), linear-gradient(to bottom, #FF0000 0%, #d5b3af 100%);
        }
    </style>

    <link rel="stylesheet" href="../dist/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="../dist/bootstrap/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="../style.css">
</head>

<body style="height: 100%; margin: 0; padding: 0;">

<!-- The table div -->
<div style="padding-top: 45px; height: 100%; width: 100%;">
    <div class="container">
        <div class="row">
            <div class="col-md-10">
                <div id="traderDashboard"></div>
            </div>
            <div class="col-md-2"></div>
        </div>
    </div>
</div>

<div class="header-row" style="position: fixed; top: 0; left: 0; width: 100%; padding-bottom: 0;">

    <?php $navKey = "demo";
    include '../includes/navbar.php'; ?>

</body>

<?php include_once("../includes/analytics.php"); ?>

</html>