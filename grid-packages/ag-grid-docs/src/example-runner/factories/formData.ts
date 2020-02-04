import * as angular from "angular";

const docs: angular.IModule = angular.module("documentation");

// taken from https://github.com/angular/angular.js/blob/489835dd0b36a108bedd5ded439a186aca4fa739/docs/app/src/examples.js#L53
docs.factory("formPostData", [
    "$document",
    function ($document: any) {
        return function (url: any, newWindow: any, fields: any) {
            /*
             * If the form posts to target="_blank", pop-up blockers can cause it not to work.
             * If a user chooses to bypass pop-up blocker one time and click the link, they will arrive at
             * a new default plnkr, not a plnkr with the desired template.  Given this undesired behavior,
             * some may still want to open the plnk in a new window by opting-in via ctrl+click.  The
             * newWindow param allows for this possibility.
             */
            const target = newWindow ? "_blank" : "_self";
            const form: any = angular.element(`<form style="display: none;" method="post" action="${url}" target="${target}"></form>`);

            angular.forEach(fields, (value, name) => {
                const input = angular.element(`<input type="hidden" name="${name}">`);
                input.attr("value", value);
                form.append(input);
            });

            $document.find("body").append(form);
            form[0].submit();
            form.remove();
        };
    }
]);
