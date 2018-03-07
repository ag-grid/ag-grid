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

            <h1>Our Mission</h1>

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
                Niall found himself having to devote considerable time and effort to maintaining <strong>ag-Grid</strong>, even fielding feature requests from users. It became apparent that this thing had legs - and the idea of <strong>ag-Grid Enterprise</strong> took seed in Niall’s mind. Fast forward to March 2016 and the first commercial version was launched.
            </p>

            <p>
                Today, <strong>ag-Grid</strong> is a self-funded, bootstrapped company with over 1,200 customers in 65 countries. Our product has resonated in the market - as our users face the same challenges Niall did - and this has been central to our rapid growth. And we’re not stopping here: we are working on the next great features to continue our mission.
            </p>

            <h2> Our Principles</h2>

            <p>We believe that a datagrid should be agnostic to the framework that developers choose. This allows flexibility and future-proofs your development. This is also where the 'ag' in <strong>ag-Grid</strong> comes from.  </p>

            <p>Our experience is in building Enterprise applications: we know that the datagrid is at the core of an Enterprise application, and needs to deliver performance and a rich feature set.  </p>

            <p>We give away what others charge for. <strong>ag-Grid Community</strong> provides all of the features of our competition. We only charge when we go above and beyond, with features that other grids don’t provide.  </p>

            <h2 id="team">The Technical Team</h2>


            <div class="inline-container team">
                <div class="row">

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/niall.jpg'/>
                        </div>
                        <h3>Niall Crosby</h3>
                        <h4>CEO / CTO</h4>
                        <p>
                            Niall provides the technical vision for ag-Grid, juggling this with the usual CEO duties. 15 years of experience building Enterprise applications has given Niall unique insight into the challenges while equipping him with the technical skills to deliver the correct solutions. Niall focuses primarily on developing and maintaining the core of ag-Grid and is very much at the heartbeat of the company.
                        </p>
                    </div>

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/sean.jpg'/>
                        </div>
                        <h3>Sean Landsman</h3>
                        <h4>Lead Developer, <br> Frameworks</h4>
                        <p>
                            Sean was the first person that Niall asked to join the team. Sean ensures that we can keep the agnostic in ag-Grid... he is responsible for integrating with all of our supported frameworks. Many of customers will be familiar with Sean as he is very active in our user forums supporting the needs of our customers. He has also recently given a number of talks at conferences where his calm manner belies his years of experience.
                        </p>
                    </div>

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/alberto.jpg'/>
                        </div>
                        <h3>Alberto Gutierrez</h3>
                        <h4>Lead Developer, <br> Data Internals</h4>
                        <p>
                            Alberto joined the team in early 2017 and further broadens the Enterprise applications experience. 
                            With over 15 years across multiple industries, Alberto has been involved in all aspects of the 
                            software development lifecycle. He has joined Niall in enhancing and expanding the core features 
                            of the grid as well as contributing technical and industry knowledge. 
                        </p>
                    </div>

                </div>

                <div class="row">

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/rob.jpg'/>
                        </div>
                        <h3>Rob Clarke</h3>
                        <h4>Lead Developer, <br> Enterprise Applications</h4>
                        <p>
                            Rob is a Software Architect and Developer who specialises in complex data-centric enterprise
                             applications within Finance. He is expert in numerous server and client side programming 
                            languages and technologies which he uses to drive forward the core engine of ag-Grid.
                        </p>
                    </div>

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/petyo.jpg'/>
                        </div>
                        <h3>Petyo Ivanov</h3>
                        <h4>Lead Developer, UI</h4>
                        <p>
                            With more than a decade of experience in front-end web technologies, Petyo ensures that ag-Grid
                             takes advantage of industry best practice. He is also charged with improving the look and feel 
                            of the grid and the overall user experience.
                        </p>
                    </div>

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/Rod.png'/>
                        </div>
                        <h3>Rod Smith</h3>
                        <h4>Support Engineer</h4>
                        <p>
                            Rod joins the team to provide a dedicated support for our
                            growing customer base through Zendesk. He is an experienced
                            Developer across many technologies and has become an expert
                            on ag-Grid and how it's used in our customers' applications.
                        </p>
                    </div>

                </div>
            </div>

            <h2 id="operations_team"> The Operations Team</h2>

            <div class="inline-container team">
                <div class="row">

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/john.jpg'/>
                        </div>
                        <h3>John Masterson</h3>
                        <h4>COO</h4>
                        <p>
                            John was the first business focused hire at ag-Grid and joined in late 2016 to manage and grow the customer base. 
                            As the company has grown, he has moved into the COO role but his focus remains on ensuring our customers receive
                            best-in-class service. His background is in operations and product management always with an eye on the end user of technology.
                            John heads up the customer team and is always available to deal with customer queries as well as building ag-Grid's infrastructure for growth.
                        </p>
                    </div>
                    
                    <div class="col-md-4">
                        <div>
                            <img src='images/team/Fahad.jpg'/>
                        </div>
                        <h3>Fahad Ahmad</h3>
                        <h4>Digital Marketing Executive</h4>
                        <p>
                            Fahad joins the company as the first employee with a primary focus on Digital Marketing. He comes with a background in Digital 
                            Marketing, Social Media Management and Content Creation. He is charged with the task of improving ag-Grid’s digital footprint 
                            using his expertise.
                        </p>
                    </div>
                </div>
            </div>
            
            <h2 id="customer_team"> The Customer Team</h2>

            <div class="inline-container team">
                <div class="row">

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/bas.jpg'/>
                        </div>
                        <h3>Bas Rahman</h3>
                        <h4>Customer Experience Team</h4>
                        <p>
                            Bas joined the team to manage our evergrowing customer base - she has broad experience in dealing with customers 
                            and internal stakeholders from previous roles in startups and consulting companies. Recently, Bas has been managing
                            ag-Grid participation in conferences and making sure everything runs smoothly for these events.
                        </p>
                    </div>

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/dimple.jpg'/>
                        </div>
                        <h3>Dimple Unalkat</h3>
                        <h4>Customer Experience Team</h4>
                        <p>
                            Dimple joined the company along with Bas in our first round of expansion of the customer team. She brings a wealth of 
                            sales and customer service experience from her previous roles in B2B sales. Since joining, Dimple has taken control of 
                            a number of important financial functions and is a specialist in customer retention.
                        </p>
                    </div>
                </div>
            </div>

            <h2 id="contact"> Contact Us </h2>

            <div class="inline-container">
                <div class="row">
                    <div class="col-md-6">
                            <h3>Our Address</h3>

                            <address>
                                <strong>ag-Grid Ltd.</strong><br>
                                The Treehouse, 2-10 Balham Station Road<br>
                                London, SW12 9SG
                                United Kingdom<br>
                            </address>

                        <p>Email Enquiries: <a href="mailto:info@ag-grid.com">info@ag-grid.com</a></p>
                    </div>

                    <div class="col-md-6">
                        <h3>Want to work with us?</h3>
                        <p> We are always looking for Javascript Developers with Enterprise Applications experience.  </p>

                        <p>Check the <a href="./ag-grid-jobs-board/">jobs board</a>.</p>
                    </div>
                </div> <!-- end row -->
            </div>

        </section>
    </div>
</div>

<?php include_once("./includes/footer.php"); ?>
<?php include_once("./includes/analytics.php"); ?>
</body>
</html>
