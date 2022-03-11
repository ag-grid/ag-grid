// @ag-grid-community/react v27.1.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useReactCommentEffect = (comment, eForCommentRef) => {
    react_1.useEffect(() => {
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
    }, []);
};
exports.default = useReactCommentEffect;

//# sourceMappingURL=reactComment.js.map
