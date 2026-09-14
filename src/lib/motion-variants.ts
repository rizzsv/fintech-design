export const authVariants = {
  // Page entrance
  pageEnter: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
  },
  
  // Form stagger
  formContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.05 } }
  },
  
  // Individual form field
  formField: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  },
  
  // Button feedback
  buttonHover: {
    scale: 0.98,
    transition: { duration: 0.1 }
  },
  buttonTap: {
    scale: 0.95
  },
  
  // Error message
  errorMessage: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
  }
};