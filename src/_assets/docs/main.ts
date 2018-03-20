import "./main.scss";
import "../../example-runner/example-runner.ts";
import { $, lazyload, AnchorJS, Prism, initCookieDisclaimer } from "../common/vendor";

declare const autocomplete: any;
declare const algoliasearch: any;

const anchors = new AnchorJS();
anchors.options = {
    placement: "left",
    visible: "hover"
};

var selectors = [1, 2, 3, 4, 5].map(level => "#content:not(.skip-in-page-nav) h" + level).join(", ");

anchors.add(selectors);

$(function() {
    var client = algoliasearch("O1K1ESGB5K", "29b87d27d24660f31e63cbcfd7a0316f");

    var index = client.initIndex("AG-GRID");
    var searchConfig = { hitsPerPage: 5, snippetEllipsisText: "&hellip;", attributesToSnippet: JSON.stringify(["text:15"]) };
    var autocompleteConfig = {
        hint: false,
        debug: true,
        autoselect: true,
        keyboardShortcuts: ["s", "/"]
    };

    autocomplete("#search-input", autocompleteConfig, [
        {
            source: autocomplete.sources.hits(index, searchConfig),
            displayKey: "title",
            templates: {
                suggestion: function(suggestion) {
                    return `<strong>${suggestion._highlightResult.title.value}</strong><br>${suggestion._snippetResult.text.value}`;
                }
            }
        }
    ]).on("autocomplete:selected", function(event, suggestion, dataset) {
        location.href = "/" + suggestion.objectID;
    });

    $('<span id="kbd-hint" title="press S to focus the search field"> <kbd>s</kbd> </span>').insertAfter("#search-input");

    $("#kbd-hint").click(function() {
        $("#search-input").focus();
    });
});

$(function() {
    var $currentlyExpanded = $("#side-nav-container li.expanded > ul");

    $("#side-nav-container > ul > li span").on("click", function() {
        var $parent = $(this).parent();
        var $otherCats = $parent
            .parent()
            .children()
            .not($parent);

        $otherCats.removeClass("expanded");

        var ul = $(this).next("ul");
        $parent.toggleClass("expanded");
    });

    var docNav = $("#doc-nav");
    var level = 1;
    var prevLink = null;
    var list = $("<ul></ul>");
    var breakpoints = [];

    docNav.empty().append(list);

    for (var i = 0, len = anchors.elements.length; i < len; i++) {
        (function() {
            var heading = anchors.elements[i];
            var headingLevel = heading.tagName.match(/\d/);
            var headingText = $(heading).text();

            var link = $(`<li class="level-${headingLevel}">
                <a href="#${heading.id}">${headingText}</a>
            </li>`);

            list.append(link);

            breakpoints.push({
                heading: $(heading),
                link: link
            });
        })();
    }

    $(window).on("scroll", function(e) {
        if (!breakpoints.length) {
            return;
        }

        var scrollTop = $(window).scrollTop();
        var i = 0;

        while (i < breakpoints.length && breakpoints[i].heading.offset().top < scrollTop) {
            i++;
        }

        docNav.find("a").removeClass("current-section");

        if (i == 0) {
            i = 1;
        }
        breakpoints[i - 1].link.find("> a").addClass("current-section");
    });

    new lazyload(document.querySelectorAll("#feature-roadshow img, .lazy-load"), {});
});
