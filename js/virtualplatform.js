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
    // var url_found = UrlExists("https://virtual.wintersandassociates.com/sdfsadfs");
    // if (!url_found) {
    //   console.log("this URL doesn't exist.");
    // }

    ////////////////////////
    // Start color picker //
    ////////////////////////
    // Initialize color picker on the "Color" field in all contexts.
    function initColorPicker() {
      if ($(".field--name-field-color input").length > 0) {
        Coloris({
          el: '.field--name-field-color input',
          alpha: false
        });
      }
    }
    initColorPicker();
    //////////////////////
    // End color picker //
    //////////////////////



    ///////////////////////////////
    // Start full screen preview //
    ///////////////////////////////
    function turnOnFullScreenPreview() {
      $("body").addClass('full-screen-preview');
      window.location.hash = "full-screen";
      formatViewBoardNode();
    }

    function turnOffFullScreenPreview() {
      $("body").removeClass('full-screen-preview');
      window.location.href = window.location.href.split('#')[0];
      formatViewBoardNode();
    }

    function toggleFullScreenPreview() {
      if ($("body").hasClass('full-screen-preview')) {
        turnOffFullScreenPreview();
      }
      else {
        turnOnFullScreenPreview();
      }
    }

    // Clicking the "Full screen view" button makes the board take up the entire window.
    $(document).on("click", "#block-fullscreenboardbutton .btn", function(event) {
      toggleFullScreenPreview();
    });

    // Close Full screen view when hitting escape.
    $(document).on('keyup', function(e) {
      if (e.key == "Escape") {
        turnOffFullScreenPreview();
      }
    });

    // Turn on full screen mode when loading page with hash
    if (window.location.hash.substring(1) == "full-screen") {
      turnOnFullScreenPreview();
    }
    /////////////////////////////
    // End full screen preview //
    /////////////////////////////



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
        // check if the "add existing icon" form is open. if so, we want to
        if ($('.fieldset-legend:contains("Add existing Icon")').length > 0) {
          console.log("We are adding an existing icon.");
          $('#block-views-block-better-icon-lookup-block-1').css("display","block");
        }
        else {
          console.log("We are not adding an existing icon.");
          $('#block-views-block-better-icon-lookup-block-1').css("display","none");
        }
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
        addScaleSlider(); // add the icon scale slider if it doesn't already exist.
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
          // todo: add text, colour, etc.
          $('.draggable-icon.original-order-' + index).attr('data-original-order', index).append('<div class="controls"><div class="edit">Edit</div><div class="remove">Remove</div></div>');
        // }
      });

      /////////////////////////
      // Start column slider //
      /////////////////////////

      // 1. add slider widget
      if ($('.form-item-field-number-of-columns #slider').length < 1) {
        $('#edit-field-number-of-columns').after('<div id="slider"><div class="ui-slider-handle"></div></div>');
      }

      // 2. initialize column slider
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
            // console.log(ui.value);
            handle.text(ui.value);
            select.val(ui.value);
            initGridly(ui.value);
          }
        });

        // reinitialize gridly based on how many columns we've just told it to use.
        select.on("change", function() {
          initGridly(this.selectedIndex + 1);
        });
      }
      // todo: add preview
      // todo: add rows slide.
      // end column slider


      // Initialize Gridly for the first time.
      initGridly($('#edit-field-number-of-columns').val());
    }

    changeContentItemToIcon();
    initializeIconGrid();

    // // Board pages: Set up grid on view page, not edit page
    formatViewBoardNode();

    // if ($('#block-views-block-icons-on-this-board-block-1').length > 0) {
    //   var number_of_columns_in_grid = $('.field--name-field-number-of-columns .field__item').text();
    //   var tile_width = 100 / number_of_columns_in_grid;
    //   $('#block-views-block-icons-on-this-board-block-1 .views-row').css("width", tile_width + '%');
    // }

  });

  /////////////////////////////
  // Start image size slider //
  /////////////////////////////
  // todo: make this respect the editor.
  function addScaleSlider() {
    if ($('#image-scale-slider').length < 1) {
      // 1. Get the label for the image field (we don't always know if the label will be changed.)
      var imageScaleTextboxLabel = $(".node-form label:contains('Image Scale'), label:contains('Image scale')");

      // 2. The element to add.
      var sliderToAppendToScaleField = '<div id="image-scale-slider"><div class="ui-slider-handle"></div></div>';
      // 1. Board edit page (using inline entity form)
      // as well as icon edit page (not using inline entity form)
      imageScaleTextboxLabel.parent().parent().after(sliderToAppendToScaleField);

      // 3. Initialize scale slider
      var imageScaleSliderTextbox = $(imageScaleTextboxLabel).next('input');

      var handle = $('#image-scale-slider .ui-slider-handle');
      var imageScaleSlider = $("#image-scale-slider").slider({
        create: function() {
          handle.text($(this).slider("value"));
        },
        value: imageScaleSliderTextbox.val(),
        min: 0.0,
        max: 2.0,
        range: "min",
        step: 0.1,
        slide: function(event, ui) {
          console.log("image slider set to " + ui.value);
          handle.text(ui.value);
          imageScaleSlider.val(Number(ui.value));
          imageScaleSliderTextbox.val(ui.value);
        }
      });
    }
    else {
      console.log("There is already a slider for the image scale field.");
    }
  }
  addScaleSlider();


  ////////////////////////////
  // End image size slider. //
  ////////////////////////////





  /////////////////////////////////////////////////////////
  // Board editing page: Edit/Remove buttons on the grid //
  /////////////////////////////////////////////////////////
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
  ////////////////////////////
  // End board editing page //
  ////////////////////////////


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
      var current_icon_image = $grid_icons[count].firstChild.currentSrc; // do we need this line?
      var current_icon_original_order = $grid_icons[count].firstChild.dataset.originalOrder;
      $('#edit-field-icon-entities-' + current_icon_original_order + '-delta').val(count).change(); // do we need this line?
    });
  }

  // Initialize Gridly
  function initGridly(columns) {
   // We do this here because sometimes we can reinitialize Gridly without passing an argument. (Whoops)
   // EG: on window resize;
   if (!columns) {
     columns = $('#edit-field-number-of-columns').val();
   }

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

  // Reinitialize Gridly every time the window resizes.
  // but we need to do a timeout for reasons or it doesn't work consistently.
  var timeout;
  $(window).resize(function() {
    console.log("The window resized.");
    clearTimeout(timeout);
    timeout = setTimeout(initGridly, 50);

    // But we can format the "View tab" of board nodes immediately.
    formatViewBoardNode();
  });
  ////////////////
  // End gridly //
  ////////////////


  // Format the "Icons on this board" view found on Board nodes (/node/123, not /node/123/edit)
  // (This fixes the display of icons so they're squares.)
  // Todo: merge this into the icon formatter.
  function formatViewBoardNode() {
    if ($('.view-icons-on-this-board').length > 0) {
      var num_columns = $('.field--name-field-number-of-columns .field__item').text();
      var max_width_total = $('.view-icons-on-this-board').width();
      var max_width_individual =  Math.floor(max_width_total / num_columns);
      // console.log("Formatting the icons on this board to " + max_width_individual + "px square.");

      // this ensures the icon is a square.
      $('.view-icons-on-this-board .views-row').css('height', max_width_individual).css('width', max_width_individual);

      $('.view-icons-on-this-board .views-row').each(function() {
        // 1. Change the img src to the background.
        var image_url = $(this).find("img").attr("src");
        $(this).css('background-image', 'url("' + image_url + '")');

        // If there's no image, just make the text flow rather than be absolutely
        // positioned to the top and bottom.
        if (!image_url) {
          $(this).addClass("no-image");
        }

        // 2. Set the background scale of this icon.
        var image_scale = $(this).find('.views-field-field-image-scale .field-content').text();
        if (!image_scale) {
          image_scale = 1;
        }
        var image_size_native = $(this).find('img').attr('width');
        $(this).css('background-size', image_scale * image_size_native);

        // 3. Set the background colour of this icon.
        var background_color_for_this_icon = $(this).find('.views-field-field-color .field-content').text();
        $(this).css("background-color", background_color_for_this_icon);
        // Set text color based on background color.
        $(this).css("color", getTextColorBasedOnBackgroundColor(background_color_for_this_icon));

        // 4. Make sure the text doesn't overflow,
        //    Then run fittext on them.
        $(".views-field-field-text-above-icon, .views-field-field-text-below-icon").each(function() {
          $(this).width(max_width_individual);
          $(this).fitText();

        // $( .field-content").fitText();
        });
      });
    }
  }

  // Support function: set the text color based on background color.
  function getTextColorBasedOnBackgroundColor(hexcolor) {
    var r = parseInt(hexcolor.substring(1,3),16);
    var g = parseInt(hexcolor.substring(3,5),16);
    var b = parseInt(hexcolor.substring(5,7),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
  }

  // function populateEntityReferenceField() {
  //   $('')
  // }

  /////////////////////////////////////
  // Set up the Better Icon Lookup view
  /////////////////////////////////////
  function setupBetterIconLookupView() {
    // Add a "reset" button to the form.
    // We do this because the default "Reset" button reloads the entire page.
    // if ($(".view-better-icon-lookup .form-actions #reset-buttom-icon-lookup").length == 0) {
    //   $(".view-better-icon-lookup .form-actions").append('<input id="reset-better-icon-lookup" class="button btn btn-primary" value="Reset" />');
    // }
    // Set the background colour of each icon.
    $('.view-better-icon-lookup .views-row').each(function(event) {
      var background_color_for_this_icon = $(this).find('.views-field-field-color .field-content').text();
      console.log("setting background color to " + background_color_for_this_icon);
      $(this).find('.icon-and-text').css("background-color", background_color_for_this_icon);
      // Set text color based on background color.
      $(this).find('.icon-and-text').css("color", getTextColorBasedOnBackgroundColor(background_color_for_this_icon));
    });
  }
  setupBetterIconLookupView();

  // When the form changes, update the icon view AGAIN.
  if ($(".view-better-icon-lookup").length > 0) {
    const better_icon_lookup_element = document.querySelector("#block-views-block-better-icon-lookup-block-1");
    const better_icon_lookup_observer = new MutationObserver(() => {
      console.log("The Better Icon Lookup view changed.");
      setupBetterIconLookupView();
    });
    better_icon_lookup_observer.observe(better_icon_lookup_element, {subtree: true, childList: true});
  }

  // click on an icon in Better Icon Lookup View to make it populate the autocomplete field.
  $(document).on("click", ".view-better-icon-lookup .views-field-nothing", function(event) {
    var icon_title_and_nid = $(this).parent().find('.views-field-nid .field-content').text();
    console.log("Telling the autocomplete field to use '" + icon_title_and_nid + "'.");
    console.log("There are " + $('.ief-form-bottom .form-autocomplete').length + " autocomplete fields.");
    $('.ief-form-bottom .form-autocomplete').val(icon_title_and_nid);
  });
  ////////////////////////////////////////
  // End setup for Better Icon Lookup View
  ////////////////////////////////////////


  function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    if (http.status != 404) {
      return true;
    }
    else {
      return false;
    }
  }



})(jQuery, Drupal, once);
