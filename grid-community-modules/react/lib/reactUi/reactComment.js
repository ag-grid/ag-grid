// @ag-grid-community/react v29.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useEffectOnce_1 = require("./useEffectOnce");
const useReactCommentEffect = (comment, eForCommentRef) => {
    useEffectOnce_1.useEffectOnce(() => {
        const eForComment = eForCommentRef.current;
        const eParent = eForComment.parentElement;
        if (!eParent) {
            return;
        }
        const eComment = document.createComment(comment);
        eParent.insertBefore(eComment, eForComment);
        return () => {
            eParent.removeChild(eComment);
        };
    });
};
exports.default = useReactCommentEffect;

//# sourceMappingURL=reactComment.js.map
