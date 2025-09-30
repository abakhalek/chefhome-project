export const transformSubdocument = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => transformSubdocument(item));
  }

  if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Buffer)) {
    if (value._id) {
      value.id = value._id.toString();
      delete value._id;
    }

    Object.keys(value).forEach((key) => {
      value[key] = transformSubdocument(value[key]);
    });
  }

  return value;
};

export const applyToJSONTransform = (schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => transformSubdocument(ret)
  });

  schema.set('toObject', {
    virtuals: true
  });
};

export default applyToJSONTransform;