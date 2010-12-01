bt.Widget.Share = (function(){
    var shareURIs = {
        "email": {"base": "mailto:", 
                  "formatURL": function (opts) {
                    return this.base+formatStandard(opts, "?body="+opts.text, "&subject=")
                  }},
        "facebook": {"base": "http://www.facebook.com/sharer.php", 
                     "formatURL":function(opts){
                       return this.base+formatStandard(opts, "?u=", "&t=")
                     }},
        "twitter": {"base": "http://twitter.com/share", 
                    "formatURL":function(opts){
                        return this.base + "?url=" + encodeURI(opts.url) + 
                        (opts.via!="" && "&via=" + encodeURIComponent(opts.via)) +
                        "&text=" + encodeURIComponent(opts.text || opts.title)
                    }},
        "delicious": {"base": "http://delicious.com/post",
                      "formatURL": function(opts){
                      return this.base+formatStandard(opts, "", "")}},
        "digg": {"base": "http://digg.com/submit", 
                 "formatURL": function(opts){
                      return this.base+formatStandard(opts, "", "")}},
        "reddit": {"base": "http://reddit.com/submit", 
                   "formatURL": function(opts){
                      return this.base+formatStandard(opts, "", "")}}
    };
    function formatStandard(opts, url, title){
        url = typeof(url) != 'undefined' ? url : "";
        title = typeof(title) != 'undefined' ? title : "";
        return (url||"?url=") + encodeURI(opts.url) + 
               (title||"&title=") + encodeURIComponent(opts.title)
    }
    var createError = function(settings) {
      var e = _.clone(settings);
      e.prototype = new Error;
      return e;
    };
    
    var createDefaults = function(){
        meta = JSON.parse(bt.resource("package.json"));
        return {
            url: meta["bt:update_url"],
            title: meta["description"],
            text: "",
            via: "",
            types: _.keys(shareURIs),
            elem: undefined
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
      
      if (!this.settings.elem) {
        this.settings.elem = $('<div/>').appendTo('body')[0];
      }
      var self = this;
      console.log(this.settings.elem.length);
      if(this.settings.elem.length > 1){
        $(this.settings.elem).each( function(index, element){
            type = self.settings.types[index];
            console.log(type, self.settings.types, shareURIs[type]);
            $(element).attr("href", shareURIs[type].formatURL(self.settings));
            $(element).click(function(e){
                e.preventDefault();
                location.href = $(this).attr("href");
            });
        });
      } else {
        _.each(this.settings.types, function(type){
            link = $("<a href='"+shareURIs[type].formatURL(self.settings)+"'> </a>")
                   .addClass("share-widget").addClass(type);
            $(self.settings.elem).append(link);
        });
      }
    }
    
    Result.prototype = new bt.Widget('Share');
    return Result;
})();