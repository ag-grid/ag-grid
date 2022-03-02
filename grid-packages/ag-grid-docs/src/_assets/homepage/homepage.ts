import "./homepage.scss";
import { $ } from "../common/vendor";

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

