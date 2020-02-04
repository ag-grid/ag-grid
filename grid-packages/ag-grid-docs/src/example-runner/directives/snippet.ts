import * as angular from "angular";
import {highlight} from "../lib/highlight";

const docs: angular.IModule = angular.module("documentation");

docs.directive("snippet", function() {
    const resetIndent = (str: string) => {
        const leadingWhitespace = str.match(/^\n?( +)/);
        if (leadingWhitespace) {
            return str.replace(new RegExp(" {" + leadingWhitespace[1].length + "}", "g"), "").trim();
        } else {
            return str.trim();
        }
    };

    return {
        restrict: "E",
        scope: {
            language: "="
        },
        link: function(scope, element, attrs) {
            const language = attrs.language || "js";
            const highlightedSource = highlight(resetIndent(element.text()), language);
            element.empty().html(`<pre><code>${highlightedSource}</code></pre>`);
        }
    };
});
