import "./docs.scss";
import "../../example-runner/example-runner.ts";
import "../../react-runner/react-runner";
import { $, lazyload, AnchorJS } from "../common/vendor";

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

    autocomplete("input.search-input", autocompleteConfig, [
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

    $('<span id="kbd-hint" title="press S to focus the search field"> <kbd>s</kbd> </span>').insertAfter("input.search-input");

    $("#kbd-hint").click(function() {
        $("input.search-input").focus();
    });
});

$(function() {
    $("#side-nav-container > ul > li span").on("click", function() {
        var $parent = $(this).parent();
        var $otherCats = $parent
            .parent()
            .children()
            .not($parent);

        $otherCats.removeClass("expanded");
        $parent.toggleClass("expanded");
    });

    var docNav = $("#doc-nav");
    var list = $("<ul></ul>");
    var breakpoints = [];

    docNav.empty().append(list);

    var headings = [];
    var maxLevel = 1;

    for (var i = 0, len = anchors.elements.length; i < len; i++) {
        (function() {
            var heading = anchors.elements[i];
            var headingLevel = heading.tagName.match(/\d/);

            headings.push({ level: headingLevel, heading: heading });

            if (headingLevel > maxLevel) {
                maxLevel = headingLevel;
            }
        })();
    }

    // limit the length of the side menu
    while (headings.length > 50 && maxLevel > 1) {
        headings = headings.filter(function(h) { return h.level < maxLevel; });
        maxLevel--;
    }

    for (var i = 0; i < headings.length; i++) {
        (function() {
            var heading = headings[i].heading;
            var headingText = $(heading).text();
            var link = $(`<li class="level-${headings[i].level}">
                <a href="#${heading.id}">${headingText}</a>
            </li>`);

            list.append(link);

            breakpoints.push({
                heading: $(heading),
                link: link
            });
        })();
    }

    var imgs = document.querySelectorAll("#feature-roadshow img, .lazy-load");
    new lazyload((imgs && imgs.length) ? imgs : [], {});
});
