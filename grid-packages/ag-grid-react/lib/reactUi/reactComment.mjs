// ag-grid-react v30.0.4
import { useEffectOnce } from './useEffectOnce.mjs';
const useReactCommentEffect = (comment, eForCommentRef) => {
    useEffectOnce(() => {
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
export default useReactCommentEffect;
