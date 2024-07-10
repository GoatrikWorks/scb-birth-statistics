import React from 'react';
import { motion, useSpring } from 'framer-motion';

const ProgressBar = ({ isAnimating }) => {
    const scaleX = useSpring(0, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    React.useEffect(() => {
        if (isAnimating) {
            scaleX.set(1);
        } else {
            scaleX.set(0);
        }
    }, [isAnimating, scaleX]);

    return (
        <motion.div
            className="progress-bar"
            style={{ scaleX, originX: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        />
    );
};

export default ProgressBar;
