// число может быть знаковым, дробным, и в экспонинциальной форме
//
// 1.340
// -34
// +45e30
// -0.12e-45

// const number = seq(
//   opt(pattern(/[+-]/, {name: 'NumberSign'})),
//
//   takeWhile(/\d/, {name: 'IntPart'}),
//
//   opt(seq(tag('.'), takeWhile(/\d/, {name: 'DecPart'}))),
//
//   opt(seq(pattern(/e/i), opt(tag('-', {name: 'ExpSign'})), takeWhile(/\d/, {name: 'ExpValue'})))
// );


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

        return Thenable.resolve([res, inputIter]);
      }

      const inputIterEl = inputIter.next();

      if (tagEl.value !== inputIterEl.value) {
        return Thenable.reject(seqIter(res + inputIterEl.value, inputIter));
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
      return Thenable.reject(seqIter(inputValue, inputIter));
    }

    if (params.name) {
      yield {
        name: params.name,
        value: inputValue
      };
    }

    return Thenable.resolve([inputValue, inputIter]);
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

      if (pattern.test(inputValue)) {
        res += inputValue;
        continue;
      }

      const seqedIter = seqIter(inputValue, inputIter);

      if (!res) {
        return Thenable.reject(seqedIter);
      }

      if (params.name) {
        yield {
          name: params.name,
          value: res
        };
      }

      return Thenable.resolve([res, seqedIter]);
    }
  }
}

// const i = [...takeWhile(/\d/, {name: 'IntPart'})('1234da')];
// console.log(i);


function seq(...combs) {
  return function* (input) {
    let
      inputIter = input[Symbol.iterator](),
      res = '',
      returnedRes;

    for (const comb of combs) {
      let
        iter = comb(inputIter),
        iterEl;

      do {
        iterEl = iter.next();
        const iterValue = iterEl.value;

        if (typeof iterValue.then !== 'function') {
          yield iterValue;
          continue;
        }

        returnedRes = iterValue.then(([value, iter]) => {
          res += value;
          inputIter = iter;
          return [res, inputIter];
        });

        if (returnedRes.status === 'rejected') return Thenable.reject(returnedRes);

      } while (!iterEl.done);
    }

    return Thenable.resolve(returnedRes);
  }
}

// const i = [
//   ...seq(
//   pattern(/[+-]/, {name: 'MyToken'}),
//   takeWhile(/\d/, {name: 'IntPart'}),
//   tag('<<<')
//   )('+21312312<<<')
// ];


function opt(...combs) {
  return function* (input) {
    let
      inputIter = input[Symbol.iterator](),
      res = '';

    for (const comb of combs) {
      let
        iter = comb(inputIter),
        iterEl;

      do {
        iterEl = iter.next();
        const iterValue = iterEl.value;

        if (typeof iterValue.then !== 'function') {
          yield iterValue;
          continue;
        }

        iterValue.then(
          ([value, iter]) => {
            res += value;
            inputIter = iter;
          },
          (iter) => {
            inputIter = iter;
          }
        );

      } while (!iterEl.done);
    }

    return Thenable.resolve([res, inputIter]);
  }
}


function or(...combs) {
  return function* (input) {
    let
      inputIter = input[Symbol.iterator](),
      res = '';

    // const inputIter2 = makeContainer(inputIter);

    for (const [i, comb] of combs.entries()) {
      let
        iter = comb(inputIter),
        iterEl;

      // const iter2 = makeContainer(iter)

      do {
        iterEl = iter.next();
        // в этот момент inputIter - {value: undefined, done: true} - почему? это из-за композиции итераторов?
        const iterValue = iterEl.value;

        if (typeof iterValue.then !== 'function') {
          yield iterValue;
          continue;
        }

        const returnedRes = iterValue.then(
          ([value, iter]) => {
            res += value;
            inputIter = iter;
            return [res, inputIter];
          },
          (iter) => {
            if (i === combs.length - 1) {
              return Thenable.reject(iter);
            }
            // поэтому надо переприсваивать итератор здесь заново
            inputIter = iter;
          }
        );

        if (returnedRes.value != null) return Thenable.resolve(returnedRes);

      } while (!iterEl.done);
    }
  }
}

// [
//   ...or(
//     tag('!', {name: 'MyToken'}),
//     pattern(/\d/, {name: 'MyToken'}),
//   )('2<<<')
// ];

function qua(...combs) {
  return function* (input) {
    let
      inputIter = input[Symbol.iterator](),
      res = '';

    while (true) {
      for (const [i, comb] of combs.entries()) {
        let
          iter = comb(inputIter),
          iterEl;

        do {
          iterEl = iter.next();
          const iterValue = iterEl.value;

          if (typeof iterValue.then !== 'function') {
            yield iterValue;
            continue;
          }

          const returnedRes = iterValue.then(
            ([value, iter]) => {
              res += value;
              inputIter = iter;
            },
            (iter) => {
              // если реджект не в первом комбинаторе, значит невалидный синтаксис
              if (i !== 0) return Thenable.reject(iter);

              return Thenable.resolve([res, iter]);
            });

          if (returnedRes.value != null) return returnedRes;
        } while (!iterEl.done);
      }
    }
  }
}


function zip(iterator) {
  return (function* () {
    let
      res,
      name,
      iterEl;

    do {
      iterEl = iterator.next();
      const {value} = iterEl;

      if (name == null) {
        switch (value.name) {
          case 'IntPart':
            name = 'Number';
            break;
          case 'OpenQuoteMark':
            name = 'String';
            break;
          case 'OpenSqBracket':
            name = 'Array';
            break;
          case 'OpenBracket':
            name = 'Object';
            break;
          default:
            name = 'Unknown structure';
        }
      }

      if (typeof value.then === 'function') {
        value.then(([val]) => {
          res = val;
        });
      }

    } while (!iterEl.done);

    yield {
      name,
      value: res
    }

    return Thenable.resolve([res, iterator]);
  })();
}


class Thenable {

  static resolve = (value) => {
    if (typeof value?.then === 'function') return value;

    return new Thenable('fulfilled', value);
  }

  static reject = (value) => {
    if (typeof value?.then === 'function' && value.status === 'rejected') return value;

    return new Thenable('rejected', value);
  }

  constructor(status, value) {
    this.status = status;
    this.value = value;
  }

  then(onFulfilled, onRejected) {
    let res;

    if (this.status === 'fulfilled') {
      res = onFulfilled.call(null, this.value);
    } else {

      if (typeof onRejected !== 'function') {
        return Thenable.reject(this.value);
      }

      res = onRejected.call(null, this.value);
    }

    return Thenable.resolve(res);
  }
}

// не использую более короткую запись через [...iter].values(), потому что тогда название итератора получается Array Iterator
function seqIter(elem, iter) {
  const
    nextElems = [...iter].join(''),
    res = elem + nextElems;

  return res[Symbol.iterator]();
}

// function makeContainer(iter) {
//   return {
//     [Symbol.iterator]() {
//       return this;
//     },
//     next() {
//       return iter.next();
//     }
//   }
// }


const number = seq(
  opt(pattern(/-/, {name: 'NumberSign'})),

  takeWhile(/\d/, {name: 'IntPart'}),

  opt(seq(tag('.'), takeWhile(/\d/, {name: 'DecPart'}))),

  opt(seq(pattern(/e/i), opt(tag('-', {name: 'ExpSign'})), takeWhile(/\d/, {name: 'ExpValue'})))
);

const string = seq(
  pattern(/"/, {name: 'OpenQuoteMark'}),

  opt(takeWhile(/[^"\n\r\t\b\f\v]+/, {name: 'StringValue'})),

  pattern(/"/, {name: 'CloseQuoteMark'})
);

const literal = seq(
  or(
    tag('true', {name: 'TrueLit'}),
    tag('false', {name: 'FalseLit'}),
    tag('null', {name: 'NullLit'})
  )
);

const array = seq(
  tag('[', {name: 'OpenSqBracket'}),

  opt(or(string, number, literal)),
  qua(tag(','), pattern(/\s/), or(string, number, literal)),

  tag(']', {name: 'CloseSqBracket'}),
);

const object = seq(
  tag('{', {name: 'OpenBracket'}),

  opt(
    seq(
      tag('"'),
      takeWhile(/[^"\n\r\t\b\f\v]+/, {name: 'ObjKey'}),
      tag('"')
    ),

      tag(':'),
      pattern(/\s/),
      seq(or(string, number, literal))

  ),
  qua(
    tag(','),
    pattern(/\s/),
    seq(
      tag('"'),
      takeWhile(/[^"\n\r\t\b\f\v]+/, {name: 'ObjKey'}),
      tag('"')
    ),
    seq(
      tag(':'),
      pattern(/\s/),
      seq(or(string, number, literal))
    )
  ),

  tag('}', {name: 'CloseBracket'})
);
