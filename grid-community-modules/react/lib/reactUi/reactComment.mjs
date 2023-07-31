// @ag-grid-community/react v30.0.6
import { useEffect } from 'react';
const useReactCommentEffect = (comment, eForCommentRef) => {
    useEffect(() => {
        const eForComment = eForCommentRef.current;
        if (eForComment) {
            const eParent = eForComment.parentElement;
            if (eParent) {
                const eComment = document.createComment(comment);
                eParent.insertBefore(eComment, eForComment);
                return () => {
                    eParent.removeChild(eComment);
                };
            }
        }
    }, [comment]);
};
export default useReactCommentEffect;
