<!DOCTYPE html>
<html class="height-100">

    <head>
        <title>ag-Grid Data Grid Example</title>
        <meta name="description" content="Example of using ag-Grid demonstrating that it can work very fast with thousands of rows.">
        <meta name="keywords" content="react angular angularjs data grid example"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <!-- Bootstrap

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
-->
        <link rel="stylesheet" href="./dist/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="./dist/bootstrap/css/bootstrap-theme.min.css">

        <link rel="stylesheet" href="./style.css">

<!-- Hotjar Tracking Code for https://www.ag-grid.com/ -->
        <script>
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:372643,hjsv:5};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'//static.hotjar.com/c/hotjar-','.js?sv=');
        </script>

        <style>
            label { font-weight: normal !important; }
            .blue { background-color: darkblue; color: lightblue; }

            .ag-fresh .good-score { background-color: rgba(0,200,0,0.4) }
            .ag-blue .good-score { background-color: rgba(0,200,0,0.4) }
            .ag-dark .good-score { background-color: rgba(0,100,0,0.4) }

            .ag-fresh .bad-score { background-color: rgba(200,0,0,0.4) }
            .ag-blue .bad-score { background-color: rgba(200,0,0,0.4) }
            .ag-dark .bad-score { background-color: rgba(100,0,0,0.4) }
        </style>

        <!--        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
        -->
<!--        <script src="./bootstrap/jquery.min.js"></script>
        <script src="./bootstrap/bootstrap.min.js"></script>
-->
        <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

        <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

<!--        <script src="./dist/ag-grid/ag-grid.js?ignore=notused40"></script>-->
        <script src="./dist/ag-grid-enterprise/ag-grid-enterprise.js?ignore=notused40"></script>

        <script src="example.js"></script>

        <!-- Hotjar Tracking Code for https://www.ag-grid.com/ -->
        <script>
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:372643,hjsv:5};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'//static.hotjar.com/c/hotjar-','.js?sv=');
        </script>

    </head>

    <body style="height: 100%; margin: 0px; padding: 0px;">

        <!-- The table div -->
        <div style="padding-top: 98px; height: 100%; width: 100%;">
            <div id="myGrid" style="height: 100%; overflow: hidden;" class="ag-fresh"></div>
        </div>

        <div class="header-row" style="position: fixed; top: 0px; left: 0px; width: 100%; padding-bottom: 0px;">

            <?php $navKey = "demo"; include 'includes/navbar.php'; ?>

            <div class="container">

                <div class="row">
                    <div class="col-md-9">

                        <div style="padding: 5px 5px 6px 5px;">

                            <!-- First row of header, has table options -->
                            <div style="padding: 4px;">
                                <input placeholder="Filter..." type="text"
                                       oninput="onFilterChanged(this.value)"
                                       ondblclick="filterDoubleClicked(event)"
                                       class="hide-when-small"
                                       style="color: #333;"
                                />

                                <span style="padding-left: 20px;">Data Size:</span>
                                <select onchange="onDataSizeChanged(this.value)"
                                        style="color: #333;">
                                    <option value=".1x22">100 Rows, 22 Cols</option>
                                    <option value="1x22">1,000 Rows, 22 Cols</option>
                                    <option value="10x100">10,000 Rows, 100 Cols</option>
                                    <option value="100x22">100,000 Rows, 22 Cols</option>
                                </select>

                                <span style="padding-left: 20px;" class="hide-when-small">Theme:</span>

                                <select onchange="onThemeChanged(this.value)" style="width: 90px; color: #333;" class="hide-when-small">
                                    <option value="">-none-</option>
                                    <option value="ag-fresh" selected>Fresh</option>
                                    <option value="ag-dark">Dark</option>
                                    <option value="ag-blue">Blue</option>
                                    <option value="ag-material">Material</option>
                                    <option value="ag-bootstrap">Bootstrap</option>
                                </select>

                                <span id="message" style="margin-left: 10px;">
                                    <i class="fa fa-spinner fa-spin"></i>
                                    <span id="messageText"></span>
                                </span>

                            </div>
                        </div>

                    </div>
                    <div class="col-md-3">
                        <a href="https://www.youtube.com/embed/tsuhoLiSWmU" class="videoLink pull-right text-right" data-toggle="modal" data-target="#videoModal"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                                                                                                          	 viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
                                                                                                                          <path style="fill:#D8362A;" d="M506.703,145.655c0,0-5.297-37.959-20.303-54.731c-19.421-22.069-41.49-22.069-51.2-22.952
                                                                                                                          	C363.697,62.676,256,61.793,256,61.793l0,0c0,0-107.697,0.883-179.2,6.179c-9.71,0.883-31.779,1.766-51.2,22.952
                                                                                                                          	C9.71,107.697,5.297,145.655,5.297,145.655S0,190.676,0,235.697v41.49c0,45.021,5.297,89.159,5.297,89.159
                                                                                                                          	s5.297,37.959,20.303,54.731c19.421,22.069,45.021,21.186,56.497,23.835C122.703,449.324,256,450.207,256,450.207
                                                                                                                          	s107.697,0,179.2-6.179c9.71-0.883,31.779-1.766,51.2-22.952c15.007-16.772,20.303-54.731,20.303-54.731S512,321.324,512,277.186
                                                                                                                          	v-41.49C512,190.676,506.703,145.655,506.703,145.655"/>
                                                                                                                          <polygon style="fill:#FFFFFF;" points="194.207,166.841 194.207,358.4 361.931,264.828 "/>
                                                                                                                          </svg> Take video tour</a>
                    </div>
                </div>

            </div>

        </div>

        <!-- The Video Modal -->
        <div class="modal fade" id="videoModal" tabindex="-1" role="dialog" aria-labelledby="videoModal" aria-hidden="true">
            <div class="modal-dialog" style="width: 887px;">
                <div class="modal-content">
                    <div class="modal-body">
                        <button type="button" class="close videoClose" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <div style="padding-top: 30px">
                            <iframe width="853" height="480" id="videoIframe" frameborder="0" allowfullscreen></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </body>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script inline src="/scripts/frontend/frontend.js"></script>

    <?php include_once("includes/analytics.php"); ?>

</html>