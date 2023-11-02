// ag-grid-react v30.2.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useReactCommentEffect = function (comment, eForCommentRef) {
    react_1.useEffect(function () {
        var eForComment = eForCommentRef.current;
        if (eForComment) {
            var eParent_1 = eForComment.parentElement;
            if (eParent_1) {
                var eComment_1 = document.createComment(comment);
                eParent_1.insertBefore(eComment_1, eForComment);
                return function () {
                    eParent_1.removeChild(eComment_1);
                };
            }
        }
    }, [comment]);
};
exports.default = useReactCommentEffect;
