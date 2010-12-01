bt.progressManager = (function() {
  var bars = {};

  var createError = function(settings) {
    var e = _.clone(settings);
    e.prototype = new Error;
    return e;
  };

  var getProgress = function(id) {
    var result;
    if ('*' === id) { // Download All
      var ratio = [0, 0];
      _.each(bt.torrent.all(), function(tor) {
        ratio[0] += tor.properties.get('progress') / 10;
        ratio[1]++;
      });
      result = ratio[1] ? ratio[0] / ratio[1] : 0;
    }
    else if (_.isArray(id)) { // Download Multiple
      var ratio = [0, 0];
      _.each(id, function(url) {
        var tor = bt.torrent.get(url).properties.get("progress") / 10;
        ratio[0] += tor.properties.get('progress') / 10;
        ratio[1]++;
      });
      result = ratio[1] ? ratio[0] / ratio[1] : 0;
    }
    else {
      result = bt.torrent.get(id).properties.get("progress") / 10;
    }
    return result;
  };

  return {

    createBar: function(settings, callback) {
      arguments.callee.check('createBar', arguments, 'OF', [1,2]);
      if (_.isElement(settings.elem[0])) { settings.elem = settings.elem[0]; }
      (function(id, elem) {
        arguments.callee.check('createBar settings test', arguments, 'SElem');
      })(settings.id, settings.elem);

      if ('*' !== settings.id &&
      ! _.isArray(settings.id) &&
      ! bt.torrent.get(settings.id)) {
        throw new createError({
          name: 'TorrentDoesNotExist',
          message: sprintf('Torrent "%s" does not exist.', settings.id)
        });
      }
      if ('object' !== typeof jQuery.ui ||
        'function' !== typeof jQuery.ui.progressbar) {
          throw new createError({
            name: 'DependencyRequired',
            message: 'Unsatisfied dependency: jQuery UI including ' +
              'progressbar module. Run `apps add --file` with the file URL ' +
              'specified.'
          });
        }

        var bar = bars[settings.id];
        if (!$(bar).hasClass('ui-progressbar') ||
          $(bar).get(0) !== $(settings.elem).get(0)) {
            bar = bars[settings.id] = $(settings.elem).progressbar();
            bar.callback = callback;
            setTimeout(function() {
              bt.progressManager.keepBarUpdated(settings.id);
            }, this.updateFreq);
        }
      return bar;
    },

    // updateBar takes argument of torrent identifier (hash or URL).
    updateBar: function(id) {
      arguments.callee.check('updateBar', arguments, 'S');
      var progress = getProgress(id);
      bars[id].progressbar({ value : progress });
      return progress;
    },

    // keepBarUpdated takes argument of torrent identifier (hash or URL).
    keepBarUpdated: function(id) {
      arguments.callee.check('keepBarUpdated', arguments, 'S');
      if (100 > bt.progressManager.updateBar(id)) {
        setTimeout(function() {
          bt.progressManager.keepBarUpdated(id);
        }, this.updateFreq);
      }
      else {
        if ('function' === typeof bars[id].callback) {
          bars[id].callback.apply(bars[id].callback.persona || bars[id]);
        }
      }
    },

    updateFreq: 250
  };
})();
