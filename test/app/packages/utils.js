bt.testUtils = {
  //----------------------------------------------------------------------------
  // bt.testUtils.moduleLifecycle
  //
  //    Provide this object as the second parameter for QUnit module() in order
  //    to make use of the testUtils within the module. This will create an
  //    instance of the utils (see factory below) made available as a property
  //    of the module called utils.
  //
  //    Note that teardown() takes care of each test's expect(). This is so
  //    event cascades can pile on any arbitrary number of assertions, without
  //    any need to manually keep track of the assertion count. You must
  //    use assertionCounter.increment() for each assertion so this will work.
  //
  moduleLifecycle: {
    setup: function() {
      this.utils = bt.testUtils.factory.create();
    },
    teardown: function() {
      expect(this.utils.assertionCounter.reset());
    }
  },

  //----------------------------------------------------------------------------
  // bt.testUtils.factory
  //
  //    Asynchronous and delayed functions can cause multiple tests to run
  //    simultaneously. Each test needs its own instance of testUtils so that
  //    its assertions can be counted in isolation from other concurrent tests.
  //    This factory accomodates. It should not be necessary to create any new
  //    instances above and beyond the one created for each test by the
  //    moduleLifecycle setup function (above).
  //
  //    Note that the testUtils must be instantiated prior to use of any of its
  //    methods.
  //
  factory: (function() {
    var instances = [];
    var applicant = function(instance, property) {
      return function() {
        bt.testUtils[property].apply(instance, arguments);
      }
    }
    return {
      create: function() {
        var F = function() {};
        F.prototype = bt.testUtils;
        var instance = new F;
        for (property in bt.testUtils) {
          if ('function' === typeof bt.testUtils[property]) {
            instance[property] = applicant(instance, property);
          }
        }
        instances.push(instance);
        instance.id = instances.length;
        return instance;
      },
      retrieve: function(id) {
        return instances[id];
      }
    };
  })(),

  //----------------------------------------------------------------------------
  // bt.testUtils.sampleResources
  //    Provides URLs for sample resources used in various unit tests.
  //
  sampleResources: (function() {
    var vodoTorrent = function(title) {
      return sprintf('http://vodo.net/media/torrents/%s-VODO.torrent', title);
    }
    var clearBitsTorrent = function(title) {
      return sprintf('http://clearbits.net/get/%s.torrent', title);
    }
    return {
      torrents: [
        vodoTorrent('The.Yes.Men.Fix.The.World.P2P.Edition.2010.Xvid'),
        vodoTorrent('Pioneer.One.S01E01.720p.x264'),
        vodoTorrent('Everything.Unspoken.2004.Xvid'),
        vodoTorrent('Smalltown.Boy.2007.Xvid'),
        vodoTorrent('Warring.Factions.2010.Xvid'),
        clearBitsTorrent('346-film-makers-guideline-to-fair-use') // Only 429k
      ],
      rssFeeds: [
        'http://vodo.net/feeds/public',
        'http://clearbits.net/rss.xml'
      ]
    }
  })(),

  //----------------------------------------------------------------------------
  // bt.testUtils.assertionCounter
  //    Track count of expected assertions.
  //
  // Methods:
  //
  //    increment()
  //      Increment the count of expected assertions.
  //      Parameter:
  //        amount (Number): Amount to increment (optional; default is 1).
  //
  //    reset()
  //      Reset the count of expected assertions to 0.
  //      Returns:
  //        Number assertion total count prior to reset (for expect()).
  //
  assertionCounter: (function() {
    var count = 0;
    return {
      increment: function(amount) {
        count += 'number' === typeof amount ? amount : 1;
      },
      reset: function() {
        var total = count;
        count = 0;
        return total;
      }
    };
  })(),

  //----------------------------------------------------------------------------
  // testPropertiesSet()
  //    Test an object's set() method for each of its properties.
  //
  // settings (Object): An object with the following properties:
  //
  //    Required property:
  //
  //      testObject (Object): An object to set-test that is asserted to have
  //        all(), get(), and set() methods.
  //
  //    Optional properties:
  //
  //      blacklist (Array): A list of properties to avoid set-testing. These
  //        are typically cases that will do very bad things, like crash the
  //        client or destroy the unit test.
  //
  //      readOnly (Array): A list of known read-only properties that are
  //        asserted to be non-settable.
  //
  testPropertiesSet: function(settings) {
    var testValue,
      messages = {
        set:   undefined,
        reset: undefined
      },
      defaults = {
        testObject: {
          all: function() { return {};   },
          get: function() { return null; },
          set: function() {}
        },
        blacklist: [],
        readOnly:  []
      },
      that = this;

    // Set defaults where settings are unspecified.
    settings = settings || defaults;
    settings.blacklist = settings.blacklist || [];
    settings.readOnly  = settings.readOnly  || [];

    // Ensure that settings.testObject has the expected methods.
    _.each(['all', 'get', 'set'], function(method, index) {
      var fn;
      try { fn = settings.testObject[method]; } catch(e) { fn = {}; }
      that.testFunction({
        fn:   fn,
        name: method,
        argc: index
      });
    });

    // Set testvalue and assert messages according to datatype.
    var testDatum = {
      'boolean': function(key, value) {
        testValue = !value;
        messages.set =
          sprintf('set() can set %s to %s.', key, (testValue).toString());
        messages.reset =
          sprintf('set() can set %s back to %s.', key, (value).toString());
      },

      'number': function(key, value) {
        testValue = 1 === value ? 0 : 1;
        messages.set = sprintf('set() can set %s to %d.', key, testValue);
        messages.reset = sprintf('set() can set %s back to %f.', key, value);
      },

      'string': function(key, value) {
        testValue = "x";
        messages.set = sprintf('set() can set %s to "%s".', key, testValue);
        messages.reset = sprintf('set() can set %s back to "%s".', key, value);
      }
    };

    // Check whether a value has been blacklisted
    var isBlacklisted = function(value) {
      return -1 < _.indexOf(settings.blacklist, value);
    }

    // Check whether a value has been specified as read-only
    var isReadOnly = function(value) {
      return -1 < _.indexOf(settings.readOnly, value);
    }

    _.each(settings.testObject.all(), function(value, key) {

      equals(settings.testObject.get(key), value, sprintf('get() correctly ' +
        'matches value provided by all() for %s', key));

      ok(-1 !== _.indexOf(_.keys(testDatum), typeof(value)),
        sprintf('setting %s is an expected datatype.', key))

      that.assertionCounter.increment(2);

      if (! isBlacklisted(key)) {

        testDatum[typeof value](key, value);
        _.each(messages, function(message, index) {
          messages[index] = 'testPropertiesSet: ' + message;
        });

        if (! isReadOnly(key)) {

          // Set testValue.
          try {
            settings.testObject.set(key, testValue);
            equals(settings.testObject.get(key), testValue, messages.set);
          }
          catch(error) {
            ok(false, sprintf('%s %s', messages.set, error.message));
          }

          // Reset value.
          try {
            settings.testObject.set(key, value);
            equals(settings.testObject.get(key), value, messages.reset);
          }
          catch(error) {
            ok(false, sprintf('%s %s', messages.reset, error.message));
          }

          that.assertionCounter.increment(2);

        } else {

          try {
            settings.testObject.set(key, testValue);
            if (settings.testObject.get(key) === testValue)
              ok(false, sprintf('Successfully set read-only property %s', key));
          }
          catch(error) {
            ok(true, sprintf('Could not set read-only property %s: %s', key,
              error.message));
          }

          that.assertionCounter.increment();
        }
      }
    });
  },

  //----------------------------------------------------------------------------
  // testFunction()
  //    Generic test for any function or method.
  //    You can use this function in one of two ways.
  //
  // Usage 0.
  // Parameter (Object): an object with the following properties:
  //
  //    Required property:
  //
  //      fn (Function): Object asserted to be a function.
  //
  //    Optional properties:
  //
  //      name (String): The specified function's name. If not specified, this
  //        defaults to the function's name if available or else its toString()
  //        value. IE does not provide a name property for functions.
  //
  //      argc (Number): The expected argument count for the specified
  //        function. Defaults to 0.
  //
  // Usage 1.
  // Parameter: array of settings objects as described in Usage 0.
  //
  testFunction: function() {
    var that = this;
    if (_.isArray(arguments[0])) {
      _.each(arguments[0], function(settings) {
        that.testFunction(settings);
      });
      return;
    }
    var argument = arguments[0] || {},
      fn = argument.fn,
      name = argument.name || fn.name || fn.toString(),
      argc = argument.argc || 0,
      isFunction = "function" === typeof fn,
      arg = 1 === argc ? "argument" : "arguments";
    ok(isFunction, sprintf('testFunction: %s() is a function.', name));
    if (isFunction) {
      equals(argc, fn.length,
        sprintf('testFunction: %s() expects %d %s.', name, argc, arg));
    }
    else {
      ok(false,
        sprintf('testFunction: Can test argc on nonfunction %s.', name));
    }
    this.assertionCounter.increment(2);
  },

  //----------------------------------------------------------------------------
  // testKeysAgainstAllKeys()
  //    Take an object that has both all() and keys() methods, and check the
  //    values returned by keys() against those used in all().
  //
  // Parameter:
  //    object (Object): Object asserted to have corresponding all() and keys()
  //      methods.
  //
  testKeysAgainstAllKeys: function(object) {
    var that = this;
    _.each(['all', 'keys'], function(method) {
      that.testFunction({
        fn: object[method],
        name: method,
        argc: 0
      });
    });
    same(_.keys(object.all()), object.keys(),
      'testKeysAgainstAllKeys: keys() matches keys in all()');
    this.assertionCounter.increment();
  },

  //----------------------------------------------------------------------------
  // testProperties()
  //    Generic test for any set of properties
  //    You can use this function in one of two ways.
  //
  // Usage 0.
  // Parameter: settings (Object): an object with the following properties:
  //
  //    object (Object): An object asserted to have the specified properties.
  //    properties (Array): A list of properties to test.
  //    name (String): Name of the object to report.
  //
  // Usage 1.
  // Parameter: array of settings objects as described in Usage 0.
  //
  testProperties: function(settings) {
    var that = this;
    if (_.isArray(settings)) {
      _.each(settings, function(settings) {
        that.testProperties(settings);
      });
      return;
    }
    var settings   = settings            || {};
    var object     = settings.object     || {};
    var properties = settings.properties || [];
    var name       = settings.name       || object.name;
    _.each(properties, function(property) {
      ok('undefined' !== typeof object[property],
        sprintf('testProperties: %s has property "%s"', name, property));
    });
    this.assertionCounter.increment(properties.length);
  },

  //----------------------------------------------------------------------------
  // testExpectedExceptions
  //    Test a set of expected exceptions, expecting each assertion to fail
  //    predictably. You can use this function in one of two ways.
  //
  // Usage 0.
  // Parameter: settings (Object): An object with the following properties:
  //
  //    Required properties:
  //
  //      fn (Function): Object asserted to be a function.
  //      exception (String): The name value of the expected Error object.
  //      failure (String): A string describing the expectation in English.
  //
  //    Optional properties:
  //
  //      args (Array): Array to be applied to fn.
  //      setup (Function): Function to initialize the desired state.
  //      teardown (Function): Function to restore the initial state.
  //
  // Usage 1.
  // Parameter: array of settings objects as described in Usage 0.
  //
  testExpectedExceptions: function(settings) {
    var that = this;
    if (_.isArray(settings)) {
      _.each(settings, function(settings) {
        that.testExpectedExceptions(settings);
      });
      return;
    }
    if ('function' === typeof settings.setup) settings.setup();
    try {
      settings.fn.apply(settings.fn, settings.args || []);
      ok(false, settings.failure);
    }
    catch(error) {
      var errorName = 'string' === typeof error ?
        error : error.name || '[Unnamed error]';
      same(errorName, settings.exception,
        sprintf('Expected exception "%s" thrown. Thrown error message: %s',
        settings.exception, error.message || '[No error message]'));
    }
    finally {
      if ('function' === typeof settings.teardown) settings.teardown();
    }
    this.assertionCounter.increment();
  },

  //----------------------------------------------------------------------------
  // setupStop
  //
  //    Set a timeout for all stop()s. Although the QUint docs recommend against
  //    using a stop() timeout, they are misguided; if start() is never executed
  //    then expect() is never checked. The important factor is to ensure
  //    expect() gets an accurate assertion count, which is assured by using
  //    assertionCounter. My only concern is that 30 seconds may be too short.
  //    We should increase it to, say, 5 minutes once the unit tests are
  //    automated.
  //
  //    This method can not be called; it runs once and becomes undefined.
  //
  setupStop: (function() {
    window.stop = function(timeout) {
      timeout = timeout || 30000;
      QUnit.stop(timeout);
    }
  })()
};
