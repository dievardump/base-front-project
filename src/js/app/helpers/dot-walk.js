export default (path, object) => {
  const keys = path.split('.');

  // while there is keys and the object is not null or undefined
  while (keys.length && object) {
    object = object[keys.shift()];
  }

  // if keys.length is 0 then we found what we wanted
  // whatever the result or the type are
  if (!keys.length && object !== undefined) {
    return object;
  }

  // else we didn't find it so we return null
  return path;
};
