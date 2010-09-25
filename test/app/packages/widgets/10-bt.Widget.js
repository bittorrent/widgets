bt = bt || {};

bt.Widget = (function() {
  var widgets = {}, eventHandlers = {}, dispatchEvent, currentHandler;

  // Set up event-based callbacks.
  var createEventDispatcher = function(name) {
    var eventName = name + '_Events';
    if (document.addEventListener) {
      document.addEventListener(eventName, function() {
        currentHandler.apply(
          currentHandler.context || currentHandler,
          currentHandler.args);
      }, false);
      dispatchEvent = function() {

        // Workaround for Firefox Bug 574941 -- should work in all UAs:
        var NativeError = Error;
        Error = function(settings) {
          arguments.callee['✓']('Error', arguments, 'Os', 0);
          var e = (this instanceof Error) ? this : new Error(arguments);
          if ('string' === typeof settings) e.message = settings;
          else if ('object' === typeof settings) _.extend(e, settings);
          e.toString = e.toString || function() {
            return settings.name + ': ' + settings.message;
          };
          throw(e);
          return;
        }
        Error.prototype = NativeError();

        var widgetEvent = document.createEvent("UIEvents");
        widgetEvent.initEvent(eventName, false, false);
        document.dispatchEvent(widgetEvent);
      };
    }
    else { // MSIE
      document.documentElement[eventName] = 0;
      document.documentElement.attachEvent("onpropertychange", function(event) {
        if (eventName === event.propertyName) {
          currentHandler.apply(
            currentHandler.context || currentHandler,
            currentHandler.args || []);
        }
      });
      dispatchEvent = function(handler) {
        document.documentElement[eventName]++;
      };
    }
    return dispatchEvent;
  };

  var createError = function(settings) {
    var e = _.clone(settings);
    e.prototype = new Error;
    return e;
  };

  return function(widgetName) {
    arguments.callee['✓']('Widget', arguments, 'S');

    widgetName = widgetName.replace(/\W/g, '_');

    // Check for error conditions.
    if(!(this instanceof bt.Widget)) {
      throw new createError({
        name: 'InvocationError',
        message: 'Widget constructor must create a new instance.'
      });
    }
    if (undefined !== widgets[widgetName]) {
      throw new createError({
        name: 'IdentityTheftError',
        message: sprintf('A Widget named "%s" already exists.', widgetName)
      });
    }

    widgets[widgetName] = this;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // this.addCallback()
    this.addCallback = function(category, handler) {
      arguments.callee['✓']('addCallback', arguments, 'SF');
      var name = widgetName + ':' + category;
      eventHandlers[name] = eventHandlers[name] || [];
      eventHandlers[name].push(handler);
    };

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // this.dispatchCallbacks()
    this.dispatchCallbacks = function(category) {
      arguments.callee['✓']('dispatchCallbacks', arguments, 'S');
      var name = widgetName + ':' + category;
      for (var i = 0; i < eventHandlers[name].length; i++) {
        currentHandler = eventHandlers[name][i];
        dispatchEvent();
      }
    };
    var dispatchEvent = createEventDispatcher(widgetName);

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // this.removeCallbacks()
    this.removeCallbacks = function(category) {
      arguments.callee['✓']('removeCallbacks', arguments, 'S');
      eventHandlers[widgetName + ':' + category] = [];
    };

    return this;
  }
})();
