const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const invalidFields = error.details.map(detail => detail.path[0]);
      const errors = error.details.map(detail => detail.message);
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        invalidFields,
        errors
      });
    }
    
    next();
  };
};

module.exports = validateRequest;