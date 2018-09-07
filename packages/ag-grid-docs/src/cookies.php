<?php 
$navKey = "about";
include_once 'includes/html-helpers.php';
gtm_data_layer('about');
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
<?php
meta_and_links("Cookies Policy", "About ag-Grid", "This page outlines our policy in relation to
  the cookies that we collect on our website.", true);
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

            <!DOCTYPE html>
<html>

<head id="top of page">
  <title>Cookie Policy</title>
</head>
<body class="text-center">
  <div id="introduction">
<h1 class="text-center">Cookie Policy</h1>
<hr>
<h4>Effective Date: May 17, 2018</h4>
<br><br>

<div class="list-group">
  <a href="#" class="list-group-item list-group-item-action active">
    Cookies Guide
  </a>
  <a href="#intro-privacy" class="list-group-item list-group-item-action">What is a Cookie?</a>
  <a href="#cookies-how-we-use" class="list-group-item list-group-item-action">How Do We Use Cookies?</a>
</body>

<div class="text-left">
<ol>
  <br><br>
    <h3 id="intro-privacy">What is a Cookie?</h3>
    <hr>
    <p>
      A <strong>"cookie"</strong> is a piece of information that is stored on your computer's hard drive and which records how you move your way around a website so that, when you revisit that website, it can present tailored options based on the information stored about your last visit. Cookies can also be used to analyse traffic and for advertising and marketing purposes. 
  <br><br>
Cookies are used by nearly all websites and do not harm your system. 
<br><br>
If you want to check or change what types of cookies you accept, this can usually be altered within your browser settings. You can block cookies at any time by activating the setting on your browser that allows you to refuse the setting of all or some cookies. However, if you use your browser settings to block all cookies (including essential cookies) you may not be able to access all or parts of our site.

<br><br>

<h3 id="cookies-how-we-use">How Do We Use Cookies?</h3>
<hr>
<br>
<p>We use cookies to track your use of our website. This enables us to understand how you use the site and track any patterns with regards how you are using our website. This helps us to develop and improve our website as well as products and / or services in response to what you might need or want.
  <br><br>
<strong>COOKIES ARE EITHER:</strong> 
<br><br>
<strong>Session cookies:</strong> these are only stored on your computer during your web session and are automatically deleted when you close your browser – they usually store an anonymous session ID allowing you to browse a website without having to log in to each page, but they do not collect any personal data from your computer; or
<br><br>
<strong>Persistent cookies:</strong> a persistent cookie is stored as a file on your computer and it remains there when you close your web browser. The cookie can be read by the website that created it when you visit that website again. We use persistent cookies for Google Analytics.
  <br><br>

<strong><p class="text-uppercase">Cookies can also be categorised as follows:</strong></p>
<br>
<strong>Strictly necessary cookies:</strong> These cookies are essential to enable you to use the website effectively, such as when buying a product and / or service, and therefore cannot be turned off. Without these cookies, the services available to you on our website cannot be provided. These cookies do not gather information about you that could be used for marketing or remembering where you have been on the internet.
<br><br>
<strong>Performance cookies:</strong> These cookies enable us to monitor and improve the performance of our website. For example, they allow us to count visits, identify traffic sources and see which parts of the site are most popular.
<br><br>
<strong>Functionality cookies:</strong> These cookies allow our website to remember choices you make and provide enhanced features. For instance, we may be able to provide you with news or updates relevant to the services you use. They may also be used to provide services you have requested such as viewing a video or commenting on a blog. The information these cookies collect is usually anonymised.
</p>
</div>

<?php include_once("./includes/footer.php"); ?>
<?php include_once("./includes/analytics.php"); ?>
</body>
</html>