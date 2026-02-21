import { useEffect, useRef } from "react";

const useAutoScroll = (dependencies = []) => {
    const ref = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            if (ref.current) {
                ref.current.scrollTop = ref.current.scrollHeight;
            }
        }, 100);
    }, dependencies);

    return ref;
};

export default useAutoScroll;
