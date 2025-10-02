import mongoose from 'mongoose';

export const transformSubdocument = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => transformSubdocument(item));
  }

  if (value instanceof mongoose.Types.ObjectId) {
    try {
      return value.toHexString();
    } catch (_conversionError) {
      return value.toString();
    }
  }

  if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Buffer)) {
    if (value._id != null) {
      try {
        value.id = value._id.toString();
      } catch (_conversionError) {
        value.id = value._id;
      }
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
