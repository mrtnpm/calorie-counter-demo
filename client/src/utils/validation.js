import Joi from 'joi-browser'

export const formSchemaValidationFor = (schema) => {
  return (values) => {
    var result = Joi.validate(values, schema, { abortEarly: false });
    var errors = {};

    if(result.error) {
      const reduceErrors = (acc, val) => { acc[val.path] = val.message; return acc; };
      return result.error.details.reduce(reduceErrors, errors)
    }

    return errors;
  }
}