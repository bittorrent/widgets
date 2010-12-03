BitTorrent SDK Widgets Package
==============================

The Bittorrent Widgets package is a collection of widgets that integrate with
the [Apps for BitTorrent SDK][sdk], and simplify common behaviors.

Download Widgets
----------------

Download Widgets provide a quick and easy way to provide a UI that follows
a common workflow:

0. Present a button or link to download a torrent.
0. When it is clicked, add the torrent for downloading.
0. Display a progress-bar that indicates the extent of completion.
0. When the download is complete, display a play button or link.
0. When it is clicked, launch the largest file for playback.
0. Display a replay button or link.

You can get this workflow out-of-the-box with:

    new bt.Widget.Download({
      url : 'http://example.com/example.torrent'
    });

Here's an example including other recognized settings you can define:

    new bt.Widget.Download({
      name      : 'Example',
      url       : 'http://example.com/example.torrent',
      elem      : $('#dlw'),
      buttons   : {
        download    : ['Get %s',  'Loading\u2026'],
        play        : ['Play %s', 'Replay %s']
      }
    });

See the [Media Downloader Tutorial][mdt] for an introduction to these settings.

### Download Multiple Torrents in a Single Click ###

If you have multiple download widgets appearing in your app, you may want to
create one more to download everything in a single click, or to download
a subset of them. You can create one that will download everything by specifying
"*" for the url. To download only a subset, provide an array of URLs for the url
value. Either way, clicking the button will trigger all other corresponding
download widgets in your app. The progress bar will display an average of all
related downloads.

### Download Widget Callbacks ###

Widgets provide event-based callbacks. With Download Widgets, You can add
override the default callbacks, and you can also add new callbacks of your own.

To override the default callbacks, change one of the functions defined in
`Widget.Download.settings.callbacks`. Preset callbacks are 'addTorrent',
'progressBar', and 'openFile'. Note that overriding the defaults will require
you to dispatch any callbacks that they trigger if you want them to run. Consult
the code you are overriding.

To add new callbacks without changing the defaults, use
`Widget.Download.addCallback(category, handler)` or
`Widget.Download.settings.callbacks.add(category, handler)`, where `category`
has one of three known values: 'addTorrent', 'progressBar', and 'openFile'.

Every callback can be given two optional properties that will be applied to
their callback if specified: `persona` and `arguments`. "Persona" refers to what
the callback function knows as `this`. The default persona for preset callbacks
is the settings object. The arguments property should be an array.

Additionally, you can create any callback with any arbitrary category and fire
them yourself using: `Widget.Download.addCallback` or
`Widget.Download.settings.callbacks.add`, and
`Widget.Download.dispatchCallbacks(category)` or
`Widget.Download.settings.callbacks.dispatch(category)`. The secondary methods
of invocation are provided for context within another callback, where the
`Widget.Download` instance is unavailable, but its settings are available.

Callbacks get default context of the settings object. You can override this by
giving the callback function a persona property. An args property can be used to
specify an array of bound arguments.

Lastly, the `remove` method is provided in order to remove callbacks once
they've been defined.

[sdk]: http://btapps-sdk.bittorrent.com/
[mdt]: http://btapps-sdk.bittorrent.com/doc/tutorials/media_downloader.html
