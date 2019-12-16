<?php
$navKey = "about";
include_once 'includes/html-helpers.php';
gtm_data_layer('about');
?>
<!DOCTYPE html>
<html lang="en">

<head lang="en">
    <?php
    meta_and_links("Our Mission, Our Principles and Our Team at ag-Grid", "About ag-Grid", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is the story of ag-Grid and explains our mission, where we came from and who we are.", true);
    ?>
    <link rel="stylesheet" href="dist/homepage.css">
    <script src="dist/homepage.js"></script>
</head>

<body>
    <header id="nav" class="compact">
        <?php
        $version = 'latest';
        include './includes/navbar.php';
        ?>
    </header>
    <div class="page-content">
        <div class="about-page">
            <div class="row">
                <section>
                    <h1>Our Mission</h1>
                    <article>
                        <p class="lead">
                            At ag-Grid, our mission is simple: <strong>Build the best datagrid in the world</strong>.
                        </p>
                        <p>
                            Born out of frustration with existing solutions, <strong>ag-Grid</strong> evolved from a side project to becoming the leading JavaScript datagrid on the market. We are a company built by developers for developers, and - true to our roots - we offer <strong>ag-Grid Community</strong>: a free and open-source project that delivers world class grid performance. <strong>ag-Grid Enterprise</strong> is our commercially-licensed offering which has enjoyed widespread adoption and facilitates us to keep delivering on our mission.
                        </p>
                        <p>
                            Our story is proof that necessity is the mother of invention. During his time working in London-based financial institutions, <strong>Niall Crosby</strong> - founder and CEO - struggled to find any datagrid component that could deliver the performance required in tandem with a complete feature list. This struggle ultimately led Niall to pulling out the keyboard one Christmas holiday period and starting <strong>ag-Grid</strong> as a side project. This was then released as open source and quickly developed a following.
                        </p>
                        <p>
                            Niall found himself having to devote considerable time and effort to maintaining <strong>ag-Grid</strong>, even fielding feature requests from users. It became apparent that this thing had legs - and the idea of <strong>ag-Grid Enterprise</strong> took seed in Niall’s mind. A little over one year after the project started the first commercial version was launched.
                        </p>
                        <p>
                            Today, <strong>ag-Grid</strong> is a self-funded, bootstrapped company with thousands of customers globally. Our product has resonated in the market - as our users face the same challenges Niall did - and this has been central to our rapid growth. And we’re not stopping here: we are working on the next great features to continue our mission.
                        </p>
                    </article>
                </section>
                <section>
                    <h1> Our Principles</h1>
                    <article>
                        <p>We believe that a datagrid should be agnostic to the framework that developers choose. This allows flexibility and future-proofs your development. This is also where the 'ag' in <strong>ag-Grid</strong> comes from. </p>
                        <p>Our experience is in building Enterprise applications: we know that the datagrid is at the core of an Enterprise application, and needs to deliver performance and a rich feature set. </p>
                        <p>We give away what others charge for. <strong>ag-Grid Community</strong> provides all of the features of our competition. We only charge when we go above and beyond, with features that other grids don’t provide. </p>
                    </article>
                </section>

                <p> </p>
                <section>
                    <h1 id="core-development-team"> Core Development Team</h1>
                    <article class="inline-container team">

                        <div class="row">
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/niall.jpg' alt="Niall Crosby, CEO / CTO" />
                                </div>
                                <h3>Niall Crosby</h3>
                                <h4>CEO / CTO</h4>

                            </div>
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/rob.jpg' alt="Rob Clarke, Head of Engineering" />
                                </div>
                                <h3>Rob Clarke</h3>
                                <h4>Head of Engineering</h4>

                            </div>
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/sean.jpg' alt="Sean Landsman, Lead Developer" />
                                </div>
                                <h3>Sean Landsman</h3>
                                <h4>Lead Developer, Frameworks</h4>

                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/gil.jpg' alt="Guilherme Lopes, Lead Developer" />
                                </div>
                                <h3>Guilherme Lopes</h3>
                                <h4>Lead Developer, UI</h4>

                            </div>
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/vitaly2.jpg' alt="Vitaly Kravchenko, Lead Developer" />
                                </div>
                                <h3>Vitaly Kravchenko</h3>
                                <h4>Lead Developer, Data Visualisation</h4>

                            </div>

                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/adrian.jpg' alt="Adrian Lowdon, Lead Developer" />
                                </div>
                                <h3>Adrian Lowdon</h3>
                                <h4>Lead Developer, Grid Core</h4>
                            </div>

                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/viqas.jpg' alt="Viqas Hussain, Lead Developer" />
                                </div>
                                <h3>Viqas Hussain</h3>
                                <h4>Lead Developer, E-commerce</h4>
                            </div>

                        </div>
                    </article>
                </section>
                <p> </p>
                <section>
                    <h1 id="customer_services_and_consultancy"> Customer Services & Consultancy</h1>
                    <article class="inline-container team">

                        <div class="row">

                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/alberto.jpg' alt="Alberto Gutierrez, Head of Customer Services" />
                                </div>
                                <h3>Alberto Gutierrez</h3>
                                <h4>Head of Customer Services</h4>
                            </div>
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/davis2.jpg' alt=" Davis Jaunbruns, Support Engineer" />
                                </div>
                                <h3>Davis Jaunbruns</h3>
                                <h4>Developer</h4>
                            </div>


                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/ahmed2.jpg' alt=" Ahmed Gadir, Support Engineer" />
                                </div>
                                <h3>Ahmed Gadir</h3>
                                <h4>Developer</h4>
                            </div>

                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/bam2.jpg' alt=" Bamdad Fard, Support Engineer" />
                                </div>
                                <h3>Bamdad Fard</h3>
                                <h4>Developer</h4>
                            </div>

                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/shuheb.jpg' alt=" Shuheb Ahmed, Support Engineer" />
                                </div>
                                <h3>Shuheb Ahmed</h3>
                                <h4>Developer</h4>
                            </div>

                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/louis.jpg' alt=" Louis Moore, Support Engineer" />
                                </div>
                                <h3>Louis Moore</h3>
                                <h4>Developer</h4>
                            </div>
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/michael.jpg' alt=" Michael Adesina, Support Engineer" />
                                </div>
                                <h3>Michael Adesina</h3>
                                <h4>Developer</h4>
                            </div>
                        </div>
                    </article>
                </section>
                <p> </p>
                <section>
                    <h1 id="operations_team"> The Operations Team</h1>
                    <article class="inline-container team">

                        <div class="row">
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/dimo.jpg' alt="Dimo Iliev, Managing Director" />
                                </div>
                                <h3>Dimo Iliev</h3>
                                <h4>Managing Director</h4>
                            </div>

                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/alex.jpg' alt="Alex Price, COO" />
                                </div>
                                <h3>Alex Price</h3>
                                <h4>Operations Manager</h4>
                            </div>

                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/dimple.jpg' alt="Dimple Unalkat, Customer Experience Team" />
                                </div>
                                <h3>Dimple Unalkat</h3>
                                <h4>Customer Experience Manager</h4>
                            </div>

                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/ashley2.jpg' alt="Ashley Lam, Business Development Manager" />
                                </div>
                                <h3>Ashley Lam</h3>
                                <h4>Business Development Manager</h4>
                            </div>

                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/najma.jpg' alt="Najma Mohamud, Customer Experience Manager" />
                                </div>
                                <h3>Najma Mahomud</h3>
                                <h4>Customer Experience Manager</h4>
                            </div>
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/robD.jpg' alt="Rob Dunkiert, Customer Experience Manager" />
                                </div>
                                <h3>Rob Dunkiert</h3>
                                <h4>Customer Experience Manager</h4>
                            </div>
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/julia.jpg' alt="Julia O'Dell, Customer Experience Manager" />
                                </div>
                                <h3>Julia O'Dell</h3>
                                <h4>Customer Experience Manager</h4>
                            </div>
                        </div>
                    </article>

                    <p> </p>

                    <h1 id="marketing_team"> The Marketing Team</h1>
                    <article class="inline-container team">

                        <div class="row">
                            <div class="col-md-4">
                                <div>
                                    <img src='images/team/max.jpg' alt="Max Koretskyi, Developer Advocate and Content Marketer" />
                                </div>
                                <h3>Max Koretskyi</h3>
                                <h4>Developer Advocate | Content Marketer</h4>
                            </div>
                        </div>
                    </article>
                </section>
                <section>
                    <Div calls='row'>
                        <p></p>
                    </Div>

                </section>

                <section>
                    <h1 id="contact"> Contact Us </h1>
                    <article class="inline-container row">
                        <div class="col-md-6">
                            <h3>Our Address</h3>
                            <address>
                                <strong>ag-Grid Ltd.</strong><br />
                                Bank Chambers,<br />
                                6 Borough High Street<br />
                                London,<br />
                                SE1 9QQ,<br />
                                United Kingdom
                            </address>
                            <p>Email Enquiries: <a href="mailto:info@ag-grid.com">info@ag-grid.com</a></p>
                        </div>
                        <div class="col-md-6">
                            <h3>Want to work with us?</h3>
                            <p> We are always looking for Javascript Developers with Enterprise Applications experience. </p>
                            <p>Check the <a href="./ag-grid-jobs-board/">jobs board</a>.</p>
                        </div>
                    </article>
                </section>

            </div>
        </div>
        <?php include_once("./includes/footer.php"); ?>
    </div>
    <?php include_once("./includes/analytics.php"); ?>
</body>

</html>