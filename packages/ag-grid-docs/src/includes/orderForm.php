<?php if ($startTrial) { 
    $formKey = "startTrial";
}
?>
    <div id="orderForm" class="container-fluid" data-order-form="<?php echo $formKey ?>">
    <form action="https://app.britebiz.com/webToContact" method="POST" id="<?php echo $formKey; ?>" accept-charset="UTF-8" onSubmit="return <?php echo $formKey; ?>_validateForm();" name="<?php echo $formKey; ?>">
        <div class="hide">
            <input type="hidden" value="NB79YK" name="form_id" id="form_id"/>
            <input type="hidden" value="57f3c21fac73aa8" name="wtc" id="wtc"/>
<!--            <input type="hidden" value="https://www.ag-grid.com/license-pricing.php?submitted=true" name="return_url" id="return_url"/>-->
            <?php if ($startTrial) { ?>
                <input type="hidden" value="https://www.ag-grid.com/thank-you-trial.php" name="return_url" id="return_url"/>
            <?php } else { ?>
                <input type="hidden" value="https://www.ag-grid.com/thank-you-enquiry.php" name="return_url" id="return_url"/>
            <?php } ?>
            <input type="hidden" value="" name="WebToContact[gclid]" id="WebToContact_gclid"/>
        </div>
        <div class="hide"><input type="hidden" value="Website" name="WebToContact[source]" id="WebToContact_source"/></div>
        <div class="hide"><input type="hidden" value="Web Form" name="WebToContact[source_detail]" id="WebToContact_source_detail"/></div>
        <div class="hide"><input type="hidden" value="Primary - Contact" name="WebToContact[type]" id="WebToContact_type"/></div>

        <div class="form-group" style="margin-top: 10px">
            <label for="WebToContact_first_name">First Name</label>
            <input maxlength="100" class="form-control" placeholder="First Name" type="text" value="" name="WebToContact[first_name]" id="WebToContact_first_name"/>
        </div>
        <div class="form-group">
            <label for="WebToContact_last_name">Last Name</label>
            <input maxlength="100" class="form-control" placeholder="Last Name" type="text" value="" name="WebToContact[last_name]" id="WebToContact_last_name"/>
        </div>
        <div class="form-group">
            <label for="WebToContact_company_name">Company Name</label>
            <input maxlength="100" class="form-control" placeholder="Company Name" type="text" value="" name="WebToContact[company_name]" id="WebToContact_company_name"/>
        </div>
        <div class="form-group" style="margin-top: 10px"> 
        <label for="WebToContact[_cf_NXMIJJ]">Please let us know which Framework you are using, if applicable, this helps us provide better support.</label> 
        <input maxlength="100" class="form-control" placeholder="Framework e.g. Angular, React, Vue.js, Polymer, Aurelia." type="text" value="" name="WebToContact[_cf_NXMIJJ]" id="WebToContact__cf_NXMIJJ" /> 
        </div>
       

        <div class="form-group">
            <label for="WebToContact_email">Email</label>
            <input maxlength="100" class="form-control" placeholder="Email" type="text" value="" name="WebToContact[email]" id="WebToContact_email"/>
        </div>
        <div class="form-group">
            <?php if ($startTrial) { ?>
                <label for="WebToContact_message">Your message to us below.</label>
            <?php } else { ?>
                <label for="WebToContact_message">Your message to us below. If ordering, please provide the following information:</label>
                <ul>
                    <li>Company Address and VAT Number (EU only for VAT number).</li>
                    <li>Number of Licenses that you require.</li>

                    <?php if( $formKey == "applicationDeveloper") { ?>
                    <li>Application Name</li>
                    <?php } ?>

                    <?php if( $formKey == "saasAndOEM") { ?>
                    <li>Will you be selling ag-Grid as part of a SAAS (Software as a Service) offering?
                        <i data-toggle="popover"
                           title="<strong>SaaS</strong"
                           data-content="
                                <p>SaaS is Software as a Service.
                                   If you will be <span style='text-decoration: underline;'>selling</span>
                                   ag-Grid as part of a SaaS then you require an additional SaaS license.</p>"
                           class="fa fa-question-circle-o"
                           aria-hidden="true"></i>
                    </li>
                    <li>Will you be selling ag-Grid as part of an application (OEM)?
                        <i data-toggle="popover"
                           title="<strong>OEM</strong"
                           data-content="<p>OEM is Original Equipment Manufacturer. If you will be <span style='text-decoration: underline;'>selling</span> ag-Grid as part of your product then you require additional OEM license.</p>"
                           class="fa fa-question-circle-o"
                           aria-hidden="true"></i>
                    </li>
                    <?php } ?>
                </ul>
            <?php } ?>
        </div>
        <textarea rows="8" class="form-control" name="WebToContact[message]" id="WebToContact_message"><?php if ($startTrial) { ?>
Dear ag-Grid Team,

I am interested in taking a two month trial of ag-Grid Enterprise.

Please email me back with a license key that I can use for my trial.

Thank you.
<?php } ?></textarea>

        <div class="form-group text-right" style="margin-top: 10px;">
            <?php if ($startTrial) { ?>
                <input id="btn_submit" name="btn_submit" type="submit" class="btn btn-primary" value="Request Trial"/>
            <?php } else { ?>
                <input id="btn_submit" name="btn_submit" type="submit" class="btn btn-primary" value="Send your info to ag-Grid"/>
            <?php } ?>
        </div>
    </form>
</div>
