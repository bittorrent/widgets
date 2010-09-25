$(document).ready(function() {
  if ('undefined' === typeof window.QUnit) { // This is a sandbox.

    //--------------------------------------------------------------------------
    // Download Widget

    var url =
      'http://vodo.net/media/torrents/Warring.Factions.2010.Xvid-VODO.torrent';

    var settings = {
      name      : 'Example',
      url       : url,
      callbacks : {
        openFile: function() {
          console.log( 'openFile callback:', this );
        }
      }
    };
    //settings.callbacks.openFile.context = {};
    var dw = new bt.Widget.Download(settings);

    _.each({
      5000: 400,
      5500: 999,
      5700: 1000
    }, function(v, k) {
      setTimeout(function() {
        if (bt.torrent.get(url)) {
          if (btapp === stub) {
            bt.torrent.get(url).properties.set("progress", v);
          }
        }
        else {
          throw Error('Timeout');
        }
      }, k);
    });

  }
});
