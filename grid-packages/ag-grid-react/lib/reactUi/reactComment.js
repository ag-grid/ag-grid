// ag-grid-react v27.1.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useReactCommentEffect = function (comment, eForCommentRef) {
    react_1.useEffect(function () {
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
    }, []);
};
exports.default = useReactCommentEffect;
