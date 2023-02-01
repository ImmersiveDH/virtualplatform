(function ($, Drupal, once) {
  // Drupal.behaviors.custom_redirect = {
  //   attach: function() {
  //     // Replace he form id and the select id in selecotor below.
  //     $("form.node-icon-form").change(function(e) {
  //       e.stopPropagation();
  //       // Path where you want to redirect.
  //       // var redirect_url = '';
  //       // window.location.pathname = redirect_url;
  //     });
  //   }
  // };

  $(document).ready(function() {

    // Start color picker
    // Initialize color picker on the "Color" field in all contexts.
    function initColorPicker() {
      if ($(".field--name-field-color input").length > 0) {
        Coloris({
          el: '.field--name-field-color input'
        });
      }
    }
    initColorPicker();
    // End color picker

    var current_number_of_icons = $('.ief-row-entity').length;

    // Make "Add another item" link on the IEF entity reference list into a button:
    $('.field-add-more-submit').addClass('btn-primary');
    $(".form-item-field-icon-actions-bundle select").val('icon'); // force the (bugged) content type select box to always be "icon".


    ///////////////////////////
    // Start draggable grid. //
    ///////////////////////////
    $('#edit-field-icon-wrapper').after('<div id="draggable-grid" class="gridly"><img src=""></div>');

    // Watch the icon entity reference field for changes.
    // These happen via AJAX when we edit, delete, or create a new icon. (Or hit 'cancel' after we've done that.)
    if ($("#edit-field-icon-wrapper").length > 0) {
      const elementToObserve = document.querySelector("#edit-field-icon-wrapper");
      // create a new instance of `MutationObserver` named `observer`,
      // passing it a callback function
      const observer = new MutationObserver(() => {
        // console.log('callback that runs when observer is triggered');
        console.log("The inline entity reference field changed.");

        // force the (bugged) content type select box to always be "icon".
        // (By default) the Inline Entity Form complex widget doesn't filter content types.
        // I THINK this is probably a bug: (Either way, we hide the field in CSS.)
        // See https://drupal.stackexchange.com/questions/298098/inline-entity-form-allow-add-existing-nodes-only-for-specific-node-types-and-no
        $(".form-item-field-icon-actions-bundle select").val('icon');

        // Restart the color picker again.
        initColorPicker();

        // If the number of icons already selected has changed, reinitialize the icon grid to accommodate the new one, or remove the old one.
        // Todo: this might break if we can somehow replace icons while keeping the total count the same.
        // it also won't work if we change the image of the icon when editing it.
        var icon_count = $('.ief-row-entity').length;
        if (current_number_of_icons != icon_count) {
          console.log("an icon has been added or removed. reinitializing the grid.");
          initializeIconGrid();
          current_number_of_icons = icon_count;
        }

        changeContentItemToIcon();
      });
      observer.observe(elementToObserve, {subtree: true, childList: true});
    }

    // Change "Content item" on the buttns "Create content item", "Add existing content item", and "Add new content item" to read "icon" instead.
    function changeContentItemToIcon() {
      // buttons
      $('input[value="Add new content item"]').attr('value', 'Add new icon');
      $('input[value="Add existing content item"]').attr('value', 'Add existing icon');
      $('input[value="Add content item"]').attr('value', 'Add icon');
      $('input[value="Create content item"]').attr('value', 'Create icon');
      $('input[value="Update content item"]').attr('value', 'Update icon');


      // headings/legends
      $(".fieldset-legend:contains(Add new content item)").text("Add new icon");
      $(".fieldset-legend:contains(Add existing content item)").text("Add existing icon");
      $(".fieldset-legend:contains(Add content item)").text("Add icon");
      $(".ief-form-bottom label:contains(Content item)").text("Icon name");

      // add a label to "create an icon".
      // ief-form

    }

    /////////////////////////////////////
    // set up the Better Icon Lookup view
    /////////////////////////////////////

    // Add a "reset" button to the form.
    // We do this because the default "Reset" button reloads the entire page.
    // function setupBetterIconLookupView() {
    //   if ($(".view-better-icon-lookup .form-actions #reset-buttom-icon-lookup").length == 0) {
    //     $(".view-better-icon-lookup .form-actions").append('<input id="reset-better-icon-lookup" class="button btn btn-primary" value="Reset" />');
    //   }
    // }
    // setupBetterIconLookupView();

    // When the form changes, make sure we re-add the reset button.
    // if ($(".view-better-icon-lookup").length > 0) {
    //   const better_icon_lookup_element = document.querySelector(".view-better-icon-lookup");
    //   // create a new instance of `MutationObserver` named `observer`,
    //   // passing it a callback function
    //   const better_icon_lookup_observer = new MutationObserver(() => {
    //     console.log("The Better Icon Lookup view changed.");
    //     setupBetterIconLookupView();
    //   });
    //   better_icon_lookup_observer.observe(better_icon_lookup_element, {subtree: true, childList: true});
    // }
    ////////////////////////////////////////
    // End setup for Better Icon Lookup View
    ////////////////////////////////////////


    // make links in /icons view sort taxonomy terms in the /icons view instead of the default taxonomy term view.
    //https://virtual.wintersandassociates.com/icons?title=&tid=Flaticon+Animal+Pack&field_public_value=All
    $('.views-field-term-node-tid a').click(function(e) {
      e.preventDefault();
      var this_term = $(this).text();
      var current_url = window.location.href.split('?')[0];
      window.location = current_url + '?tid=' + this_term.replace(/ /g, '+');
    });


    function initializeIconGrid() {
      $("#draggable-grid").empty();
      $('#inline-entity-form-field_icon-form tr.ief-row-entity').each(function() {
        // Duplicate the image found in the inline entity form and copy it into the grid.
        // make sure the img tag itself isn't draggable. (otherwise, we can drag the img rather than the entire icon.)
        // put it in the draggable-grid;
        // and wrap it with a (draggable) ".draggable-icon" div.
        var index = $(this).index();
        // if (!$(this).hasClass("ready-to-drag")) {
          console.log("Setting up icon " + index);
          $(this).addClass("original-order-" + index);
          $(this).find("img").clone().addClass('original-order-' + index).attr('data-original-order', index).attr('draggable','false').appendTo('#draggable-grid').wrap('<div class="brick small draggable-icon original-order-' + index + '"></div>');
          $('.draggable-icon.original-order-' + index).attr('data-original-order', index).append('<div class="controls"><div class="edit">Edit</div><div class="remove">Remove</div></div>');
        // }
      });

      if ($('.form-item-field-number-of-columns #slider').length < 1) {
        $('#edit-field-number-of-columns').after('<div id="slider"><div class="ui-slider-handle"></div></div>');
      }

      // Start column slider
      if ($('#edit-field-number-of-columns').length > 0) {
        var select = $('#edit-field-number-of-columns');
        var handle = $('#slider .ui-slider-handle');
        var slider = $("#slider").slider({
          create: function() {
            handle.text($(this).slider("value"));
          },
          value: select[0].selectedIndex + 1,
          min: 1,
          max: 8,
          range: "min",
          slide: function(event, ui) {
            // console.log(ui);
            console.log(ui.value);
            handle.text(ui.value);
            select.val(ui.value);
            initGridly(ui.value);
          }
        });

        select.on("change", function() {
          // slider.slider("value", this.selectedIndex + 1);
          // slider.slider("min", 1);
          // slider.slider("max", 8);

          initGridly(this.selectedIndex + 1);
        });
      }
      // todo: add preview
      // todo: add rows slide.

      // end column slider


      ////////////////////////////////////////////////////////
      // Gridly (https://github.com/ksylvest/jquery-gridly) //
      ////////////////////////////////////////////////////////
      // Gridly callback functions:
      var reordering = function($grid_icons) {
        // Called before the drag and drop starts with the elements in their starting position.
        console.log("Reordering.");
      };
      var reordered = function($grid_icons) {
        // Called after the drag and drop ends with the elements in their ending position.
        console.log("Reordered.");

        $grid_icons.each(function(count) {
          // console.log($grid_icons[count].firstChild);

          var current_icon_image = $grid_icons[count].firstChild.currentSrc;
          var current_icon_original_order = $grid_icons[count].firstChild.dataset.originalOrder;
          // var current_icon_original_order = $(this).find("img").data('originalOrder');
          // console.log("originalOrder: " + current_icon_original_order);
          $('#edit-field-icon-entities-' + current_icon_original_order + '-delta').val(count).change();
        });
      }

      // Initialize Gridly
      function initGridly(columns) {
        // first add them up.
       //  var num_icons = $('.draggable-icon').length;
       //  while (num_icons < 32) {
       //   $('.gridly').append('<div class="draggable-icon not-draggable"></div>');
       //   num_icons++;
       // }

        var max_width_total = $('#draggable-grid').width();
        var max_width_individual =  Math.floor(max_width_total / columns);

        // this ensures the icon is a square.
        $('.draggable-icon').css('height', max_width_individual).css('width', max_width_individual);

        $('.gridly').gridly({
          base: max_width_individual, // px
          gutter: 1, // px
          columns: columns
        });

        // we want to reset the grid height every time or else it runs into trouble when we resize.
        // $('.draggable-icon').height(max_width_individual);
        // $('.gridly').css('height', 'max_width_total / 2);

        $('.gridly').gridly({
          callbacks: { reordering: reordering , reordered: reordered }
        });
      }
      initGridly($('#edit-field-number-of-columns').val());

      var timeout;
      $(window).resize(function() {
        console.log("The window resized.");
        clearTimeout(timeout);
        timeout = setTimeout(initGridly, 100);
      });


      // if ($('#draggable-grid-after').length < 1) {
      //   $('#draggable-grid').after('<div id="draggable-grid-after"></div>');
      //   var i = 0;
      //   while (i < 16) {
      //     $('#draggable-grid-after').append('<div class="non-draggable-grid-item"></div>');
      //     i++;
      //   }
      // }
      // Clicking the "Full screen view" button makes the board take up the entire window.
      $(document).on("click", "#block-fullscreenboardbutton .btn", function(event) {
        $("body").toggleClass('full-screen-preview');
      });
                              // "#block-fullscreenboardbutton .button",
                              // "#block-fullscreenboardbutton .btn",
                              // "#block-fullscreenboardbutton .btn-primary", function(event) {
                              //   $("body").toggleClass('full-screen-preview');
                              // });

      // Close Full screen view when hitting escape.
      $(document).on('keyup', function(e) {
        // if (e.key == "Enter") $('.save').click();
        if (e.key == "Escape") $("body").removeClass('full-screen-preview');
      });


      // clicking the "edit" button on an icon in the grid triggers a click on the
      // "edit" button for the corresponding entry in the hidden inline entity form table
      $(document).on("click", ".draggable-icon .edit", function(event) {
        var img_src = $(this).parents('.draggable-icon').find('img').attr('src');
        console.log("looking for this icon: " + img_src);
        $('.field--name-field-image > img[src="' + img_src +'"]').parents('.ief-row-entity').find('.ief-entity-operations input[value="Edit"]').mousedown();
      });

      // clicking the "remove" button on an icon in the grid triggers a click on the
      // "remove" button for the corresponding entry in the hidden inline entity form table
      $(document).on("click", ".draggable-icon .remove", function(event) {
        var img_src = $(this).parents('.draggable-icon').find('img').attr('src');
        console.log("looking for this icon: " + img_src);
        $('.field--name-field-image > img[src="' + img_src +'"]').parents('.ief-row-entity').find('.ief-entity-operations input[value="Remove"]').mousedown();
      });
      ////////////////
      // End Gridly //
      ////////////////
    }

    changeContentItemToIcon();
    initializeIconGrid();


    // Board pages: Set up grid on view page, not edit page
    if ($('#block-views-block-icons-on-this-board-block-1').length > 0) {
      var number_of_columns_in_grid = $('.field--name-field-number-of-columns .field__item').text();
      var tile_width = 100 / number_of_columns_in_grid;
      $('#block-views-block-icons-on-this-board-block-1 .views-row').css("width", tile_width + '%');
    }
  });
})(jQuery, Drupal, once);
