// Необходимо написать функцию, которая создаёт структуру для ленивых вычислений


function lazy(Constructor, params) {
  function lazyConstructor(...args) {
    if (new.target) {
      const instance = new Constructor(...args)
      Object.assign(instance, lazyConstructor)
      for (let el of queue) {
        instance[el]()
      }
      return instance
    }
  }

  function findKeys (obj, keys){
    let allKeys = Object.getOwnPropertyNames(obj)
    if (keys) allKeys = [...allKeys, ...keys]
    if (obj.__proto__ !== Object.prototype) return findKeys(obj.__proto__, allKeys)
    return allKeys
  }

  const instance2 = new Constructor()
  const allKeys = findKeys(instance2)
  const queue = []

  for (let key of allKeys) {
    if (typeof instance2[key] === 'function') {
      instance2[key] = function () {
        queue.push(key)
      }
    }
  }
  Object.assign(lazyConstructor, params)
  lazyConstructor.__proto__ = instance2

  return lazyConstructor
}

class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;

    this.config = {
      errorHandler() {
        console.log('Boom!');
      }
    };
  }

  sayName() {
    console.log(`Name: ${this.name}`);
  }
}

const LazyUser = lazy(User, {
  config: {
    attr: {},
    errorHandler: Function
  }
});

LazyUser.sayName();

LazyUser.config.attr = 23232;
LazyUser.config.errorHandler();

const user = new LazyUser('Bob', 23);
