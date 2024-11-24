
const pick = (obj, ...fields) => {
  const result = Object.entries(obj).filter(([key, value]) => {
    if (fields.includes(key)) {
      return [key, value];
    }
  });
  return Object.fromEntries(result);
};
