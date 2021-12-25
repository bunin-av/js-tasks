//# Задания на тему функциональное программирование

//## dasherize

// Написать функцию, которая преобразовывает строку из snake_case и camelCase в dash-style.
// Для реализации нужно использовать свёртку (reduce).

function dasherize(str) {
  return str
    .match(/[A-Za-z][a-z]+((?=[A-Z_])|$)/g)
    .map(s => s.toLowerCase())
    .join('-');
}

function dasherize(str) {
  return str
    .split('')
    .reduce((acc, el, i) => {
      if (i === 0) {
        return acc + el.toLowerCase();
      } else if (/[A-Z]/.test(el)) {
        return acc + '-' + el.toLowerCase();
      } else if (el === '_') {
        return acc + '-';
      }
      return acc + el.toLowerCase();
    }, '');
}


dasherize('FooBar_bla') // foo-bar-bla


// ## curry
//
// Написать функцию, которая на основе заданной функцию возвращают новую с поддержко каррирования.
// Функция каррирования должна поддерживать "дырки" с помощью специальной константы.

function sum(a, b, c) {
  return a + b * c;
}

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.call(this, ...args)
    }
    return function (...args2) {
      return curried.call(this, ...args, ...args2)
    }
  }
}

const curriedSum = curry(sum);

curriedSum(1)(curry._, 2)(3) // 7


// ## map для массива функций


// Написать функцию, которая принимает массив функций и массив значений и возвращает массив,
// где на каждый элемент применилась функция с таким же индексом

function map(funcArr, valArr) {
  return funcArr.map((fn, i) => fn(valArr[i]))
}


map([(a) => a + 10, (b) => b + 1], [2, 12, 5]) // [12, 13]


// ## map для массива функций #2


// Написать функцию, которая принимает массив функций и массив значений и возвращает массив,
// где каждая функция применяется для всех элементов массив значений

function map2(funcArr, valArr) {
  const res = [];

  for (const func of funcArr) {
    for (const val of valArr) {
      res.push(func(val));
    }
  }
  return res;
}

map2([(a) => a + 10, (b) => b + 1], [2, 12, 5]) // [12, 22, 15, 3, 13, 6]


// ## map для массива функций #3


// Написать функцию, которая принимает массив функций и массив значений и возвращает массив,
// где все функции последовательно применяются на каждый из элементов массива

function map3(funcArr, valArr) {
  const result = [];

  for (const val of valArr) {
    result.push(
      funcArr.reduce((acc, el, i) => {
        if (i === 0) return el(val);
        return el(acc);
      }, 0));
  }
  return result;
}


map3([(a) => a + 10, (b) => b + 1], [2, 12, 5]) // [13, 23, 16]


// ## compose


// Написать функцию, которая принимает множество функций и возвращает новую.
// Новая функция начнет вызывать переданные функции начиная с крайне правой и предавать результат функции слева.

function compose(...args) {

  return function composed(value) {
    if (args.length === 1) return args.pop()(value);

    return composed(args.pop()(value));
  }
}

compose((a) => a * 2, (a) => a + 10)(5) // 30


// ## Optional

// Реализовать класс Optional, который предоставляет обертку над значением, которого может и не быть.
// Класс должен обладать интерфейсом Монады и Функтора.

class Optional {
  value = [];

  constructor(value) {
    if (value != null) this.value = [value];
  }

  flatMap(cb) {
    if (this.value[0] == null) return this;

    const result = cb(this.value[0]);

    return new Optional(result?.value[0] ?? result);
  }

  map(cb) {
    if (this.value[0] == null) return this;

    return new Optional(cb(this.value[0]));
  }
}

const val = new Optional(10);

val
  .flatMap((val) => {
    return new Optional(val + 5);
  })

  .flatMap((val) => {
    if (val === 15) {
      return new Optional();
    }

    return new Optional(val);
  })

  // Для пустого Optional этот flatMap не выполнится (аналогия с then для rejected promise)
  .flatMap((val) => {
    console.log(val);
    return new Optional(val);
  });


val
  .map((val) => val + 5)
  .map((val) => val + 10) // Optional(25)

new Optional(10).map((val) => val + 5) // Optional()


// Мои рекурсии

function binary(arr, el, left = 0, right = arr.length - 1) {
  let
    mid = Math.floor((left + right) / 2);

  if (arr[mid] === el) return mid;
  else if (arr[mid] > el) return binary(arr, el, left, mid - 1);
  return binary(arr, el, mid + 1, right);
}


function map(arr, cb, idx = 0) {
  const newArr = [...arr];

  return (function mapping() {
    if (idx > arr.length - 1) return newArr;

    newArr[idx] = cb(newArr[idx]);

    return mapping(++idx);
  })();
}

map([1, 2, 3], a => a + 2)

function filter(arr, cb, i = 0) {
  const newArr = [];

  return (function filtering() {
    if (i === arr.length) return newArr;
    if (cb(arr[i])) newArr.push(arr[i]);

    return filtering(++i)
  })();
}

function forEach(arr, cb, idx = 0) {
  if (idx === arr.length) return;
  cb(arr[idx]);

  return forEach(arr, cb, ++idx);
}

function reduce(arr, cb, idx = 0, initValue = arr[0]) {
  let accumulator = initValue;

  return (function reducing() {
    if (idx > arr.length - 1) return accumulator;
    accumulator = cb(accumulator, arr[idx]);

    return reducing(++idx)
  })();
}
