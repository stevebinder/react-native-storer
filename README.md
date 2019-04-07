# Storer

Easy React Native storage.

```js
import { clearStorage, getStorage, setStorage } from 'react-native-storer';
```

Get a single key
```js
const age = await getStorage('age');
```

Get multiple keys:
```js
const { name, age } = await getStorage(['name', 'age']);
````

Set a single key:
```js
await setStorage('age', 21);
```

Set multiple keys:
```js
await setStorage({ name: 'Bob', age: 28 });
```

Set a key from a previous value:
```js
await setStorage('friends', friends => ([...friends, 'Joe']));
```

Get all keys:
```js
await getStorage();
```

Remove a key:
```js
await setStorage('friends');
```

Clear all storage:
```js
await clearStorage();
```