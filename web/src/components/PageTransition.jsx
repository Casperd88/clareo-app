import { useRef } from 'react';
import { motion } from 'framer-motion';

// On the very first mount we skip the y-translate so the page doesn't start
// shifted down (which on iOS Safari reads as a ~status-bar sized initial
// scroll while the URL bar collapses). Route-to-route transitions keep the
// subtle slide.
const firstMountVariants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const routeVariants = {
  initial: { opacity: 0, y: 20 },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function PageTransition({ children }) {
  const isFirstMount = useRef(true);
  const variants = isFirstMount.current ? firstMountVariants : routeVariants;
  isFirstMount.current = false;

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
