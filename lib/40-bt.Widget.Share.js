bt.Widget.Share = (function() {

  var shareUris = (function() {
    var ShareUri = function(override) {
      var settings = {
        base : 'http://example.com/',
        formatUrl : function(opts) {
          return this.base + formatStandard(opts);
        }
      };
      return $.extend(settings, override);
    };

    return {
      generic : new ShareUri({
        formatUrl : function(opts) {
          return opts.url;
        }
      }),
      email : new ShareUri({
        base : 'mailto:',
        formatUrl : function(opts) {
          return this.base + formatStandard({
            body    : opts.text,
            subject : opts.name
          });
        }
      }),
      facebook : new ShareUri({
        base : 'http://www.facebook.com/sharer.php',
        formatUrl : function(opts) {
          return this.base + formatStandard({
            u : opts.url,
            t : opts.name
          });
        }
      }),
      twitter : new ShareUri({
        base      : 'http://twitter.com/share',
        formatUrl : function(opts) {
          return this.base + formatStandard({
            url   : opts.url,
            via   : opts.via,
            text  : opts.text || opts.name
          });
        }
      }),
      delicious : new ShareUri({ base : 'http://delicious.com/post' }),
      digg      : new ShareUri({ base : 'http://digg.com/submit'    }),
      reddit    : new ShareUri({ base : 'http://reddit.com/submit'  })
    };
  })();

  var formatStandard = function(settings) {
    var result = '';
    _.each(settings, function(v, k) {
      if (v) {
        result += (result ? '&' : '?') +
          sprintf('%s=%s', k, encodeURIComponent(decodeURIComponent(v)));
      }
    });
    return result;
  }

  var createError = function(settings) {
    var e = _.clone(settings);
    e.prototype = new Error;
    return e;
  };

  var createDefaults = function() {
    var undefined;
    var meta = JSON.parse(bt.resource('package.json'));
    return {
      url   : meta['bt:update_url'],
      title : meta['description'],
      text  : '',
      via   : '',
      elem  : undefined
    }
  }

  var init = function(settings){
      var that = this;

      // Check for error conditions.
      if(!(this instanceof bt.Widget.Share)) {
        throw new createError({
          name: 'InvocationError',
          message: 'Widget.Share constructor must create a new instance.'
        });
      }
      // Allow abreviated settings style as URL string instead of an object.
      if ('string' === typeof settings ) settings = { url: settings };

      // Deep-clone defaults and deep-extend user settings into this.settings.
      this.settings = $.extend({}, createDefaults.call(this), settings);
      return settings;
  }

  var Result = function(settings) {
    arguments.callee.check('bt.Widget.Share', arguments, 'Os');
    settings = init.call(this, settings);

    if (! this.settings.elem) {
      this.settings.elem = $('<div/>').appendTo('body')[0];
    }
    var self = this;

    if(this.settings.elem.length > 1){
      $(this.settings.elem).each( function(index, element){
          type = self.settings.types[index];
          $(element).attr("href", shareUris[type].formatUrl(self.settings));
          $(element).click(function(e){
              e.preventDefault();
              location.href = $(this).attr("href");
          });
      });
    }

    else {
      if (0 === (this.settings.items || []).length) {
        this.settings.items = _.map(_.keys(shareUris), function(key) {
          return {
            type  : key,
            name  : '',
            text  : '',
            url   : ''
          };
        });
      }
      _.each(this.settings.items, function(item) {
        $('<a/>')
          .attr('href', shareUris[item.type].formatUrl(item))
          .addClass('bt-share-widget')
          .addClass(item.type)
          .addClass(item.name)
          .html(item.text || '&nbsp;')
          .appendTo(self.settings.elem);
      });
    }
  }

  Result.prototype = new bt.Widget('Share');
  return Result;
})();
