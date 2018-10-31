/* tslint:disable:no-bitwise */

type map<M> = ((value: M, index?: number, array?: M[]) => any[])

declare global {
  interface Array<T> {
    groupBy(prop: string, fields?: string | (() => void) | any): T[]
    /*| ((value: T, index: number, array: T[]) => any[])*/
    aggregate(querys: any): T[]
    first(): T
    last(): T
    count(field?: (value: T, index: number, array: T[]) => any[]): number
    min(field?: string | map<T>): number
    max(field?: string | map<T>): number
    sum(field?: string | map<T>): number
    average(field?: string | map<T>): number
    unique(): T[]
    unique(field?: string | map<T>): string[]
    by(field?: string | map<T>): any[]
    flatten(depth?: number): T[]
    flatMap<U>(callbackfn: (value: T, index?: number, array?: T[]) => U, thisArg?: any): U[]
    take(numberOf?: number): T[]
    includes(searchElement?: any): boolean
    find(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T
    findIndex(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): number
    fill(value: T, start?: number, end?: number): T[]
  }
}

if (!Array.prototype.groupBy) {
  Array.prototype.groupBy = function(prop: string, fields?: string | (() => void) | any): any[] {
    let key
    const result = this.reduce((grouped: any, item: any) => {
      key = /*(typeof prop === 'function') ? prop.apply(this, [item]) :*/ item[prop]
      grouped[key] = grouped[key] || []
      let obj: any
      switch (typeof fields) {
        case 'function':
          obj = fields(item)
          break
        case 'string':
          obj = {}
          obj[fields] = item[fields]
          break
        case 'object':
          if (Array.isArray(fields)) {
            obj = fields.reduce((prev, curr) => {
              prev[curr] = item[curr]
              return prev
            }, {})
          }
          break
        default:
          obj = item
          break
      }
      grouped[key].push(obj)
      return grouped
    }, {})
    const ret: any[] = []
    Object.keys(result).forEach(row => {
      // console.log(row)
      const item: any = {}
      const cat = typeof prop === 'function' ? 'key' : prop
      item[cat] = row
      item.group = result[row]
      ret.push(item)
    })
    return ret
  }
}

if (!Array.prototype.aggregate) {
  Array.prototype.aggregate = function(querys) {
    // tslint:disable-line: typedef
    return this.map(row => {
      Object.keys(querys).forEach(query => {
        const func: any = querys[query]
        const data = row.group.map((group: any) => group[query])
        let value
        let name = ''
        if (typeof func === 'string') {
          value = (Array.prototype as any)[func].call(data)
          name = func
        } else {
          value = func.call(data)
        }
        row[name + '_' + query] = value
      })
      // console.log('row:', row.category, row)
      delete row.group
      return row
    })
  }
}

if (!Array.prototype.first) {
  Array.prototype.first = function() {
    // tslint:disable-line: typedef
    return this[0]
  }
}

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    // tslint:disable-line: typedef
    return this[this.length - 1]
  }
}

if (!Array.prototype.count) {
  Array.prototype.count = function() {
    // tslint:disable-line: typedef
    return this.length
  }

  /*Array.prototype.count = function (predicate) {
    if (Object.isObject(this[0]) && Object.isObject(this[this.length-1])) {
        return {count: this.length}
    }
    return this.reduce( (total, item) => {
        let propertie = predicate ? item[predicate] : item
        total[propertie] = (total[propertie] || 0) + 1
        return total
    }, {})
  }*/
}

function typeArg(arg: any, arr: any[]): any[] {
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
}

if (!Array.prototype.min) {
  Array.prototype.min = function(field) {
    // tslint:disable-line: typedef
    return Math.min.apply(null, this.by(field))
  }
}

if (!Array.prototype.max) {
  Array.prototype.max = function(field) {
    // tslint:disable-line: typedef
    return Math.max.apply(null, this.by(field))
  }
}

if (!Array.prototype.sum) {
  Array.prototype.sum = function(field: any) {
    return this.by(field).reduce((prev: number, current: number) => +current + prev, 0) // parseFloat
  }
}

if (!Array.prototype.average) {
  Array.prototype.average = function(field) {
    // tslint:disable-line: typedef
    const that = typeArg(field, this)
    const count = that.length
    const total = that.reduce((prev, current) => +current + prev, 0) // parseFloat
    return total / count
  }
}

if (!Array.prototype.unique) {
  Array.prototype.unique = function(field?: any) {
    const that = typeArg(field, this)
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

function flatten(
  list: any[],
  depth: number,
  mapperFn?: ((value: any, index?: number, array?: any[]) => any),
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

if (!Array.prototype.flatten) {
  Array.prototype.flatten = function(depth = Infinity) {
    // tslint:disable-line: typedef
    return flatten(this, depth)
  }
}

if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function(
    fn: ((value: any, index?: number, array?: any[]) => any),
    ctx: any
  ) {
    // tslint:disable-line: typedef
    return flatten(this, 1, fn, ctx)
  }
}

if (!Array.prototype.by) {
  Array.prototype.by = function(field) {
    // tslint:disable-line: typedef
    return typeArg(field, this)
  }
}

if (!Array.prototype.take) {
  Array.prototype.take = function(numberOf: number) {
    // tslint:disable-line: typedef
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
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    // tslint:disable-line: typedef
    'use strict'
    const O = Object(this)
    const len = parseInt(O.length, 10) || 0
    if (len === 0) {
      return false
    }
    const n = parseInt(arguments[1], 10) || 0
    let k
    if (n >= 0) {
      k = n
    } else {
      k = len + n
      if (k < 0) {
        k = 0
      }
    }
    let currentElement
    while (k < len) {
      currentElement = O[k]
      if (
        searchElement === currentElement ||
        (searchElement !== searchElement && currentElement !== currentElement)
      ) {
        // .. NaN !== NaN
        return true
      }
      k++
    }
    return false
  }
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate: any) {
    // tslint:disable-line: typedef
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
    // tslint:disable-line: typedef
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
    // tslint:disable-line: typedef

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
    // tslint:disable-line: typedef
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
