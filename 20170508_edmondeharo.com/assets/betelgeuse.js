/*********************************************
 *
 * Configuration and Initialization
 *
 *********************************************/

var Site = Site || { };

// Cache
Site.$el = {

	setup : function() {
		this.window = $(window);
		this.index  = $('#index');
	}

};

// Run the setup & events methods on all Site namespaces
$(function() {

	var key, namespace;

	for (key in Site) {
		namespace = Site[key];
		if ( namespace.hasOwnProperty('setup') && typeof namespace.setup === "function" ) {
			namespace.setup();
		}
		if ( namespace.hasOwnProperty('events') && typeof namespace.events === "function" ) {
			namespace.events();
		}
	}

});

/*********************************************
 *
 * Index
 *
 *********************************************/

Site.Index = {

	gutter		: 40, // can be set in custom HTML by – var thumbnail_gutter = 10;
	size		: 0,
	scrollTop	: 0,
	masoned		: false,
	excerpt_min : 10,

	remason : function() {
		Site.$el.index.masonry();
	},

	resize : function() {

		// Reference
		var self = Site.Index;

		if(window.thumbnail_gutter || window.thumbnail_gutter == 0) {
			self.gutter = window.thumbnail_gutter;
		}

		// Grid size
		var breakpoint	= (self.breakpoint) ? self.breakpoint : Cargo.Model.DisplayOptions.GetThumbSize()['w'],
			columns		= Math.floor(Site.$el.index.width() / breakpoint),
			size		= Math.ceil(Site.$el.index.width() / columns),
			doubleSize	= (size * 2) - self.gutter;

		// Compensate for odd Pixel with 0px gutter
		if ( Site.$el.index.width() % columns !== 0 && self.gutter == 0 ){
			size-= 1;
			doubleSize = (size * 2) - self.gutter;
		};

		// Update data
		self.size = size;

		// Double size catch
		if ( columns < 2 ) {
			doubleSize = size - self.gutter;
		}

		if($(".audio_component").length > 0) {
			// Normal size
			$('#index .thumbnail').css({
				width : size - self.gutter + 'px'
			});

			// Double size
			$('#index .thumbnail.double').css({
				width : doubleSize + 'px'
			});
		} else {
			// Normal size
			vein.inject('#index .thumbnail', {
				width : size - self.gutter + 'px'
			});

			// Double size
			vein.inject('#index .thumbnail.double', {
				width : doubleSize + 'px'
			});
		}



		// Update column size
		if ( self.masoned ) {
			Site.$el.index.masonry('option', {
				columnWidth: size - self.gutter
			});
		}

		// Relayout masonry
		self.remason();

	},

	show : function() {

		Site.Index.resize();

		// Reset scroll position
		setTimeout(function() {
			$('html, body').scrollTop(Site.Index.scrollTop);
		}, 1);

	},

	paginate : function() {

		var self = Site.Index;

		Site.$el.index
			.find('.thumbnail:not(.formatted)')
			.each(function() {
				self.truncateExcerpt($(this));
			})
			.end()
			.find('.thumbnail:not(.formatted) .thumb_image img')
			.resizeMedia();

		self.setFirstLoadThumbs();
		self.setAllThumbsDouble();

		if ( Site.$el.index.data('masonry') ) {
			Site.$el.index.masonry('addItems', $('.thumbnail:not(.formatted)'));
			Site.$el.index.masonry();
		}

		$('.thumbnail').addClass('formatted');

		self.resize();

	},

	truncateExcerpt : function($this) {

		var $excerpt = $this.find('.thumb_excerpt span');
		var oldText  = $excerpt.text();
		var newText  = oldText.split('. ');

		if ( newText.length > 1 ) {
			if(newText[0].length < this.excerpt_min) {
				var final_text = '';
				for(var i=0;i<newText.length;i++) {
					if(final_text.length < this.excerpt_min) {
					final_text += newText[i] + '.';
					}
				}
				$excerpt.text(final_text);

			} else {
				$excerpt.text(newText[0] + '.');
			}
		}

	},

	toggleThumbSize : function(event) {

		if(typeof CargoInspector === "object") {
			// disable toggling thumbs in Inspector mode.
			return;
		}

		var $this = $(event.currentTarget).closest('.thumbnail'),
			file_data = { };

		if ( $this.hasClass('double') ) {

			$this.removeClass('double');
			Site.Index.setSingleThumbNormal($this);

		} else {

			$this.addClass('double');
			Site.Index.setSingleThumbDouble($this);

		}

		$(".thumbnail").each(function() {
			file_data[$(this).data('id')] = $(this).hasClass('double');
		});

		// Merge with the existing list
		Site.Project.Data.thumb_size_list = $.extend({}, Site.Project.Data.thumb_size_list, file_data);

		file_data = 'var ' + Site.Project.Data.size_var + ' = ' +JSON.stringify(Site.Project.Data.thumb_size_list);

		Cargo.API.PutSiteFile(Site.Project.Data.file_name, file_data);

		Site.Index.remason();

	},

	setup : function() {

		if(typeof thumb_size_list !== "undefined") {
			Site.Project.Data.thumb_size_list = thumb_size_list;
		}

		this.setFirstLoadThumbs();
		this.setAllThumbsDouble();
		this.paginate();

		Site.$el.index
			.masonry({
				itemSelector  : '.thumbnail',
				isResizeBound : false,
				transitionDuration: 0,
			columnWidth : this.size - this.gutter,
				gutter : this.gutter
			})
			.css('visibility', 'visible');

		this.masoned = true;

	},

	/**
	 * Loop through the data for thumb sizes
	 * This data is being written to the page in the handlebars file
	 * inside of a script tag like {{ site.files.[thumb_size.json] }}
	 */
	setFirstLoadThumbs: function() {

		if(Site.Project.Data.thumb_size_list) {

			var keys = _.keys(Site.Project.Data.thumb_size_list),
				i;

			for(i = 0; i < keys.length; i++) {
				if(Site.Project.Data.thumb_size_list[keys[i]]) {
					$(".thumbnail[data-id='"+keys[i]+"']").addClass("double");
				}
			}
		}

	},

	/**
	 * Set the thumbnail images to be double, if we are actually double
	 */
	setAllThumbsDouble: function() {

		$(".thumbnail.double").each(function() {
			Site.Index.setSingleThumbDouble($(this));
		});

	},

	/**
	 * Set a single thumb image to double size
	 * @param {selector} thumb A jQuery selector
	 */
	setSingleThumbDouble: function(thumb) {

		$img = $(thumb).find('img');

		if($img.data('4x') && $img.data('4x') !== $img.attr('src')) {

			$img.attr('src', $img.data('4x'));

		} else if(!$img.data('4x') && $img.data('hi-res') && $img.data('hi-res') !== $img.attr('src')) {

			$img.attr('src', $img.data('hi-res'));

		}

	},

	/**
	 * Set a single thumb image to double size
	 * @param {selector} thumb A jQuery selector
	 */
	setSingleThumbNormal: function(thumb) {

		$img = $(thumb).find('img');

		if(Site.Index.useHiRes() && $img.data('hi-res') && $img.data('hi-res') !== $img.attr('src')) {

			$img.attr('src', $img.data('hi-res'));

		} else if(!Site.Index.useHiRes()) {

			$img.attr('src', $img.data('default'));

		}

	},

	/**
	 * Check to see if this is a hires screen
	 * @return {Boolean}
	 */
	useHiRes: function() {

		if(window.devicePixelRatio > 1.5) {
			return true;
		}

		return false;

	},

	events : function() {

		Cargo.Event.on("show_index_complete", this.show);
		Cargo.Event.on('pagination_complete', this.paginate);
		Cargo.Event.on("reseed_project_complete", function() {
			Site.Index.setup();
		});

		Site.$el.window.on('resize', Site.Index.resize).trigger('resize');

		window.onorientationchange = function() {
			Site.Index.resize();
			Site.Project.resize();
		}

		$('#index').on('click', '.toggleSize', this.toggleThumbSize);

	}

};

/*********************************************
 *
 * Project
 *
 *********************************************/

Site.Project = {

	options : {

		textWidth	: 0,
		widestMedia	: 0

	},

	Data : {

		'file_name'			: 'thumb_size.json',
		'size_var'			: 'thumb_size_list',
		'thumb_size_list'	: false,
		'open'				: false,
		contentWidth 		: 300

	},

	loadComplete : function() {

		setTimeout(function(){
			Site.Project.Data.open = true;
		}, 100);

		// Cache
		var self			= Site.Project,
			data			= { },
			ignoreList		= '.project_title, .project_footer',
			mediaElements	= 'img, video, iframe, object, audio, embed, div';

		// Cache
		Site.$el.entry          = $('.entry');
		Site.$el.projectContent = $('.project_content');
		Site.$el.projectMedia   = $('.project_media');


		// Only split on projects
		if ( Cargo.Helper.GetCurrentPageType() =="project"){
			// Split the content into blocks
			Site.Helper.formatText(Site.$el.projectContent);

			// Move elements into containers
			Site.$el.projectContent
				.children(mediaElements)
				.not(ignoreList)
				.appendTo(Site.$el.projectMedia);
		};

		// Set some data
		self.options.widestMedia = self.getWidestMedia();

		// Resize
		Site.$el.window.on('resize', self.resize).trigger('resize');

		// Jump to top
		Cargo.Helper.ScrollToTop();

		// We're done here
		Cargo.Event.trigger("projectMediaFormatted");

	},

	directLink : function() {

		if(Cargo.Model.Project.GetType() === "project") {
			// Hide the header
			$('.site_header').hide();
		}

	},

	updateScrollPosition : function() {

		if ( Cargo.Helper.GetCurrentPageType() === false ) {
			Site.Index.scrollTop = Site.$el.window.scrollTop();
		}

	},

	setTextPosition : function() {

		if( $('body').is('.mobile') ) {

			$('.project_content').removeClass('scrollable');

		} else {

			if ( ($('.project_content').innerHeight() + 30) >= ($(window).height() - $('.navigation').height()) ){

				$('.project_content').addClass('scrollable');

			} else {

				$('.project_content').removeClass('scrollable');

			}
		}

	},


	getWidestMedia : function() {

		var widest = 0,
			width;

		Site.$el.projectMedia
			.find('img, iframe')
			.each(function() {
				// If there's a width attribute, use that
				if ( $(this).attr('width') > 0 ) {
					width = parseInt($(this).attr('width'));
				} else {
					width = parseInt($(this).width());
				}

				// Update if we're widest
				if ( width > widest ) {
					widest = width;
				}

			});

		return widest;

	},

	unload : function() {

		Site.$el.window.off('resize', Site.Project.resize);

	},

	resize : function() {

		var self			= Site.Project,
			entryWidth		= Site.$el.entry.width(),
			contentWidth	= Site.Project.Data.contentWidth,
			contentPad		= parseInt(Site.$el.projectContent.css('padding-left')),
			mediaWidth		= (entryWidth - contentPad) - contentWidth,
			widestMedia		= self.options.widestMedia,
			marginWidth 	= mediaWidth,
			increment 		= 1;

		// Maximums
		if ( mediaWidth > widestMedia && widestMedia > 0 ) {
			mediaWidth = widestMedia;
		}

		if(mediaWidth == 0) {
			mediaWidth = entryWidth - contentPad - $('.project_nav').width();
		}

		// If the media is smaller then the container, set the margin
		if(mediaWidth != widestMedia) {
			marginWidth = mediaWidth;
		}

		// Mobile
		if ( entryWidth < 900 ) {

			$('body').addClass('mobile');

			if($('.project_media .project_nav').length === 0 && $('.project_nav').length > 0) {
				$('.project_nav').prependTo('.project_media');
			}

		} else {

			$('body').removeClass('mobile');

			if($('.project_media .project_nav').length > 0) {
				$('.project_nav').prependTo('.project');
			}

		}

		if($(".audio_component").length > 0) {
			// Media
			$('body[data-pagetype="project"]:not(.mobile) .project_media').css({
				'width' : mediaWidth + 'px'
			});

			$('body[data-pagetype="project"]:not(.mobile) .nav_wrapper').css({
				'width' : mediaWidth + 'px'
			});

			// Content
			$('body[data-pagetype="project"]:not(.mobile) .project_content').css({
				'width' : contentWidth + 'px'
			});

			$('body:not(.mobile) .project_header, .project_nav, body[data-pagetype="project"]:not(.mobile) .project_content').css({
				'margin-left' : marginWidth + 'px',
			});
		} else {
			// Media
			vein.inject('body[data-pagetype="project"]:not(.mobile) .project_media', {
				'width' : mediaWidth + 'px'
			});

			vein.inject('body[data-pagetype="project"]:not(.mobile) .nav_wrapper', {
				'width' : mediaWidth + 'px'
			});

			// Content
			vein.inject('body[data-pagetype="project"]:not(.mobile) .project_content', {
				'width' : contentWidth + 'px'
			});

			vein.inject(['body:not(.mobile) .project_header', '.project_nav', 'body[data-pagetype="project"]:not(.mobile) .project_content'], {
				'margin-left' : marginWidth + 'px',
			});
		}

		// Set the nav vertical size in increments of 1
		var line_height = parseInt($('.navigation').css('line-height'));
		if(line_height) {
			increment = Math.floor($('.navigation').height() / line_height);
		}

		$('.entry').attr('class','entry').addClass('size_' + increment);

		Site.Project.setTextPosition();

	},

	setup : function() {

		// Set options
		this.options.textWidth = 300;

		// Format if direct link
		if ( Cargo.Helper.IsDirectLink() || Cargo.Helper.IsAdminEditProject() ) {

			this.loadComplete();
			this.directLink();

		}

	},

	events : function() {

		Cargo.Event.on("project_load_complete", this.loadComplete);
		Cargo.Event.on("show_index_complete", this.unload);
		Cargo.Event.on('project_load_start', this.updateScrollPosition);

	}

};

/*********************************************
 *
 * Helpers
 *
 *********************************************/

 Site.Helper = {

	formatText : function(node, includeWhitespaceNodes) {

		var validTags			= ['img', 'object', 'video', 'audio', 'iframe', 'div'],
			nodeContents		= node.contents(),
			newPageFromCache	= true,
			textPages			= {},
			pageCache			= [],
			pageCount			= 0;

		// inline helper functions
		var _isValidText = function(txt, strict) {

			if (txt !== undefined) {
				txt = txt.replace(/<!--([\s\S]*?)-->/mig, "");
				txt = txt.replace(/(\r\n|\n|\r|\t| )/gm, "");
				txt = txt.replace(/[^A-Za-z0-9\s!?\.,-\/#!$%\^&\*;:{}=\-_`~()[[\]]/g, "");

				if (txt.length > 0) {
					return true;
				}
			} else {
				if (strict) {
					return false;
				} else {
					return true;
				}
			}

			return false;

		}

		var _getTag = function(el) {

			if (typeof el !== "undefined") {
				var tag = el.tagName;

				if (typeof tag === "undefined") {
					tag = 'text';
				}

				return tag.toLowerCase();
			}

		}

		nodeContents.each(function(key, val) {

			if ($.inArray(_getTag(val), validTags) >= 0) {
				// save cache as new page
				if (pageCache.length > 0) {
					textPages[pageCount] = pageCache;
					pageCache = [];
					pageCount++;
				}
			} else {
				if (_isValidText(val.data) && val.nodeType != 8) {
					pageCache.push(val);
				}
			}

		});

		// Still some stuff left in cache
		if (pageCache.length > 0) {

			// Check if it needs a new page
			for (var i = 0; i < pageCache.length; i++) {
				if (pageCache[i].nodeType == 8 || pageCache[i].nodeName == "SCRIPT" || pageCache[i].nodeName == "STYLE") {
					// Contains text, create new page
					newPageFromCache = false;
				}
			}

			if (newPageFromCache) {
				// Create new page
				textPages[pageCount] = pageCache;
				pageCache = [];
				pageCount++;
			} else {
				for (var i = 0; i < pageCache.length; i++) {
					// Dump and hide remaining elements
					$(pageCache[i]).hide().appendTo($('.project_footer'));
				}
			}

		}

		$.each(textPages, function(key, arr) {

			var breaks = 0;

			$.each(arr, function(key, el) {
			if (el.nodeName == "BR") {
				 breaks++;
			}
			});

			if (breaks < arr.length) {
			var first = arr[0],
				parent = $('<p />');

			$(first).before(parent);

			$.each(arr, function(key, el) {
				$(el).appendTo(parent);
			});
			} else {
			$.each(arr, function(key, el) {
				$(el).remove();
			});
			}

		});

	}

 };

 /**
	* Transitions
	*/

Cargo.Event.ShowProjectTransition = function(pid, project_markup, project_model) {

	if(project_model.GetType() == "project") {
		$('.site_header')
			.stop()
			.animate({
				opacity: 0
			}, 250, function() {
				$('.site_header').hide();
			});

	}

	$('#index')
		.stop()
		.animate({
			opacity: 0
		}, 250, function() {

			Cargo.View.ProjectDetail.$el.html( project_markup );
			Site.Project.loadComplete();
			Cargo.Event.ProjectTransition.resolve();
			$("body").scrollTop(0);

			if(project_model.GetType() == "page") {
				$('.site_header').css({'opacity' : 1}).show();
			}

			if ( ! Site.Project.Data.open ) {

				$(".entry, .project_nav")
					.css({
						'display' : 'block',
						'opacity' : '0'
					})
					.animate({
						opacity: 1
					}, 260);
			}

	});

	return Cargo.Event.ProjectTransition.promise();

}

Cargo.Event.ShowIndexTransition = function(pid, project_model) {

	$('.project_nav').stop().animate({
		opacity: 0
	}, 250);


	$('.entry')
		.stop()
		.animate({
			opacity: 0
		}, 250, function() {

			Cargo.Event.IndexTransition.resolve();

			$('.site_header')
				.css({
					'display' : 'block',
					'opacity' : '0'
				})
				.animate({
					opacity: 1
				}, 250);

			$('#index')
				.css({
					'display' : 'block',
					'opacity' : '0'
				})
				.animate({
					opacity: 1
				}, 250);

		});

	Site.Project.Data.open = false;

	return Cargo.Event.IndexTransition.promise();

}