/* tslint:disable:no-bitwise */

type map<M> = ((value: M, index?: number, array?: M[]) => any[])
type Field =
  | string
  | ((value: any, index?: number | undefined, array?: any[] | undefined) => any[])
  | undefined
type StringOrFunction = string | (() => void)
type Query = { [key: string /* in keyof T */]: StringOrFunction }
type Group = Array<{ P: string; group: any[]; [key: string]: any }>

declare global {
  interface Array<T> {
    groupBy<P>(prop: keyof T): Array<{ P: string; group: T[] }>
    /*| ((value: T, index: number, array: T[]) => any[])*/
    aggregate(querys: Query): T[]
    first(): T
    last(): T
    count(field?: (value: T, index: number, array: T[]) => any[]): number
    min(field?: string | map<T>): number
    max(field?: string | map<T>): number
    sum(field?: string | map<T>): number
    average(field?: string | map<T>): number
    unique(): T[]
    unique(field?: string | map<T>): string[]
    by(field?: keyof T | map<T>): any[]
    take(numberOf?: number): T[]
    fill(value: T, start?: number, end?: number): T[]
    diff(values: T[]): T[]
    filterNonUnique(): T[]
    similarity(values: T[]): T[]
    //flat(depth?: number): T[]
    //flatMap<U>(callbackfn: (value: T, index?: number, array?: T[]) => U, thisArg?: any): U[]
    ///includes(searchElement?: any): boolean
    //find(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T
    //findIndex(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): number
  }
}

if (!Array.prototype.groupBy) {
  Array.prototype.groupBy = function(prop: string): any[] {
    let key
    const result = this.reduce((grouped: any, item: any) => {
      key = item[prop] //(typeof prop === 'function') ? prop.apply(this, [item]) : item[prop]
      grouped[key] = grouped[key] || []
      grouped[key].push(item)
      return grouped
    }, {})
    const ret: any[] = []
    Object.keys(result).forEach(row => {
      const item: any = {}
      //const cat = typeof prop === 'function' ? 'key' : prop
      item[prop] = row
      item.group = result[row]
      ret.push(item)
    })
    return ret
  }
}

if (!Array.prototype.aggregate) {
  Array.prototype.aggregate = function(this: Group, querys: Query): any[] {
    return this.map(row => {
      Object.keys(querys).forEach(query => {
        const func: StringOrFunction = querys[query]
        const data = row.group.map((group: any) => group[query])
        let value
        let name = ''
        if (typeof func === 'string') {
          value = (Array.prototype as any)[func].call(data)
          name = func
        } else {
          value = func.call(data)
        }
        row[name + query.charAt(0).toUpperCase() + query.slice(1)] = value
      })
      delete row.group
      return row
    })
  }
}

if (!Array.prototype.diff) {
  Array.prototype.diff = function(values: any[]) {
    const s = new Set(values)
    return this.filter(x => !s.has(x))
  }
}

if (!Array.prototype.filterNonUnique) {
  Array.prototype.filterNonUnique = function() {
    return this.filter(i => this.indexOf(i) !== this.lastIndexOf(i))
  }
}

if (!Array.prototype.similarity) {
  Array.prototype.similarity = function(values: any[]) {
    return this.filter(v => values.includes(v))
  }
}

if (!Array.prototype.first) {
  Array.prototype.first = function() {
    return this[0]
  }
}

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1]
  }
}

if (!Array.prototype.count) {
  Array.prototype.count = function() {
    return this.length
  }
}

/* function typeArg(arg: any, arr: any[]): any[] {
  let that
  switch (typeof arg) {
    case 'function':
      that = arr.map(arg)
      break
    case 'string':
      that = arr.map(o => o[arg])
      break
    default:
      that = arr
      break
  }
  return that
} */

if (!Array.prototype.min) {
  Array.prototype.min = function(field: Field): number {
    return Math.min(...(this.by(field) as number[]))
    //return Math.min.apply(null, this.by(field) as number[])
  }
}

if (!Array.prototype.max) {
  Array.prototype.max = function(field: Field): number {
    return Math.max(...(this.by(field) as number[]))
    //return Math.max.apply(null, this.by(field) as number[])
  }
}

if (!Array.prototype.sum) {
  Array.prototype.sum = function(field: any) {
    return this.by(field).reduce((prev: number, current: number) => +current + prev, 0) // parseFloat
  }
}

if (!Array.prototype.average) {
  Array.prototype.average = function(field: Field): number {
    const that = this.by(field)
    return that.reduce((prev, current) => +current + prev, 0) / that.length
  }
}

if (!Array.prototype.unique) {
  Array.prototype.unique = function(field?: any) {
    // [...new Set(this)]
    const that = this.by(field)
    const o: any = {}
    let i
    const l = that.length
    const r: any[] = []
    for (i = 0; i < l; i += 1) {
      o[JSON.stringify(that[i])] = that[i]
    }
    Object.keys(o).forEach(index => {
      r.push(o[index])
    })
    return r
  }
}

function flatten<U>(
  list: any[],
  depth: number,
  // mapperFn?: ((value: any, index: number, array?: any[]) => any[] | undefined),
  mapperFn?: (value: any, index: number, array: any[]) => U | ReadonlyArray<U>,
  mapperCtx?: any
): any {
  if (depth === 0) {
    return list
  }
  return list.reduce((accumulator, item, i) => {
    if (mapperFn) {
      item = mapperFn.call(mapperCtx || list, item, i, list)
    }
    if (Array.isArray(item)) {
      accumulator.push(...flatten(item, depth - 1))
    } else {
      accumulator.push(item)
    }
    return accumulator
  }, [])
}

if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth: number | undefined = Infinity) {
    return flatten(this, depth)
  }
}

if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function<U, This>(
    callback: (value: any, index: number, array: any[]) => U | ReadonlyArray<U>,
    thisArg?: This | undefined
  ): U[] {
    return flatten(this, 1, callback, thisArg)
  }
}

if (!Array.prototype.by) {
  Array.prototype.by = function(field: Field) {
    return field ? this.map(typeof field === 'function' ? field : val => val[field]) : this
    //return typeArg(field, this)
  }
}

if (!Array.prototype.take) {
  Array.prototype.take = function(numberOf: number) {
    let begin
    let end
    if (numberOf >= 0) {
      begin = 0
      end = numberOf
    } else {
      begin = numberOf
      end = this.length
    }
    return this.slice(begin, end)
  }
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function(
    valueToFind: any,
    fromIndex: number | undefined = 0
  ): boolean {
    if (this == null) {
      throw new TypeError('"this" is null or not defined')
    }
    const o: any[] = Object(this)
    const len = o.length >>> 0
    if (len === 0) {
      return false
    }
    const n = fromIndex | 0
    let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)

    function sameValueZero(x: any, y: any) {
      return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y))
    }

    while (k < len) {
      if (sameValueZero(o[k], valueToFind)) {
        return true
      }
      k++
    }
    return false
  }
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate: any) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined')
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function')
    }
    const list = Object(this)
    const length = list.length >>> 0
    const thisArg = arguments[1]
    let value

    for (let i = 0; i < length; i++) {
      value = list[i]
      if (predicate.call(thisArg, value, i, list)) {
        return value
      }
    }
    return undefined
  }
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate: any) {
    if (this === null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined')
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function')
    }
    const list = Object(this)
    const length = list.length >>> 0
    const thisArg = arguments[1]
    let value

    for (let i = 0; i < length; i++) {
      value = list[i]
      if (predicate.call(thisArg, value, i, list)) {
        return i
      }
    }
    return -1
  }
}

if (!Array.prototype.fill) {
  Array.prototype.fill = function(value: any) {
    if (this == null) {
      throw new TypeError('this is null or not defined')
    }
    const O = Object(this)
    const len = O.length >>> 0
    const start = arguments[1]
    const relativeStart = start >> 0
    let k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len)
    const end = arguments[2]
    const relativeEnd = end === undefined ? len : end >> 0
    const final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len)
    while (k < final) {
      O[k] = value
      k++
    }
    return O
  }
}

declare global {
  interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any
    isString(value: any): boolean
    isNumber(value: any): boolean
    isBoolean(value: any): boolean
    isObject(value: any): boolean
    isArray(value: any): boolean
    isNull(value: any): boolean
    isUndefined(value: any): boolean
    isFunction(value: any): boolean
  }
}

if (typeof Object.assign !== 'function') {
  Object.assign = function(target: any) {
    'use strict'
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object')
    }

    const output = Object(target)
    for (let index = 1; index < arguments.length; index++) {
      const source = arguments[index]
      if (source !== undefined && source !== null) {
        for (const nextKey in source) {
          if (source.hasOwnProperty(nextKey)) {
            output[nextKey] = source[nextKey]
          }
        }
      }
    }
    return output
  }
}

if (!Object.isString) {
  Object.isString = function isString(value: any): boolean {
    return typeof value === 'string' || value instanceof String
  }
}

if (!Object.isNumber) {
  Object.isNumber = function isNumber(value: any): boolean {
    return typeof value === 'number' || value instanceof Number
  }
}

if (!Object.isBoolean) {
  Object.isBoolean = function isBoolean(value: any): boolean {
    return typeof value === 'boolean' || value instanceof Boolean
  }
}

if (!Object.isObject) {
  Object.isObject = function(arg: any): boolean {
    return Object.prototype.toString.call(arg) === '[object Object]'
  }
}

if (!Object.isArray) {
  Object.isArray = function(arg: any): boolean {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
}

if (!Object.isNull) {
  Object.isNull = function(obj: any): boolean {
    return obj === null
  }
}

if (!Object.isUndefined) {
  Object.isUndefined = function(obj: any): boolean {
    return obj === void 0
  }
}

if (!Object.isFunction) {
  Object.isFunction = function(obj: any): boolean {
    return typeof obj === 'function' || false
  }
}

if (!Array.isArray) {
  Array.isArray = function(arg: any): arg is any[] {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
}

if (!Number.isFinite) {
  Number.isFinite =
    Number.isFinite ||
    function(value: any): boolean {
      return typeof value === 'number' && isFinite(value)
    }
}

if (!Number.isInteger) {
  Number.isInteger =
    Number.isInteger ||
    function(value: any): boolean {
      return typeof value === 'number' && isFinite(value) && Math.floor(value) === value
    }
}

declare global {
  interface NumberConstructor {
    isFinite(value: any): boolean
    isInteger(value: any): boolean
  }
}

export default Array

export const JSONtoCSV = (arr: any[], columns: string[] = Object.keys(arr[0]), delimiter = ',') =>
  [
    columns.join(delimiter),
    ...arr.map(obj =>
      columns.reduce(
        (acc, key) => `${acc}${!acc.length ? '' : delimiter}"${!obj[key] ? '' : obj[key]}"`,
        ''
      )
    ),
  ].join('\n')

export const standardDeviation = (arr: number[], usePopulation = false) => {
  const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length
  return Math.sqrt(
    arr
      .reduce((acc: number[], val) => acc.concat((val - mean) ** 2), [])
      .reduce((acc, val) => acc + val, 0) /
      (arr.length - (usePopulation ? 0 : 1))
  )
}

export const get = (from: object, selector: string) =>
  selector
    .replace(/\[([^\[\]]*)\]/g, '.$1.')
    .split('.')
    .filter(t => t !== '')
    .reduce((prev: { [key: string]: any }, cur) => prev && prev[cur], from)

export const flattenObject = (obj: { [key: string]: any }, prefix = '') =>
  Object.keys(obj).reduce((acc: { [key: string]: any }, k) => {
    const pre = prefix.length ? prefix + '.' : ''
    if (typeof obj[k] === 'object') {
      Object.assign(acc, flattenObject(obj[k], pre + k))
    } else {
      acc[pre + k] = obj[k]
    }
    return acc
  }, {})

// https://github.com/30-seconds/30-seconds-of-code
