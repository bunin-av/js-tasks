// # Задания на тему Iterable API

// ## objToIterator

// Написать функцию, которая принимает объект и возвращает итератор, который обходит объект по элементам. Генераторы использовать нельзя.

const objToIterator = (obj) => {
  const keys = Object.keys(obj)
  obj[Symbol.iterator] = function () {
    let i = 0
    return {
      [Symbol.iterator]() {
        return this
      },
      next() {
        let cursor = i++
        return cursor < keys.length
          ? {value: obj[keys[cursor]], done: false}
          : {value: obj[keys[cursor]], done: true}
      }
    }
  }
  return obj
}

// [1, 2]
Array.from(objToIterator({a: 1, b: 2}));


// ## objToIterator 2

// Написать функцию, которая принимает объект и возвращает итератор, который обходит объект по элементам. Итератор должен создаваться с помощью генератора.

const objToIterator2 = (obj) => {
  const keys = Object.keys(obj)
  obj[Symbol.iterator] = function* () {
    for (let key of keys) {
      yield obj[key]
    }
  }
  return obj
}

// [1, 2]
Array.from(objToIterator({a: 1, b: 2}));


// ## filter

// Написать функцию, которая принимает Iterable объект и функцию-фильтр и возвращает итератор,
// который обходит только те элементы, для которых фильтр вернул true. Генераторы использовать нельзя.


function filter(iterable, cb) {
  const iter = iterable[Symbol.iterator]()

  return {
    [Symbol.iterator]() {
      return this
    },
    next() {
      let result
      while (result = iter.next()) {
        if (result.done || cb(result.value)) return result
      }
    }
  }
}

function filter1(iterable, cb) {
  const iter = iterable[Symbol.iterator]()

  return {
    [Symbol.iterator]() {
      return this
    },
    next() {
      let res = iter.next()
      if (cb(res.value) || res.done) return res
      else return this.next()
    }
  }
}

// [3, 4]
Array.from(filter(new Set([1, 2, 3, 4]), (el) => el > 2));


// ## filter 2

// Написать функцию, которая принимает Iterable объект и функцию-фильтр и возвращает итератор, который обходит только те элементы, для которых фильтр вернул true. Итератор должен создаваться с помощью генератора.

function* filter2(iterable, cb) {
  for (const el of iterable) {
    if (cb(el)) yield el
  }
}

// [3, 4]
Array.from(filter(new Set([1, 2, 3, 4]), (el) => el > 2));

// ## map

// Написать функцию, которая принимает Iterable объект и функцию отображения и возвращает итератор, который возвращает элементы, полученные с помощью функции отображения. Генераторы использовать нельзя.


function map(iterable, cb) {
  const iter = iterable[Symbol.iterator]()
  return {
    [Symbol.iterator]() {
      return this
    },
    next() {
      const result = iter.next()
      result.value = cb(result.value)
      return result
    }
  }
}

// [2, 4, 6, 8]
Array.from(map(new Set([1, 2, 3, 4]), (el) => el * 2));


// ## map 2

// Написать функцию, которая принимает Iterable объект и функцию отображения и возвращает итератор, который возвращает элементы, полученные с помощью функции отображения. Итератор должен создаваться с помощью генератора.

function* map2(iterable, cb) {
  for (const el of iterable) {
    yield cb(el)
  }
}

// [2, 4, 6, 8]
Array.from(map(new Set([1, 2, 3, 4]), (el) => el * 2));


// ## on

// Написать функцию, которая принимает некоторый элемент и название события для прослушки и возвращает асинхронный итератор. Итератор будет возвращать новые элементы (объекты события) при срабатывании события.

function* on(element, event) {
  while(true) {
    yield new Promise(res => element.addEventListener(event, e => res(e), {once: true}));
  }
}

function on2(element, event) {
  return {
    [Symbol.iterator]() {
      return {
        [Symbol.iterator]() {
          return this
        },
        next() {
          return {
            value: new Promise(res => element.addEventListener(event, e => res(e), {once: true})),
            done: false
          }
        }
      }
    }
  }
}

(async () => {
  for await (const e of on(document, 'click')) {
    console.log(e);
  }
})();
