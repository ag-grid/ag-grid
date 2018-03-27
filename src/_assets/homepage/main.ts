import "./main.scss";
import { $, lazyload, AnchorJS, Prism, initCookieDisclaimer } from "../common/vendor";
import "./pipeline.ts";
import "./changelog.ts";

function resetIndent(str) {
    const leadingWhitespace = str.match(/^\n?( +)/);
    if (leadingWhitespace) {
        return str.replace(new RegExp(" {" + leadingWhitespace[1].length + "}", "g"), "").trim();
    } else {
        return str;
    }
}

// order form
$(() => {
    $("[data-order-form]").each(function() {
        // dynamic methods as we have three order forms on pricing page

        var formKey = $(this).data("orderForm");
        let field;

        window[formKey + "_getParameterByName"] = function(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return "";
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        };
        window[formKey + "_findField"] = function(fieldName) {
            return document.forms[formKey]["WebToContact[" + fieldName + "]"];
        };
        window[formKey + "_fieldFocus"] = function(fieldName) {
            field = window[formKey + "_findField"](fieldName);
            if (field) return field.focus();
        };
        window[formKey + "_fieldVal"] = function(fieldName) {
            field = window[formKey + "_findField"](fieldName);
            if (field) return field.value;
            return "";
        };
        window[formKey + "_validateEmail"] = function(fieldName) {
            var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,20})?$/;
            if (window[formKey + "_findField"](fieldName) == "" || !emailReg.test(window[formKey + "_fieldVal"](fieldName))) {
                alert("Invalid Email Address!");
                window[formKey + "_fieldFocus"](fieldName);
                return false;
            } else {
                // append site key for internal use
                document.forms[formKey]["WebToContact[message]"].value += " | Form: " + formKey + "";

                return true;
            }
        };

        window[formKey + "_validateForm"] = function() {
            var mandFields = new Array("first_name", "last_name", "company_name", "email", "message");
            var fieldLbl = new Array("First Name", "Last Name", "Company Name", "Email", "Message");
            for (var i = 0; i < mandFields.length; i++) {
                let fieldValue = window[formKey + "_fieldVal"](mandFields[i]);
                if (fieldValue.replace(/^s+|s+$/g, "").length == 0) {
                    alert(fieldLbl[i] + " cannot be empty");
                    window[formKey + "_fieldFocus"](mandFields[i]);
                    return false;
                } else {
                    field = window[formKey + "_findField"](mandFields[i]);
                    if (field.nodeName == "SELECT") {
                        if (field.options[field.selectedIndex].value == "-None-") {
                            alert("You must select an option for: " + fieldLbl[i]);
                            field.focus();
                            return false;
                        }
                    }
                }
            }

            if (window[formKey + "_validateEmail"]("email")) {
                var field = window[formKey + "_findField"]("btn_submit");
                if (field) field.disabled = true;
                return true;
            }
            return false;
        };

        (<any>$('[data-toggle="popover"]')).popover({
            placement: "top",
            trigger: "hover",
            html: true
        });

        var submitted = window[formKey + "_getParameterByName"]("submitted");

        if (submitted) {
            $("#thankyou").show();
        } else {
            $("#thankyou").hide();
        }
    });
});

$(() => {
    initCookieDisclaimer();

    var links = $("#nav-scenarios a");
    var demos = $("#stage-scenarios .demo");

    links.each(function(index) {
        $(this).click(function() {
            links.removeClass("active");
            $(this).addClass("active");

            demos.removeClass("current");
            $(demos[index]).addClass("current");

            demos[index].dispatchEvent(new CustomEvent("scenarios:show", { bubbles: false, cancelable: false }));

            return false;
        });
    });

    (<any>$('[data-toggle="popover"]')).popover();

    var anchors = new AnchorJS();
    anchors.options = {
        placement: "left",
        visible: "hover"
    };

    anchors.add("#stage-feature-highlights section h3, #stage-feature-highlights section h4");
    var nav = $("#stage-feature-highlights aside .scroll-wrapper");

    var level = 3;
    var prevLink = null;
    var list = $("<ul></ul>");
    var breakpoints: { heading: any; link: any }[] = [];

    nav.append(list);

    anchors.elements.forEach(heading => {
        var $heading = $(heading);
        var headingLevel = parseInt(heading.tagName.slice(1));

        var enterprise = $heading
            .parent()
            .parent()
            .hasClass("enterprise");

        var link = $(`<li><a href=#${heading.id}>${$heading.text()} ${enterprise ? ' <span class="enterprise-icon">e</span>' : ""}</a></li>`);

        if (headingLevel > level) {
            list = $("<ul></ul>");
            prevLink.append(list);
        } else if (headingLevel < level) {
            list = list.parent().parent();
        }

        list.append(link);
        prevLink = link;
        level = headingLevel;

        breakpoints.push({
            heading: $heading,
            link: link
        });
    });

    new lazyload(document.querySelectorAll("#stage-feature-highlights img"), {});

    if (breakpoints.length) {
        window.addEventListener("scroll", function(e) {
            var scrollBottom = $(window).scrollTop();
            var i = 0;

            while (i < breakpoints.length - 1 && breakpoints[i].heading.offset().top < scrollBottom) {
                i++;
            }

            nav.find("li").removeClass("current-feature");
            breakpoints[i].link.addClass("current-feature");
        });
    }

    // code highlighting
    $("pre > code").each(function() {
        $(this).text(resetIndent($(this).text()));
    });
    Prism.highlightAll(false);
});

function loadDemos() {
    $(".demo").each(function() {
        $(this)
            .find(".loading")
            .load($(this).data("load"))
            .removeClass("loading");
    });
}
$(() => {
    if (window["agGrid"]) {
        loadDemos();
    } else {
        $("#ag-grid-script").on("load", loadDemos);
    }
});
