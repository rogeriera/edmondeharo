/**
 * Friedman
 */

var Design = {

	keybindings: function() {
		// Remove previous bindings
		Cargo.Core.KeyboardShortcut.Remove("Left");
		Cargo.Core.KeyboardShortcut.Remove("Right");

    Cargo.Core.KeyboardShortcut.Add("esc", 27, function() {
      Action.Project.Close();
      return false;
    });

		Cargo.Core.KeyboardShortcut.Add("Left", 37, function() {
			Action.Project.Prev();
			return false;
		});

		Cargo.Core.KeyboardShortcut.Add("Right", 39, function() {
			Action.Project.Next();
			return false;
		});
	},

	resizeSlideshow: function(el, obj, state) {
		if (state == "resize") {
			el.find("> *").css({
				"-webkit-transition": "margin 0s ease",
				"-moz-transition": "margin 0s ease",
				"transition": "margin 0s ease"
			});
		} else {
			el.find("> *").css({
				"-webkit-transition": "margin " + obj.options.transition_duration + "s ease",
				"-moz-transition": "margin " + obj.options.transition_duration + "s ease",
				"transition": "margin " + obj.options.transition_duration + "s ease"
			});
		}

		// Resize and position the containing element
		obj.resizeContainer();
		Cargo.Plugins.elementResizer.refresh();
	},

	groupNavigation: function() {
		var navGroups = [];

		$(".navigation div[data-type]").each(function() {
			var type = this.getAttribute("data-type");

			if ($.inArray(type, navGroups) == -1) {
				// first unwrap if already wrapped
				if ($(this).parent().hasClass("group")) {
					$(this).unwrap();
				}

				if (type == "link" || type == "page") {
					var items = $(".navigation div[data-type='link'], .navigation div[data-type='page']");
					navGroups.push("link", "page");
				} else {
					var items = $(".navigation div[data-type='" + type + "']");
					navGroups.push(type);
				}

				items.wrapAll("<span class='group' />");
			}
		});
	},
	
	adjustHeader: function () {

		//Move Header Img / Text with height of nav
		$(window).on("load resize", function() {
				
			var navHeight	= $('.navigation').height(),
				navHeightHalf = navHeight / 2;
				headImgWrap	= $('.site_header');
			
			if (!Cargo.Helper.isPhone() && navHeight > 33 && headImgWrap.is(':visible')) {

				headImgWrap.css('margin-top', navHeightHalf);

			} else if (!Cargo.Helper.isPhone() && navHeight <= 33 && headImgWrap.is(':visible')) {

				headImgWrap.removeAttr('style');

			}
				
		});
		
	},

	formatThumbnails: function() {
		 $(".thumbnail[data-formatted!='true']").each(function() {
			if ($(this).find(".thumb_image img").attr("src") == "/_gfx/thumb_custom.gif") {
				$(this).addClass("default_thumb");
			}

			$(this).attr("data-formatted", "true");
		});
	},

	 mobileIcons: function() {
		if (navigator.userAgent.match(/i(Phone|Pod|Pad)/i)) {
			$(".goto.prev").text("▲");
			$(".goto.next").text("▼");
			$(".project_nav .previous").text("◀");
			$(".project_nav .next").text("◀");
		}
	},

  formatNavigation : function() {
    $('.navigation .page_link').appendTo('.page_navigation');
  },

  setActiveState : function() {

    // Ignore if we're not on a set
    if ( !Cargo.Helper.IsOnSet() ) return false;

    $('.sets > div[data-title="' + Cargo.Helper.GetSetName() + '"]').addClass('active');

  }

};

/**
 * Events
 */

$(function() {

	// Design.mobileIcons();
	Design.keybindings();
	Design.formatThumbnails();
	Design.formatNavigation();
	Design.setActiveState();
	Design.adjustHeader();

	// divide the nav in groups
	Design.groupNavigation();

	if(Cargo.Helper.IsSololink() || Cargo.Helper.IsOnStartProject()) {
		setTimeout(Site.Project.loadComplete, 50);
		// var pid = (Cargo.Model.Project.GetId()) ? Cargo.Model.Project.GetId() : Cargo.Helper.GetStartProjectId();
		// if($('[data-id="'+pid+'"].active', Cargo.View.Navigation.$el).length > 0) {
		// 	$('[data-id="'+pid+'"].active', Cargo.View.Navigation.$el).parents('.group').remove();
		// }

		if(Cargo.Model.Project.GetType() === "project") {
			// Hide the header
			$('.site_header').hide();
		}
	}

	// Note that we're on a phone
	var md = new MobileDetect(window.navigator.userAgent);
	if(md.mobile() && !md.tablet()) {
		$("body").addClass("phone");
	}

	var viewport = document.getElementById('viewport');
	if (Cargo.Helper.isPhone()) {
		if(window.orientation != 0 && Cargo.Helper.isPhone()) {
			viewport.setAttribute("content", "initial-scale=1");
		} else {
			viewport.setAttribute("content", "initial-scale=0.55");
		}
	} 
	

	window.addEventListener("orientationchange", function() {
		
		if ( Cargo.Helper.isPhone()) {
			if(window.orientation != 0 && Cargo.Helper.isPhone()) {
				viewport.setAttribute("content", "initial-scale=1");
			} else {
				viewport.setAttribute("content", "initial-scale=0.55");
			}
		}
		
	}, false);
});


Cargo.Event.on("element_resizer_init", function( plugin ) { 
  plugin.setOptions({
    cargo_refreshEvents: ['projectContentFormatted', 'projectMediaFormatted', 'show_index_complete', 'pagination_complete', 'inspector_preview', 'project_collection_reset', 'direct_link_loaded'],
    centerElements: false,
    adjustElementsToWindowHeight: false,
  });  
});

Cargo.Event.on("slideshow_resize", function(el, obj) {
	Design.resizeSlideshow(el, obj, "resize");
});

Cargo.Event.on("slideshow_transition_start", function(el, obj) {
	Design.resizeSlideshow(el, obj);
});

Cargo.Event.on("fullscreen_destroy_hotkeys", function() {
	Design.keybindings();
});

Cargo.Event.on("project_load_complete", function(pid) {
	// Design.mobileIcons();

	if (Cargo.Model.Project.GetType() == "project") {
		if (!Cargo.Model.DisplayOptions.attributes.thumbs_below_projects || Cargo.Helper.IsOnSet()) {
			// $(".show_index").show();
		}
	}
});

Cargo.Event.on("show_index_complete", function(pid) {
	// $(".show_index").hide();
});

Cargo.Event.on("pagination_complete", function() {
	Design.formatThumbnails();
	Design.groupNavigation();
});

Cargo.Event.on("navigation_reset", function() {
	Design.groupNavigation();
});
