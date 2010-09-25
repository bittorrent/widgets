// check Input validation
//
// Arguments:
//
//    name: the name of the function whose input to validate.
//
//    args: the arguments of the function whose input to validate.
//
//    expectation: a string of ordered type expectations corresponding to the
//      tests set below or your own custom additions. The expectations should
//      be concatenated in UpperCammelCase. For example, to expect a string, an
//      integer, null, and a date, specify 'SINulD'.
//
//    argSpan: An optional indication of the expected argument count. This value
//      can either be an integer, in which case it represents the minimum number
//      of expected arguments, or an array, in which case it should contain two
//      integers [minimum, maximum]. Either way, if this value is specified then
//      the default behavior of checking the expected argument count against the
//      number of arguments defined in the function source is changed. If the
//      minimum alone is specified, it will be checked, and the test for maximum
//      will be implicitly skipped. This allows for functions that accept
//      variable arguments.length. If both the minimum and maximum are
//      specified, they will both be checked. Use this if the function whose
//      input you want to validate has any optional arguments, or if you access
//      its arguments via the arguments object.
//
//  Example usage:
//
//  var example = function(int, arr, obj) {
//    arguments.callee.check('example', arguments, 'IAO', [2, 3]);
//    return int + arr[0] || obj && obj[0] || 0;
//  }(0,[]);
//
(function() {

var createError = function(settings) {
  var e = _.clone(settings);
  e.prototype = new Error;
  return e;
};

Function.prototype.check = function(name, args, expectation, argSpan) {
  if ('✓' !== name) {
    arguments.callee.check('✓', arguments, 'SArgsSIa', [3, 4]);
  }

  var argNamesCsv = /(?:\(([\w,\s]*)\))/.exec(this.toString())[1];
  var argNames = argNamesCsv.split(/,\s*/);
  var expectations = expectation.match(/([A-Z][a-z]*)/g);
  var tests = arguments.callee.tests;

  if (_.isNull(expectations)) {
    throw Error(sprintf('check: Invalid expectation "%s".', expectation));
  }

  var checkSpan = function(expected, type) {
    var problem =
      'total' === type ? expected !== args.length :
      'minimum' === type ? expected > args.length :
      'maximum' === type ? expected < args.length : true;
    if (problem) {
      throw createError({
        name: 'ArgumentsLengthError',
        message: sprintf(
          'check: %s expects a %s of %d argument(s) (%s), but got %d: %s',
          name, type, expected, argNamesCsv, args.length,
          Array.prototype.join.call(args, ', '))
      });
    }
  };

  if ('number' === typeof argSpan) {
    checkSpan(argSpan, 'minimum');
  }
  else if ('object' === typeof argSpan) {
    if (2 !== argSpan.length) {
      throw createError({
        name: 'PropertyRequired',
        message: sprintf('check: argSpan must contain 2 values when it is ' +
        'specified as an array, but it contains %d (%s) for function "%s".',
        argSpan.length, argSpan.join(', '), name)
      });
    }
    checkSpan(argSpan[0], 'minimum');
    checkSpan(argSpan[1], 'maximum');
  }
  else {
    checkSpan(argNames.length, 'total');
  }

  var forEachPassthru = { forEachPassthru : undefined };
  if (Array.prototype.forEach) {
    for (i in args) {
      if ('undefined' === typeof args[i]) args[i] = forEachPassthru;
    }
  }
  _.each(args, function(value, key) {
    if ('function' !== typeof tests[expectations[key]]) {
      throw Error(sprintf('check: Can not test %s against unknown type "%s".',
        name, expectations[key]));
    }
    if (! tests[expectations[key]](value)) {
      var valueType = (forEachPassthru === value) ? 'undefined' : typeof value;
      var valueName = (forEachPassthru === value) ?
        '[undefined]' : 'undefined' === typeof value ? '[undefined]' : value;
      throw TypeError(
        sprintf('check: Input validation failed for function "%s" on ' +
        'argument "%s": %s test rejected %s type of argument: %s',
        name, argNames[key], expectations[key], valueType, valueName));
    }
  });

  return this;
};

Function.prototype.check.tests = (function() {
  var selfTestArgs = [];
  return {
    set : function(name, test) {
      if (! /^[A-Z][a-z]*$/.test(name) ) {
        var suggestion = name.replace(/^(.)(.*)/, function() {
          return arguments[1].toUpperCase() + arguments[2].toLowerCase();
        });
        throw Error(sprintf('check.tests.set: name ("%s") must be one ' +
          'majuscule (capital letter) followed by zero or more miniscules ' +
          '(lower-case letters). Use "%s".', name, suggestion));
      }
      selfTestArgs.push(arguments);
      this.testSelfTestArgs();
      this[name] = test;
      return this;
    },

    // Defer running of self tests until the tests for set's arguments
    // (string and function) have been defined.
    testSelfTestArgs : function() {
      if ('undefined' !== typeof Function.prototype.check.tests['S'] &&
          'undefined' !== typeof Function.prototype.check.tests['F']) {
        _.each(selfTestArgs, function(testArgs) {
          Function.prototype.check.tests.set.check(
            'check.tests.set', testArgs, 'SF');
        });
        selfTestArgs.splice();
      }
    }
  };
})();

// Underscore.js provides most of our tests. Here we define a few others.
var isInfinite = function(i) {
  return _.isNumber(i) && ! _.isNaN(i) && ! isFinite(i);
}
var isIntegral = function(i) {
  return _.isNumber(i) && 0 === i % 1;
}
var isObjective = function(o) {
  return 'object' === typeof o;
}
var isIntOrArray = function(ia) {
  return isIntegral(ia) || _.isArray(ia);
}
var isObjOrStr = function(os) {
  return isObjective(os) || _.isString(os);
}

// Set default type tests.
Function.prototype.check.tests.set('A',    _.isArray);      // A    : array
Function.prototype.check.tests.set('Args', _.isArguments);  // Args : Arguments
Function.prototype.check.tests.set('B',    _.isBoolean);    // B    : boolean
Function.prototype.check.tests.set('D',    _.isDate);       // D    : date
Function.prototype.check.tests.set('E',    _.isEmpty);      // E    : empty
Function.prototype.check.tests.set('Elem', _.isElement);    // Elem : element
Function.prototype.check.tests.set('F',    _.isFunction);   // F    : Function
Function.prototype.check.tests.set('I',      isIntegral);   // I    : Integer
Function.prototype.check.tests.set('Inf',    isInfinite);   // Inf  : Infinity
Function.prototype.check.tests.set('Ia',     isIntOrArray); // Ia   : Int||Array
Function.prototype.check.tests.set('N',    _.isNumber);     // N    : Number
Function.prototype.check.tests.set('Nan',  _.isNaN);        // Nan  : NaN
Function.prototype.check.tests.set('Nul',  _.isNull);       // Nul  : Null
Function.prototype.check.tests.set('O',      isObjective);  // O    : Object
Function.prototype.check.tests.set('Os',     isObjOrStr);   // Os   : Obj||Str
Function.prototype.check.tests.set('R',    _.isRegExp);     // R    : RegExp
Function.prototype.check.tests.set('S',    _.isString);     // S    : String
Function.prototype.check.tests.set('U',    _.isUndefined);  // U    : Undefined

}());
