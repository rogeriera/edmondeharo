/**
 * resizeMedia
 * Jon-Kyle Mohr
 */

(function($) {

  $.fn.resizeMedia = function(options) {

    var self = {

      options: $.extend({
        restrictSize : false,
      }, options),

      format : function($this) {

        // IMG attributes
        var classes = $this.attr('classes');
        var height  = $this.height();
        var width   = $this.width();

        // Reset and warp
        $this
          .css({
            'height' : '',
            'width'  : ''
          })
          .attr('height', '')
          .attr('width', '')
          // .attr('class', '')
          .addClass('resized')
          .wrap('<div/>');

        // Set the resize based on aspect ratio
        $this.parent()
          // .attr('class', classes)
          .addClass('resizer')
          .css({
            "padding-bottom" : ( 100 * height / width ) + "%"
          });

        // Prevent scaling beyond 100%
        if ( self.options.restrictSize ) {
          $this.parent().css({
            maxWidth  : width,
            maxHeight : height
          });
        }

      }

    };

    // Resize elements which have not been formatted
    this.not('.resized').each(function() {
      self.format($(this));
    });

  };

})(jQuery);