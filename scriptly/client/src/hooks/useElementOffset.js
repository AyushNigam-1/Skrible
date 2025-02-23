import { useEffect, useState } from 'react';

const useElementHeight = (elementId) => {
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const calculateHeight = () => {
            const element = document.getElementById(elementId);
            if (element) {
                const offsetTop = element.getBoundingClientRect().top + window.scrollY;
                setHeight(window.innerHeight - offsetTop - 8);
            }
        };

        calculateHeight();
        window.addEventListener('resize', calculateHeight);
        return () => window.removeEventListener('resize', calculateHeight);
    }, [elementId]);

    return height;
};

export default useElementHeight;
