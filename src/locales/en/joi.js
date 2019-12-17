export default {
  any: {
    empty: '"{{label}}" is not allowed to be empty',
    required: '"{{label}}" is required'
  },
  string: {
    min: '"{{label}}" length must be at least {{limit}} characters long'
  },
  number: {
    base: '"{{label}}" must be a number',
    min: '"{{label}}" must be larger than or equal to {{limit}}'
  }
};
