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
  },
  date: {
    min: '"{{label}}" must be larger than or equal to {{limit}}',
    isoDate: '"{{label}}" must be a valid ISO 8601 date'
  },
  array: {
    unique: '"{{label}}" should not contain duplicate values'
  }
};
