import * as angular from "angular";

import {highlight} from "../lib/highlight";

const docs: angular.IModule = angular.module("documentation");

docs.service("HighlightService", function() {
    this.highlight = function(code: string, language: string) {
        return highlight(code, language);
    };
});
