<style>
    .hide {
        display: none;
    }

    .form-control {
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
    }

    .curved-border {
        border-radius: 5px;
        border: 1px solid #ccc;
        margin-top: 15px;
    }

    .popover{
        max-width: 100%;
        width: 600px;
    }
</style>

<div class="container-fluid curved-border">
    <form action="https://app.britebiz.com/webToContact" method="POST" id="NB79YK" accept-charset="UTF-8" onSubmit="return validateForm();" name="NB79YK">
        <div class="hide">
            <input type="hidden" value="NB79YK" name="form_id" id="form_id"/><input type="hidden" value="57f3c21fac73aa8" name="wtc" id="wtc"/>
            <input type="hidden" value="https://www.ag-grid.com/license-pricing.php?submitted=true" name="return_url" id="return_url"/>
            <input type="hidden" value="" name="WebToContact[gclid]" id="WebToContact_gclid"/>
        </div>
        <div class="hide"><input type="hidden" value="Website" name="WebToContact[source]" id="WebToContact_source"/></div>
        <div class="hide"><input type="hidden" value="Web Form" name="WebToContact[source_detail]" id="WebToContact_source_detail"/></div>
        <div class="hide"><input type="hidden" value="Primary - Contact" name="WebToContact[type]" id="WebToContact_type"/></div>

        <div class="form-group" style="margin-top: 10px">
            <label for="WebToContact[first_name]">First Name</label>
            <input maxlength="100" class="form-control" placeholder="First Name" type="text" value="" name="WebToContact[first_name]" id="WebToContact_first_name"/>
        </div>
        <div class="form-group">
            <label for="WebToContact[last_name]">Last Name</label>
            <input maxlength="100" class="form-control" placeholder="Last Name" type="text" value="" name="WebToContact[last_name]" id="WebToContact_last_name"/>
        </div>
        <div class="form-group">
            <label for="WebToContact[company_name]">Company Name</label>
            <input maxlength="100" class="form-control" placeholder="Company Name" type="text" value="" name="WebToContact[company_name]" id="WebToContact_company_name"/>
        </div>
        <div class="form-group">
            <label for="WebToContact[email]">Email</label>
            <input maxlength="100" class="form-control" placeholder="Email" type="text" value="" name="WebToContact[email]" id="WebToContact_email"/>
        </div>
        <div class="form-group">
            <? if ($startTrial) { ?>
                <label for="WebToContact[message]">Your message to us below.</label>
            <? } else { ?>
                <label for="WebToContact[message]">Your message to us below. If ordering, please provide the following information:</label>
                <ul>
                    <li>Company Address and VAT Number (EU only for VAT number).</li>
                    <li>Do you require an Application Developer or a Site Developer license?
                        <i data-toggle="popover"
                           title="<strong>Application Developer vs Site Developer?</strong"
                           data-content="
                           <p><strong>Application Developer License</strong> ties the license to one particular application within your organisation. A typical example is 5 licenses to cover an application with 5 developers working concurrently on it.
                              This is best if you a) have only one (or a fixed number) of applications you need to license or b) you want to charge the license to a particular project(s). </p>
                            <p><strong>Site Developer License</strong> allows unlimited applications to be developed by a fixed number of developers.
                               A typical example is 5 license to cover an unlimited number of applications with 5 developers working
                               across all applications concurrently. Use site license if you want to cover a group of developers developing any number of applications.</p>"
                           class="fa fa-question-circle-o"
                           aria-hidden="true"></i>
                    </li>
                    <li style="margin-left: 15px">If Application Developer license, please provide your Application Name</li>
                    <li>Number of Licenses that you require.</li>
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
                </ul>
            <? } ?>
        </div>
        <textarea rows="8" class="form-control" name="WebToContact[message]" id="WebToContact_message"><? if ($startTrial) { ?>
Dear ag-Grid Team,

I am interested in taking a two trial of ag-Grid Enterprise.

Please email me back with a license key that I can use for my trial.

Thank you.
<? } ?></textarea>

        <div class="form-group" style="margin-top: 10px;">
            <? if ($startTrial) { ?>
                <input id="btn_submit" name="btn_submit" type="submit" class="btn btn-default" value="Request Trial"/>
            <? } else { ?>
                <input id="btn_submit" name="btn_submit" type="submit" class="btn btn-default" value="Send your info to ag-Grid"/>
            <? } ?>
        </div>
    </form>
</div>

<script type="text/javascript">
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function findField(fieldName) {
        return document.forms['NB79YK']['WebToContact[' + fieldName + ']'];
    }
    function fieldFocus(fieldName) {
        field = findField(fieldName);
        if (field)
            return field.focus()
    }
    function fieldVal(fieldName) {
        field = findField(fieldName);
        if (field)
            return field.value;
        return '';
    }
    function validateEmail(fieldName) {
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,20})?$/;
        if (fieldVal(fieldName) == "" || !emailReg.test(fieldVal(fieldName))) {
            alert("Invalid Email Address!");
            fieldFocus(fieldName);
            return false;
        } else {
            return true;
        }
    }


    function validateForm() {
        var mandFields = new Array('first_name', 'last_name', 'company_name', 'email', 'message');
        var fieldLbl = new Array('First Name', 'Last Name', 'Company Name', 'Email', 'Message');
        for (i = 0; i < mandFields.length; i++) {
            fieldValue = fieldVal(mandFields[i]);
            if ((fieldValue.replace(/^s+|s+$/g, '')).length == 0) {
                alert(fieldLbl[i] + ' cannot be empty');
                fieldFocus(mandFields[i]);
                return false;
            } else {
                field = findField(mandFields[i]);
                if (field.nodeName == 'SELECT') {
                    if (field.options[field.selectedIndex].value == '-None-') {
                        alert('You must select an option for: ' + fieldLbl[i]);
                        field.focus();
                        return false;
                    }
                }
            }
        }

        if (validateEmail("email")) {
            var field = findField('btn_submit');
            if (field) field.disabled = true;
            return true;
        }
        return false;
    }

    $(function() {
        $('[data-toggle="popover"]').popover({
            placement : 'top',
            trigger : 'hover',
            html : true
        });

        var submitted = getParameterByName("submitted");
        if(submitted) {
            $("#thankyou").show();
        } else {
            $("#thankyou").hide();
        }
    });
</script>
