// число может быть знаковым, дробным, и в экспонинциальной форме
//
// 1.340
// -34
// +45e30
// -0.12e-45

const number = seq(
  opt(pattern(/[+-]/, {name: 'NumberSign'})),

  takeWhile(/\d/, {name: 'IntPart'}),

  opt(seq(tag('.'), takeWhile(/\d/, {name: 'DecPart'}))),

  opt(seq(pattern(/e/i), opt(tag('-', {name: 'ExpSign'})), takeWhile(/\d/, {name: 'ExpValue'})))
);


/*
 [...number('-100.4567e-10')] ->

  [
    {
      name: 'NumberSign',
      value: '-'
    },

    {
      name: 'IntPart',
      value: '100'
    },

    {
      name: 'DecPart',
      value: '4567'
    },

    {
      name: 'ExpSign',
      value: '-'
    },

    {
      name: 'ExpValue',
      value: '10'
    },
  ]
 */


/*
  [...zip(number('-100.4567e-10'))] ->

  [
    {
      name: 'Number',
      value: '-100.4567e-10'
    }
  ]
 */


// нужно написать такие функции seq, opt, tag, pattern, takeWhile, zip чтобы оно работало как показано в примерах
//
// Каждая такая функция возвращает функцию-генератор, которая принимает Iterable строки, елдит токены (если они указаны в настройках функции) и возвращает в конце промис, который содержит кортеж из двух элементов: распаршеная конструкция и переданный Iterable
//
// opt - это комбинатор, который говорит о том, что подходящие инструкции опциональны, по сути это аналог ? из регулярных выражений


function tag(tag, params = {}) {
  return function* (input) {
    let
      res = '';

    const
      tagIter = tag[Symbol.iterator](),
      inputIter = input[Symbol.iterator]();

    while (true) {
      const
        tagEl = tagIter.next();

      if (tagEl.done) {
        if (params.name) {
          yield {
            name: params.name,
            value: res
          };
        }

        return Promise.resolve([inputIter, res]);
      }

      if (tagEl.value !== inputIter.next().value) {
        return Promise.reject();
      }

      res += tagEl.value;
    }
  }
}

// const i = [...tag('<<<', {name: 'MyToken'})('<<<foo')];
// console.log(i);


function pattern(pattern, params = {}) {
  return function* (input) {
    const
      inputIter = input[Symbol.iterator](),
      inputValue = inputIter.next().value;

    if (!pattern.test(inputValue)) {
      return Promise.reject();
    }

    if (params.name) {
      yield {
        name: params.name,
        value: inputValue
      };
    }

    return Promise.resolve([inputIter, inputValue]);
  }
}

// const i = [...pattern(/[+-]/, {name: 'MyToken'})('-')];
// console.log(i);


function takeWhile(pattern, params = {}) {
  return function* (input) {
    let
      inputIter = input[Symbol.iterator](),
      res = '';

    while (true) {
      const
        inputValue = inputIter.next().value;
      console.log(inputValue, res)
      if (pattern.test(inputValue)) {
        res += inputValue;
        continue;
      }

      if (!res) {
        return Promise.reject();
      }

      if (params.name) {
        yield {
          name: params.name,
          value: res
        };
      }

      return Promise.resolve([inputIter, res]);
    }
  }
}

// const i = [...takeWhile(/\d/, {name: 'IntPart'})('1234da')];
// console.log(i);


function seq(...gens) {
  return function* (input) {
    let
      inputIter = input[Symbol.iterator](),
      res = '',
      resolve,
      reject;

    for (let [i, gen] of gens.entries()) {
      const
        iter = gen(inputIter),
        iterValue = iter.next().value;

      if (!iterValue.then) {
        yield iterValue;
      } else {
        iterValue
          .then(([iter, value]) => {
            res += value;

            if (i === gens.length - 1) {
              resolve([iter, res]);
            }
          })
          .catch(reject);
      }
    }

    return new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
  }
}


function opt(...gens) {
  return function* (input) {
    let
      inputIter = input[Symbol.iterator](),
      res = '',
      resolve,
      lastIter;

    for (let [i, gen] of gens.entries()) {
      const
        iter = gen(inputIter),
        iterValue = iter.next().value;

      if (!iterValue.then) {
        yield iterValue;
      } else {
        iterValue
          .then(([iter, value]) => {
            res += value;
            lastIter = iter;
          })
          .catch(() => {
          })
          .finally(() => {
            if (i === gens.length - 1) {
              resolve([lastIter, res]);
            }
          });
      }
    }

    return new Promise(res => {
      resolve = res;
    });
  }
}


function zip(iterator) {
  return (function* () {
    let
      res = '',
      name = '';

    for (const el of iterator) {
      res += el.value;

      if (el.name.contains('Number') || typeof +el.value === 'number' && !name) {
        name = 'Number';
      }
    }

    yield {
      name,
      value: res
    }

    return Promise.resolve([undefined, res])
  })();
}


class Container {
  status;
  value;

  static ok = 'ok';
  static failed = 'failed';

  /**
   *
   * @param status: 'ok' | 'failed'
   * @param value: any
   */
  constructor(status, value) {
    this.status = status;
    this.value = value;
  }
}
