import "./homepage.scss";
import { $, initCookieDisclaimer } from "../common/vendor";
import "./pipeline.ts";
import "./changelog.ts";

$(() => {
    initCookieDisclaimer();

    $('[data-toggle="popover"]').popover();
});

function loadDemos() {
    $(".stage-scenarios:not(.main) .demo").each(function() {
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