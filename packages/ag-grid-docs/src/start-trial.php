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
            <img src="https://ci6.googleusercontent.com/proxy/Ud-khzT51bLnOIwvW6to_TeNlUXx4LSL_akqjv6bQOHBsaanwQpFEJ_0Uwf71osI5CHmlbPeBsAXWB8DOptDGMDmB0qKNIzgNZBrwCMhOSfogpQRebu9WiDTBs5C6AFadiS7haYdKoQ9gjTc8GuI1bvzxS4RxJfb0C6wNpc=s0-d-e1-ft#https://gallery.mailchimp.com/9b44b788c97fa5b498fbbc9b5/images/7ec4f43a-0f1e-4035-8681-661fd64865a4.png" alt="ag-Grid Logo" width="135" height="150" align="middle">
            <br>
          <h1 class="text-center" style="margin-top: -5px">Enterprise Evaluation License</h1>


            <p>
                An evaluation license for ag-Grid Enterprise is granted to anyone wishing evaluate ag-Grid Enterprise.
                All we ask in return is the following:
            <ul>
                <li>
                    You agree to use the Evaluation License only for evaluation of ag-Grid Enterprise. You do not enter production with ag-Grid Enterprise.
                </li>
                <li>
                    You limit your trial to two months (after that, either uninstall or purchase).
                </li>
                <li>
                    You complete the form below - we will then email you back with a trial license key.
                </li>
                <li>You agree to the collection of your data which is added to our CRM and used to send the License Key.</li>
            </ul>
            </p>
          <hr>

    <?php $startTrial = true; ?>
    <?php include("includes/orderForm.php"); ?>
        </section>
    </div>
</div>

<?php include("includes/footer.php"); ?>
<script>
if(window.location.href.indexOf("/start-trial.php?submitted=true") !=-1)
{
    (new Image()).src="//www.googleadservices.com/pagead/conversion/873243008/?label=8TOnCM7BnWsQgMOyoAM&guid=ON&script=0";
}
</script>
<?php include_once("includes/analytics.php"); ?>
<script src="dist/homepage.js"></script>
</body>
</html>