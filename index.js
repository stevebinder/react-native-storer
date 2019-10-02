import { AsyncStorage } from 'react-native';

let isWritingPromise = null;

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {}
}

const decode = value => {
  if (value === null) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch (error) {}
};

const encode = value => {
  try {
    return JSON.stringify(value);
  } catch (error) {}
};

export const getStorage = (...args) => {
  if (!args[0]) {
    return new Promise(resolve =>
      AsyncStorage.getAllKeys().then(keys => getStorage(keys).then(resolve)));
  }
  if (typeof args[0] === 'string') {
    const [key, defaultValue] = args;
    return AsyncStorage.getItem(key).then(value => {
      const decodedValue = decode(value);
      if (!decodedValue && decodedValue !== 0) {
        return defaultValue;
      }
      return decodedValue;
    });
  }
  const keys = typeof args[0] === 'string'
    ? [args[0]]
    : args[0];
  return AsyncStorage.multiGet(keys).then(results => results.reduce(
    (result, [key, value]) => ({
      ...result,
      [key]: decode(value),
    }),
    {},
  ));
};

export const setStorage = (...args) => {
  if (typeof args[0] === 'string' && typeof args[1] === 'function') {
    const [key, setter] = args;
    const onWriteDone = value => {
      const decodedValue = decode(value);
      const newValue = setter(decodedValue);
      const encodedValue = encode(newValue);
      if (newValue === undefined || encodedValue === undefined) {
        return AsyncStorage.removeItem(key).then(() => encodedValue);
      }
      return AsyncStorage.setItem(key, encodedValue).then(() => encodedValue);
    };
    if (isWritingPromise) {
      isWritingPromise = isWritingPromise.then(onWriteDone);
      return isWritingPromise;
    }
    isWritingPromise = AsyncStorage.getItem(key)
      .then(onWriteDone)
      .then(value => {
        isWritingPromise = null;
        return value;
      });
    return isWritingPromise;
  }
  const changes = typeof args[0] === 'string'
    ? { [args[0]]: args[1] }
    : args[0];
  const promises = Object.entries(changes).map(([key, value]) => {
    const encodedValue = encode(value);
    if (value === undefined || encodedValue === undefined) {
      return AsyncStorage.removeItem(key);
    }
    return AsyncStorage.setItem(key, encodedValue);
  });
  return Promise.all(promises);
};