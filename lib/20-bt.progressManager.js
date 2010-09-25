bt.progressManager = (function() {
  var bars = {};

  var createError = function(settings) {
    var e = _.clone(settings);
    e.prototype = new Error;
    return e;
  };

  return {

    createBar: function(settings, callback) {
      arguments.callee.check('createBar', arguments, 'OF', [1,2]);
      if (_.isElement(settings.elem[0])) { settings.elem = settings.elem[0]; }
      (function(id, elem) {
        arguments.callee.check('createBar settings test', arguments, 'SElem');
      })(settings.id, settings.elem);

      if (! bt.torrent.get(settings.id)) {
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
      bars[id].progressbar({
        value: bt.torrent.get(id).properties.get("progress") / 10
      });
    },

    // keepBarUpdated takes argument of torrent identifier (hash or URL).
    keepBarUpdated: function(id) {
      arguments.callee.check('keepBarUpdated', arguments, 'S');
      bt.progressManager.updateBar(id);
      if (1000 > bt.torrent.get(id).properties.get("progress")) {
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
