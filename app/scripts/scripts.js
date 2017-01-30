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

    initColorify: function() {
        colorify({
          container: 'colorify-main-color',
          accuracy: 10,
          give: {
            property: 'background-color',
            target: '.story'
          }
        });
    },

    initContrast: function() {
      var currentBackground = jQuery('.story').css("background-color");
      var currentBackground  = rgb2hex(currentBackground);
      var newColor = getContrastYIQ(currentBackground);
      jQuery('.story').css("color",newColor);
    }

}

jQuery(document).ready(function() {
    //Utlitities
    cyoa.initExternalLinks();
    cyoa.initSmoothScroll();
    cyoa.initColorify();
 });

jQuery(window).load(function(){
    cyoa.initContrast();
});
