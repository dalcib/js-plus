"use strict";
/* tslint:disable:no-bitwise */
Object.defineProperty(exports, "__esModule", { value: true });
if (!Array.prototype.groupBy) {
    Array.prototype.groupBy = function (prop, fields) {
        var key;
        var result = this.reduce(function (grouped, item) {
            key = /*(typeof prop === 'function') ? prop.apply(this, [item]) :*/ item[prop];
            grouped[key] = grouped[key] || [];
            var obj;
            switch (typeof fields) {
                case 'function':
                    obj = fields(item);
                    break;
                case 'string':
                    obj = {};
                    obj[fields] = item[fields];
                    break;
                case 'object':
                    if (Array.isArray(fields)) {
                        obj = fields.reduce(function (prev, curr) {
                            prev[curr] = item[curr];
                            return prev;
                        }, {});
                    }
                    break;
                default:
                    obj = item;
                    break;
            }
            grouped[key].push(obj);
            return grouped;
        }, {});
        var ret = [];
        Object.keys(result).forEach(function (row) {
            // console.log(row)
            var item = {};
            var cat = typeof prop === 'function' ? 'key' : prop;
            item[cat] = row;
            item.group = result[row];
            ret.push(item);
        });
        return ret;
    };
}
if (!Array.prototype.aggregate) {
    Array.prototype.aggregate = function (querys) {
        // tslint:disable-line: typedef
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
                row[name + '_' + query] = value;
            });
            // console.log('row:', row.category, row)
            delete row.group;
            return row;
        });
    };
}
if (!Array.prototype.first) {
    Array.prototype.first = function () {
        // tslint:disable-line: typedef
        return this[0];
    };
}
if (!Array.prototype.last) {
    Array.prototype.last = function () {
        // tslint:disable-line: typedef
        return this[this.length - 1];
    };
}
if (!Array.prototype.count) {
    Array.prototype.count = function () {
        // tslint:disable-line: typedef
        return this.length;
    };
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
function typeArg(arg, arr) {
    var that;
    switch (typeof arg) {
        case 'function':
            that = arr.map(arg);
            break;
        case 'string':
            that = arr.map(function (o) { return o[arg]; });
            break;
        default:
            that = arr;
            break;
    }
    return that;
}
if (!Array.prototype.min) {
    Array.prototype.min = function (field) {
        // tslint:disable-line: typedef
        return Math.min.apply(null, this.by(field));
    };
}
if (!Array.prototype.max) {
    Array.prototype.max = function (field) {
        // tslint:disable-line: typedef
        return Math.max.apply(null, this.by(field));
    };
}
if (!Array.prototype.sum) {
    Array.prototype.sum = function (field) {
        return this.by(field).reduce(function (prev, current) { return +current + prev; }, 0); // parseFloat
    };
}
if (!Array.prototype.average) {
    Array.prototype.average = function (field) {
        // tslint:disable-line: typedef
        var that = typeArg(field, this);
        var count = that.length;
        var total = that.reduce(function (prev, current) { return +current + prev; }, 0); // parseFloat
        return total / count;
    };
}
if (!Array.prototype.unique) {
    Array.prototype.unique = function (field) {
        var that = typeArg(field, this);
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
function flatten(list, depth, mapperFn, mapperCtx) {
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
if (!Array.prototype.flatten) {
    Array.prototype.flatten = function (depth) {
        if (depth === void 0) { depth = Infinity; }
        // tslint:disable-line: typedef
        return flatten(this, depth);
    };
}
if (!Array.prototype.flatMap) {
    Array.prototype.flatMap = function (fn, ctx) {
        // tslint:disable-line: typedef
        return flatten(this, 1, fn, ctx);
    };
}
if (!Array.prototype.by) {
    Array.prototype.by = function (field) {
        // tslint:disable-line: typedef
        return typeArg(field, this);
    };
}
if (!Array.prototype.take) {
    Array.prototype.take = function (numberOf) {
        // tslint:disable-line: typedef
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
    Array.prototype.includes = function (searchElement /*, fromIndex*/) {
        // tslint:disable-line: typedef
        'use strict';
        var O = Object(this);
        var len = parseInt(O.length, 10) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1], 10) || 0;
        var k;
        if (n >= 0) {
            k = n;
        }
        else {
            k = len + n;
            if (k < 0) {
                k = 0;
            }
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                // .. NaN !== NaN
                return true;
            }
            k++;
        }
        return false;
    };
}
if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        // tslint:disable-line: typedef
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
        // tslint:disable-line: typedef
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
        // tslint:disable-line: typedef
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
        // tslint:disable-line: typedef
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
