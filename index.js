"use strict";
/* tslint:disable:no-bitwise */
Object.defineProperty(exports, "__esModule", { value: true });
if (!Array.prototype.groupBy) {
    Array.prototype.groupBy = function (prop) {
        var key;
        var result = this.reduce(function (grouped, item) {
            key = item[prop]; //(typeof prop === 'function') ? prop.apply(this, [item]) : item[prop]
            grouped[key] = grouped[key] || [];
            grouped[key].push(item);
            return grouped;
        }, {});
        var ret = [];
        Object.keys(result).forEach(function (row) {
            var item = {};
            //const cat = typeof prop === 'function' ? 'key' : prop
            item[prop] = row;
            item.group = result[row];
            ret.push(item);
        });
        return ret;
    };
}
if (!Array.prototype.aggregate) {
    Array.prototype.aggregate = function (querys) {
        return this.map(function (row) {
            Object.keys(querys).forEach(function (query) {
                var func = querys[query];
                var data = row.group.map(function (group) { return group[query]; });
                var value;
                var name = '';
                if (typeof func === 'string') {
                    value = Array.prototype[func].call(data);
                    name = func;
                }
                else {
                    value = func.call(data);
                }
                row[name + query.charAt(0).toUpperCase() + query.slice(1)] = value;
            });
            delete row.group;
            return row;
        });
    };
}
if (!Array.prototype.diff) {
    Array.prototype.diff = function (values) {
        var s = new Set(values);
        return this.filter(function (x) { return !s.has(x); });
    };
}
if (!Array.prototype.filterNonUnique) {
    Array.prototype.filterNonUnique = function () {
        var _this = this;
        return this.filter(function (i) { return _this.indexOf(i) !== _this.lastIndexOf(i); });
    };
}
if (!Array.prototype.similarity) {
    Array.prototype.similarity = function (values) {
        return this.filter(function (v) { return values.includes(v); });
    };
}
if (!Array.prototype.first) {
    Array.prototype.first = function () {
        return this[0];
    };
}
if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
}
if (!Array.prototype.count) {
    Array.prototype.count = function () {
        return this.length;
    };
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
    Array.prototype.min = function (field) {
        return Math.min.apply(Math, this.by(field));
        //return Math.min.apply(null, this.by(field) as number[])
    };
}
if (!Array.prototype.max) {
    Array.prototype.max = function (field) {
        return Math.max.apply(Math, this.by(field));
        //return Math.max.apply(null, this.by(field) as number[])
    };
}
if (!Array.prototype.sum) {
    Array.prototype.sum = function (field) {
        return this.by(field).reduce(function (prev, current) { return +current + prev; }, 0); // parseFloat
    };
}
if (!Array.prototype.average) {
    Array.prototype.average = function (field) {
        var that = this.by(field);
        return that.reduce(function (prev, current) { return +current + prev; }, 0) / that.length;
    };
}
if (!Array.prototype.unique) {
    Array.prototype.unique = function (field) {
        // [...new Set(this)]
        var that = this.by(field);
        var o = {};
        var i;
        var l = that.length;
        var r = [];
        for (i = 0; i < l; i += 1) {
            o[JSON.stringify(that[i])] = that[i];
        }
        Object.keys(o).forEach(function (index) {
            r.push(o[index]);
        });
        return r;
    };
}
function flatten(list, depth, 
// mapperFn?: ((value: any, index: number, array?: any[]) => any[] | undefined),
mapperFn, mapperCtx) {
    if (depth === 0) {
        return list;
    }
    return list.reduce(function (accumulator, item, i) {
        if (mapperFn) {
            item = mapperFn.call(mapperCtx || list, item, i, list);
        }
        if (Array.isArray(item)) {
            accumulator.push.apply(accumulator, flatten(item, depth - 1));
        }
        else {
            accumulator.push(item);
        }
        return accumulator;
    }, []);
}
if (!Array.prototype.flat) {
    Array.prototype.flat = function (depth) {
        if (depth === void 0) { depth = Infinity; }
        return flatten(this, depth);
    };
}
if (!Array.prototype.flatMap) {
    Array.prototype.flatMap = function (callback, thisArg) {
        return flatten(this, 1, callback, thisArg);
    };
}
if (!Array.prototype.by) {
    Array.prototype.by = function (field) {
        return field ? this.map(typeof field === 'function' ? field : function (val) { return val[field]; }) : this;
        //return typeArg(field, this)
    };
}
if (!Array.prototype.take) {
    Array.prototype.take = function (numberOf) {
        var begin;
        var end;
        if (numberOf >= 0) {
            begin = 0;
            end = numberOf;
        }
        else {
            begin = numberOf;
            end = this.length;
        }
        return this.slice(begin, end);
    };
}
if (!Array.prototype.includes) {
    Array.prototype.includes = function (valueToFind, fromIndex) {
        if (fromIndex === void 0) { fromIndex = 0; }
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) {
            return false;
        }
        var n = fromIndex | 0;
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        function sameValueZero(x, y) {
            return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }
        while (k < len) {
            if (sameValueZero(o[k], valueToFind)) {
                return true;
            }
            k++;
        }
        return false;
    };
}
if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;
        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}
if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function (predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.findIndex called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;
        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return i;
            }
        }
        return -1;
    };
}
if (!Array.prototype.fill) {
    Array.prototype.fill = function (value) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        var start = arguments[1];
        var relativeStart = start >> 0;
        var k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);
        var end = arguments[2];
        var relativeEnd = end === undefined ? len : end >> 0;
        var final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);
        while (k < final) {
            O[k] = value;
            k++;
        }
        return O;
    };
}
if (typeof Object.assign !== 'function') {
    Object.assign = function (target) {
        'use strict';
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
}
if (!Object.isString) {
    Object.isString = function isString(value) {
        return typeof value === 'string' || value instanceof String;
    };
}
if (!Object.isNumber) {
    Object.isNumber = function isNumber(value) {
        return typeof value === 'number' || value instanceof Number;
    };
}
if (!Object.isBoolean) {
    Object.isBoolean = function isBoolean(value) {
        return typeof value === 'boolean' || value instanceof Boolean;
    };
}
if (!Object.isObject) {
    Object.isObject = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Object]';
    };
}
if (!Object.isArray) {
    Object.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}
if (!Object.isNull) {
    Object.isNull = function (obj) {
        return obj === null;
    };
}
if (!Object.isUndefined) {
    Object.isUndefined = function (obj) {
        return obj === void 0;
    };
}
if (!Object.isFunction) {
    Object.isFunction = function (obj) {
        return typeof obj === 'function' || false;
    };
}
if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}
if (!Number.isFinite) {
    Number.isFinite =
        Number.isFinite ||
            function (value) {
                return typeof value === 'number' && isFinite(value);
            };
}
if (!Number.isInteger) {
    Number.isInteger =
        Number.isInteger ||
            function (value) {
                return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
            };
}
exports.default = Array;
exports.JSONtoCSV = function (arr, columns, delimiter) {
    if (columns === void 0) { columns = Object.keys(arr[0]); }
    if (delimiter === void 0) { delimiter = ','; }
    return [
        columns.join(delimiter)
    ].concat(arr.map(function (obj) {
        return columns.reduce(function (acc, key) { return "" + acc + (!acc.length ? '' : delimiter) + "\"" + (!obj[key] ? '' : obj[key]) + "\""; }, '');
    })).join('\n');
};
exports.standardDeviation = function (arr, usePopulation) {
    if (usePopulation === void 0) { usePopulation = false; }
    var mean = arr.reduce(function (acc, val) { return acc + val; }, 0) / arr.length;
    return Math.sqrt(arr
        .reduce(function (acc, val) { return acc.concat(Math.pow((val - mean), 2)); }, [])
        .reduce(function (acc, val) { return acc + val; }, 0) /
        (arr.length - (usePopulation ? 0 : 1)));
};
exports.get = function (from, selector) {
    return selector
        .replace(/\[([^\[\]]*)\]/g, '.$1.')
        .split('.')
        .filter(function (t) { return t !== ''; })
        .reduce(function (prev, cur) { return prev && prev[cur]; }, from);
};
exports.flattenObject = function (obj, prefix) {
    if (prefix === void 0) { prefix = ''; }
    return Object.keys(obj).reduce(function (acc, k) {
        var pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object') {
            Object.assign(acc, exports.flattenObject(obj[k], pre + k));
        }
        else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
};
// https://github.com/30-seconds/30-seconds-of-code
