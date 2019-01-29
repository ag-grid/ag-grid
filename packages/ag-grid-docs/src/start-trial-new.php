<?php
$navKey = "about";
include_once 'includes/html-helpers.php';
gtm_data_layer('trial', array('state' => 'start'));
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
    <?php
    meta_and_links("ag-Grid: Free 2 Month Trial", "Free Trial of ag-Grid JavaScrpt Datagrid", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. You can take the Enterprise version for a free 2 Month Trial - somply fill out this page.", true);
    ?>
    <link rel="stylesheet" href="dist/homepage.css">

    <META HTTP-EQUIV="Content-type" CONTENT="text/html; charset=UTF-8">
    <script src="https://www.google.com/recaptcha/api.js"></script>
    <script>
        function timestamp() {
            var response = document.getElementById("g-recaptcha-response");
            if (response == null || response.value.trim() == "") {
                var elems = JSON.parse(document.getElementsByName("captcha_settings")[0].value);
                elems["ts"] = JSON.stringify(new Date().getTime());
                document.getElementsByName("captcha_settings")[0].value = JSON.stringify(elems);
            }
        }

        setInterval(timestamp, 500);

    </script>
</head>

<body>
<header id="nav" class="compact">
    <?php
    $version = 'latest';
    include './includes/navbar.php';
    ?>
</header>

<div class="info-page">
    <div class="row">
        <section>
            <style>
                img {
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }


            </style>
            <img src="https://ci6.googleusercontent.com/proxy/Ud-khzT51bLnOIwvW6to_TeNlUXx4LSL_akqjv6bQOHBsaanwQpFEJ_0Uwf71osI5CHmlbPeBsAXWB8DOptDGMDmB0qKNIzgNZBrwCMhOSfogpQRebu9WiDTBs5C6AFadiS7haYdKoQ9gjTc8GuI1bvzxS4RxJfb0C6wNpc=s0-d-e1-ft#https://gallery.mailchimp.com/9b44b788c97fa5b498fbbc9b5/images/7ec4f43a-0f1e-4035-8681-661fd64865a4.png"
                 alt="ag-Grid Logo" width="135" height="150" align="middle">
            <br>
            <h1 class="text-center" style="margin-top: -5px">Enterprise Evaluation License</h1>


            <p>
                An evaluation license for ag-Grid Enterprise is granted to anyone wishing evaluate ag-Grid Enterprise.
                All we ask in return is the following:
            <ul>
                <li>
                    You agree to use the Evaluation License only for evaluation of ag-Grid Enterprise. You do not enter
                    production with ag-Grid Enterprise.
                </li>
                <li>
                    You limit your trial to two months (after that, either uninstall or purchase).
                </li>
                <li>
                    You complete the form below - we will then email you back with a trial license key.
                </li>
                <li>You agree to the collection of your data which is added to our CRM and used to send the License
                    Key.
                </li>
            </ul>
            </p>
            <hr>

            <div class="container-fluid">
                <form class="needs-validation" novalidate
                      action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8" method="POST">

                    <input type=hidden name='captcha_settings' value='{"keyname":"agGridCom","fallback":"true","orgId":"00D1t000000u82X","ts":""}'>
                    <input type=hidden name="oid" value="00D1t000000u82X">
                    <input type=hidden name="retURL" value="http://ag-grid.com/thank-you-trial.php">

                    <div class="form-group" style="margin-top: 10px">
                        <label for="first_name">First Name</label><input class="form-control" placeholder="First Name"
                                                                         id="first_name" maxlength="40"
                                                                         name="first_name" size="20"
                                                                         type="text"/>
                    </div>

                    <div class="form-group">
                        <label for="last_name">Last Name</label><input class="form-control" placeholder="Last Name"
                                                                       id="last_name"
                                                                       maxlength="80" name="last_name" size="20"
                                                                       type="text"/>
                    </div>

                    <div class="form-group" style="margin-top: 10px">
                        <label for="email">Email *</label><input class="form-control" placeholder="Email" id="email"
                                                                 maxlength="80"
                                                                 name="email" size="20" type="text" required
                                                                 value="seanlandsman@yahoo.co.uk"/>
                        <div class="invalid-feedback">
                            Email is required.
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="company">Company</label><input class="form-control" placeholder="Company Name"
                                                                   id="company"
                                                                   maxlength="40" name="company" size="20" type="text"/>
                    </div>

                    <div class="g-recaptcha" data-sitekey="6Le1Z4wUAAAAABlpBKKIAeHo3ZMaj5zLQsCXLzAO"></div>
                    <br>
                    <div class="form-group text-right" style="margin-top: 10px;">
                        <input name="submit" type="submit" class="btn btn-block btn-primary"
                               value="Start Your Free Trial"/>
                    </div>
                </form>

<!--            Sandbox form here
                <form class="needs-validation" novalidate
                      action="https://test.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8" method="POST">

                    <input type=hidden name='captcha_settings'
                           value='{"keyname":"agGridCom2","fallback":"true","orgId":"00D1X0000008bgV","ts":""}'>
                    <input type=hidden name="oid" value="00D1X0000008bgV">
                    <input type=hidden name="retURL" value="http://ag-grid.com/thank-you-trial.php">

                    <div class="form-group" style="margin-top: 10px">
                        <label for="first_name">First Name</label><input class="form-control" placeholder="First Name"
                                                                         id="first_name" maxlength="40"
                                                                         name="first_name" size="20"
                                                                         type="text"/>
                    </div>

                    <div class="form-group">
                        <label for="last_name">Last Name</label><input class="form-control" placeholder="Last Name"
                                                                       id="last_name"
                                                                       maxlength="80" name="last_name" size="20"
                                                                       type="text"/>
                    </div>

                    <div class="form-group" style="margin-top: 10px">
                        <label for="email">Email *</label><input class="form-control" placeholder="Email" id="email"
                                                                 maxlength="80"
                                                                 name="email" size="20" type="text" required
                                                                 value="seanlandsman@yahoo.co.uk"/>
                        <div class="invalid-feedback">
                            Email is required.
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="company">Company</label><input class="form-control" placeholder="Company Name"
                                                                   id="company"
                                                                   maxlength="40" name="company" size="20" type="text"/>
                    </div>

                    <div class="g-recaptcha" data-sitekey="6Le1Z4wUAAAAABlpBKKIAeHo3ZMaj5zLQsCXLzAO"></div>
                    <br>
                    <div class="form-group text-right" style="margin-top: 10px;">
                        <input name="submit" type="submit" class="btn btn-block btn-primary"
                               value="Start Your Free Trial"/>
                    </div>
                </form>
-->
            </div>
        </section>
    </div>
</div>

<?php include("includes/footer.php"); ?>
<script>
    (function() {
        'use strict';
        window.addEventListener('load', function() {
            var forms = document.getElementsByClassName('needs-validation');
            var validation = Array.prototype.filter.call(forms, function(form) {
                form.addEventListener('submit', function(event) {
                    if (form.checkValidity() === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    form.classList.add('was-validated');
                }, false);
            });
        }, false);
    })();
</script>

<?php include_once("includes/analytics.php"); ?>
<script src="dist/homepage.js"></script>
</body>
</html>