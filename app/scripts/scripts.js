//foundation init
$(document).foundation();

//Color contrast analyser from http://dco1.tumblr.com/post/2501743028/24-ways-calculating-color-contrast
function getContrastYIQ(hexcolor){
  var r = parseInt(hexcolor.substr(0,2),16);
  var g = parseInt(hexcolor.substr(2,2),16);
  var b = parseInt(hexcolor.substr(4,2),16);
  var yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 131.5) ? 'rgba(0,0,0,.8)' : 'white';
   }

function rgb2hex(rgb) {
   rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return  hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}


(function(jQuery) {
    jQuery.fn.upUpDownDown = function(o){
        var options = jQuery.extend({
                                        watchFor : [38,38,40,40,37,39,37,39,66,65],
                                        callback : function() { }
                                    }, o);

        var key_accum = [];
        var match = options.watchFor;

        jQuery(document).keyup(function(e){
            len = key_accum.push(e.keyCode ? e.keyCode : e.charCode);

            if(len > match.length) key_accum.shift();

            if (key_accum.join('-') == match.join('-'))
            {
                key_accum = [];
                if (options.callback)
                {
                    options.callback(jQuery(this));
                }
            }
        });
    }
})(jQuery);


var cyoa = {
  initExternalLinks: function() {
        jQuery('a[rel*=external]').click( function() {
            window.open(this.href);
            return false;
        });
    },
    initSmoothScroll: function() {
        jQuery('.scroll[href*=\\#]:not([href=\\#])').click(function() {
            if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
              var target = $(this.hash);
              target = target.length ? target : jQuery('[name=' + this.hash.slice(1) +']');
              if (target.length) {
                jQuery('html,body').animate({
                  scrollTop: target.offset().top
                }, 1000);
                return false;
              }
            }
          });
    },
    initContrast: function() {
            jQuery(".has-backgroundcolour").each(function(){
             var currentBackground = jQuery(this).css("background-color");
             var currentBackground  = rgb2hex(currentBackground);
             var newColor = getContrastYIQ(currentBackground);
             jQuery(this).css("color",newColor);
            });
    },
    initKonami: function() {
        jQuery('body').upUpDownDown({
            watchFor: [38,38,40,40,37,39,37,39,66,65],
            callback: function(){
                    jQuery('body').append('<img src="/imgs/cat.png" alt="" style="position:fixed; bottom:-1275px; left:0; " class="kcode" />');
                    jQuery('.kcode').stop()
                        .animate({ bottom : -20 ,left : 0 },200)
                        .animate({ bottom : -40 ,left : 50 },200)
                        .animate({ bottom : -20 ,left :  100 },200)
                        .animate({ bottom : -40 ,left :  150 },200)
                        .animate({ bottom : -20 ,left :  200 },200)
                        .animate({ bottom : -40 ,left :  250 },200)
                        .animate({ bottom : -20 ,left :  300 },200)
                        .animate({ bottom : -40 ,left : 350 },200)
                        .animate({ bottom : -20 ,left :  400 },200)
                        .animate({ bottom : -40 ,left : 450 },200)
                        .animate({ bottom : -20 ,left :  500 },200)
                        .animate({ bottom : -40 ,left : 550 },200)
                        .animate({ bottom : -20 ,left :  600 },200)
                        .animate({ bottom : -40 ,left : 650 },200)
                        .animate({ bottom : -20 ,left :  700 },200)
                        .animate({ bottom : -40 ,left : 750 },200)
                        .animate({ bottom : -20 ,left :  800 },200)
                        .animate({ bottom : -40 ,left : 850 },200)
                        .animate({ bottom : -20 ,left :  900 },200)
                        .animate({  bottom : -1275 ,left : 900},600,
                          function(){
                                jQuery(this).remove();
                              });
            }
        });
    }
}

jQuery(document).ready(function() {
    //Utlitities
    cyoa.initExternalLinks();
    cyoa.initSmoothScroll();
    cyoa.initContrast();

    //The magic
    cyoa.initKonami();

 });
