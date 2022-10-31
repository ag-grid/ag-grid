// ag-grid-react v28.2.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var useEffectOnce_1 = require("./useEffectOnce");
var useReactCommentEffect = function (comment, eForCommentRef) {
    useEffectOnce_1.useEffectOnce(function () {
        var eForComment = eForCommentRef.current;
        var eParent = eForComment.parentElement;
        if (!eParent) {
            return;
        }
        var eComment = document.createComment(comment);
        eParent.insertBefore(eComment, eForComment);
        return function () {
            eParent.removeChild(eComment);
        };
    });
};
exports.default = useReactCommentEffect;
