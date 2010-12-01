bt.Widget.Subscribe = (function() {
  var defaults = {
    url   : 'http://example.com/example.rss',
    text  : 'Subscribe',
    elem  : undefined
  };

  var Result = function(settings) {
    arguments.callee.check('bt.Widget.Subscribe', arguments, 'Os');
    if ('string' === typeof settings) settings = { url : settings };
    settings = _.extend(defaults, settings);

    // Create a default target element node if none has been provided.
    if (! settings.elem) { settings.elem = $('<div/>').appendTo('body')[0]; }

    $('<a/>')
      .addClass('bt-widget bt-subscribe-widget')
      .attr('href', settings.url)
      .text(settings.text)
      .appendTo(settings.elem)
      .click(function() {
        bt.rss_feed.add(this.href);
        return false;
      });

    return settings.elem;
  };

  Result.prototype = new bt.Widget('Subscribe');
  return Result;
})();
