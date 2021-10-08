// # Задания на тему Iterable API

// ## enumerate


// Написать функцию, которая принимает Iterable объект и возвращает итератор,
// который возвращает пары вида [номер итерации, элемент.]. Генераторы использовать нельзя.

function enumerate(iterable) {
  let iterations = 0
  const iter = iterable[Symbol.iterator]()
  return {
    [Symbol.iterator]() {
      return this
    },
    next() {
      const {value, done} = iter.next()
      return {
        value: [iterations++, value],
        done
      }
    }
  }
}

Array.from(enumerate([1, 2, 3]));
// [[0, 1], [1, 2], [2, 3]]


// #
// # enumerate 2

// Написать функцию, которая принимает Iterable объект и возвращает итератор,
// который возвращает пары вида [номер итерации, элемент.]. Итератор должен создаваться с помощью генератора.

function* enumerate2(iterable) {
  let iterations = 0
  for (const el of iterable) {
    yield [iterations++, el]
  }
}

Array.from(enumerate2([1, 2, 3]));
// [[0, 1], [1, 2], [2, 3]]

// #
// # take


// Написать функцию, которая принимает Iterable объект и максимальное количество итераций и возвращает итератор,
// который завершиться после достижения нужного количества итераций. Генераторы использовать нельзя.

function take(iterable, maxIter) {
  const iter = iterable[Symbol.iterator]()
  return {
    [Symbol.iterator]() {
      return this
    },
    next() {
      const res = iter.next()
      if (!maxIter--) return {value: undefined, done: true}
      return res
    }
  }
}

Array.from(take([1, 2, 3], 2));
// [1, 2]

// #
// # take 2


// Написать функцию, которая принимает Iterable объект и максимальное количество итераций и возвращает итератор,
// который завершиться после достижения нужного количества итераций. Итератор должен создаваться с помощью генератора.

function* take2(iterable, maxIter) {
  for (const el of iterable) {
    if (!maxIter--) return
    yield el
  }
}

Array.from(take2([1, 2, 3], 2));
// [1, 2]

// #
// # repeat


// Написать функцию, которая принимает Iterable объект и количество повторений и возвращает итератор,
// который продублирует все элементы из исходного заданное количество раз. Генераторы использовать нельзя.

function repeat(iterable, amount) {
  let iter = iterable[Symbol.iterator]()
  return {
    [Symbol.iterator]() {
      return this
    },
    next() {
      let res = iter.next()
      const {done} = res
      if (done && --amount > 0) {
        iter = iterable[Symbol.iterator]()
        res = iter.next()
      }
      return res
    }
  }
}

Array.from(repeat([1, 2, 3], 2));
// [1, 2, 3, 1, 2, 3]

// #
// # repeat 2


// Написать функцию, которая принимает Iterable объект и количество повторений и возвращает итератор,
// который продублирует все элементы из исходного заданное количество раз. Итератор должен создаваться с помощью генератора.

function* repeat2(iterable, amount) {
  while (amount--) {
    yield* iterable
  }
}

Array.from(repeat2([1, 2, 3], 2));
// [1, 2, 3, 1, 2, 3]

// #
// # zip


// Написать функцию, которая принимает 2 и более Iterable объектов и возвращает итератор,
// который создаст кортежи из элементов исходных итераторов. Генераторы использовать нельзя.

function zip(...restIterables) {
  let iterVal
  let elemIter
  let elem
  let iterations = 0

  const doIter = () => {
    if (!iterVal || !iterVal.value) {
      iterations++
      iterVal = iter.next()
    }
    if (!elemIter || elem.done) {
      elemIter = iterVal.value[Symbol.iterator]()
    }
  }

  const iter = restIterables[Symbol.iterator]()
  return {
    [Symbol.iterator]() {
      return this
    },
    next() {
      const arr = []
      doIter()
      while (arr.length < 2) {
        elem = elemIter.next()
        if (elem.value) arr.push(elem.value)
        else doIter()
      }
      if (arr.length === 2 && arr[0] > arr[1]) [arr[0], arr[1]] = [arr[1], arr[0]]
      return iterations !== restIterables.length
        ? {value: arr, done: false}
        : {value: undefined, done: true}
    }
  }
}

let q = zip([1, 2, 3], [5, 6, 7])
q.next()


Array.from(zip([1, 2, 3], [2, 3, 4]));
// [[1, 2], [2, 3], [3, 4]]

// #
// # zip 2

// Написать функцию, которая принимает 2 и более Iterable объектов и возвращает итератор,
// который создаст кортежи из элементов исходных итераторов. Итератор должен создаваться с помощью генератора.

function* zip2(...restIterables) {
  let arr = []

  function* gen() {
    for (const el of restIterables) {
      yield* el[Symbol.iterator]()
    }
  }

  for (const el of gen()) {
    arr.push(el)
    if (arr.length === 2) {
      if (arr[0] > arr[1]) [arr[0], arr[1]] = [arr[1], arr[0]]
      yield arr
      arr = []
    }
  }
}

Array.from(zip2([1, 2, 3], [2, 3, 4]));
// [[1, 2], [2, 3], [3, 4]]

// #
// # flat
и
flatMap

  ```js
// Нужно написать аналог flat и flatMap, но который возвращает итератор. Генераторы использовать нельзя.

// [1, 2, 2, 3, 3, 4]
Array.from(flat([[1, 2, 3], [2, 3, 4]]));
```

// #
// # flat и flatMap2


// Нужно написать аналог flat и flatMap, но который возвращает итератор. Итератор должен создаваться с помощью генератора.

function* flat2(iterable, depth = 1) {
  function* gen(iter) {
    for (const el of iter) {
      if (el[Symbol.iterator]) yield* gen(el)
      else yield el
    }
  }

  for (const el of iterable) {
    yield* gen(el)
  }
}

Array.from(flat2([[1, 2, 3], [2, 3, 4, [5, 6]]]));

function* flatMap2(iterable) {

}

Array.from(flat2([[1, 2, 3], [2, 3, 4]]));
// [1, 2, 2, 3, 3, 4]