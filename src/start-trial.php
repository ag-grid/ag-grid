<?php
$navKey = "about";
include_once 'includes/html-helpers.php';
?>
<!DOCTYPE html>
<html>
<head lang="en">
<?php
meta_and_links("ag-Grid Start Trial", "Free Trial of ag-Grid JavaScrpt Datagrid", "Free Trial of ag-Grid JavaScrpt Datagrid", true);
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
            <h1>
                ag-Grid Enterprise Evaluation License
            </h1>

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
            </ul>
            </p>

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