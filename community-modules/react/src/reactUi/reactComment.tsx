import type { RefObject} from 'react';
import { useEffect } from 'react';

const useReactCommentEffect = (comment: string, eForCommentRef: RefObject<HTMLElement>) => {
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
