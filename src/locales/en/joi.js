export default {
  any: {
    empty: '"{{label}}" field is not allowed to be empty',
    required: '"{{label}}" field is required'
  },
  string: {
    min: 'Value of "{{label}}" field must be at least {{limit}} characters long'
  },
  number: {
    base: 'Value of "{{label}}" field must be a number',
    min: 'Value of "{{label}}" field must be larger than or equal to {{limit}}'
  },
  date: {
    min: 'Value of "{{label}}" field must be larger than or equal to {{limit}}',
    isoDate: 'Value of "{{label}}" field must be a valid ISO 8601 date'
  },
  array: {
    unique: '"{{label}}" field should not contain duplicate values'
  }
};
