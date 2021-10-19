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


// Работает некорректно

function zip(...restIterables) {
  const iteratorsArr = restIterables.map(el => el = el[Symbol.iterator]())
  return {
    [Symbol.iterator]() {
      return this
    },
    next() {
      let res
      const resultArr = []
      for (const el of iteratorsArr) {
        res = el.next()
        resultArr.push(res.value)
      }
      return {value: resultArr, done: res.done}
    }
  }
}

// let q = zip([1, 2, 3], [5, 6, 7])
// q.next()

Array.from(zip([1, 2, 3], [2, 3, 4]));
// [[1, 2], [2, 3], [3, 4]]

// #
// # zip 2

// Написать функцию, которая принимает 2 и более Iterable объектов и возвращает итератор,
// который создаст кортежи из элементов исходных итераторов. Итератор должен создаваться с помощью генератора.

function* zip2(...restIterables) {
  const iteratorsArr = []

  for (const el of restIterables) {
    const iter = el[Symbol.iterator]()
    iteratorsArr.push(iter)
  }

  while (true) {
    const resultArr = []
    for (const el of iteratorsArr) {
      const {value, done} = el.next()
      if (done) return
      resultArr.push(value)
    }
    yield resultArr
  }
}

Array.from(zip2([1, 2, 3], [2, 3, 4]));
// [[1, 2], [2, 3], [3, 4]]


// #
// # flat и flatMap


// Нужно написать аналог flat и flatMap, но который возвращает итератор. Генераторы использовать нельзя.

function flat(iterable, depth = 1) {
  const
    stack = [iterable[Symbol.iterator]()]

  return {
    [Symbol.iterator]() {
      return this
    },

    next() {
      while (true) {
        let iter = stack[stack.length - 1]

        if (iter == null) {
          return {done: true, value: undefined}
        }

        const res = iter.next()

        if (res.done) {
          depth++
          stack.pop()
          continue
        }

        if (res.value[Symbol.iterator] != null && depth > 0) {
          depth--
          stack.push(res.value[Symbol.iterator]())
          continue
        }
        console.log('before return', res)
        return res
      }
    }
  }
}

function flat1(iterable, depth = 1) {
  const mainIter = iterable[Symbol.iterator]()

  let cursor

  return {
    [Symbol.iterator]() {
      return this
    },

    next() {
      while (true) {
        const
          iter = cursor || mainIter,
          res = iter.next()

        if (res.done) {
          depth++
          if (iter === mainIter) {
            return res
          }

          cursor = null
          continue
        }

        if (res.value[Symbol.iterator] != null && depth > 0) {
          depth--
          cursor = flat1(res.value, depth)
          console.log('in if')
          continue
        }
        console.log('before return', res)
        return res
      }
    }
  }
}

Array.from(flat([[1, 2, 3], [2, 3, 4, [5, 6, [6, 8]]]]));

Array.from(flat([[1, 2, 3], [2, 3, 4]]));

// [1, 2, 2, 3, 3, 4]


function flatMap(iterable, cb) {
  const mainIter = iterable[Symbol.iterator]()
  let cursor
  let depth = 1

  return {
    [Symbol.iterator]() {
      return this
    },
    next() {
      while (true) {
        const iter = cursor || mainIter
        const res = iter.next()

        if (res.done) {
          depth++
          if (iter === mainIter) return res

          cursor = null
          continue
        }

        if (res.value[Symbol.iterator] && depth > 0) {
          depth--
          cursor = flatMap(res.value, cb)
          continue
        }

        if (iter === mainIter) res.value = cb(res.value)
        return res
      }
    }
  }
}

Array.from(flatMap([[1, 2, 3], [2, 3, 4]], a => a * 2));
// [2, 4, 6, 4, 6, 8]


// #
// # flat и flatMap2


// Нужно написать аналог flat и flatMap, но который возвращает итератор. Итератор должен создаваться с помощью генератора.


function* flat2(iterable, depth = 1) {
  function* gen(iter) {
    for (const el of iter) {
      if (el[Symbol.iterator] && --depth > 0) {
        yield* gen(el)
      } else yield el
    }
  }

  for (const el of iterable) {
    yield* gen(el)
  }
}

Array.from(flat2([[1, 2, 3], [2, 3, 4, [5, 6]]]));

// [1, 2, 2, 3, 3, 4]


function* flatMap2(iterable, cb) {
  for (const iterableEl of iterable) {
    for (const el of iterableEl) {
      yield cb(el)
    }
  }
}

Array.from(flatMap2([[1, 2, 3], [2, 3, 4]], a => a * 2));
// [2, 4, 6, 4, 6, 8]