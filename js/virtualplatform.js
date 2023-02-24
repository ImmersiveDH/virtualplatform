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

    // 1. Create the container for the draggable grid.
    $('#edit-field-icon-wrapper').after('<div id="draggable-grid" class="gridly"></div>');

    // 2. Watch the icon entity reference field for changes.
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

        // Reinitialize the entire grid.
          initializeIconGrid();
          // current_number_of_icons = icon_count;
        // }

        changeContentItemToIcon();
        addScaleSlider(); // add the icon scale slider if it doesn't already exist.
      });
      observer.observe(elementToObserve, {subtree: true, childList: true});
    }

    // Change "Content item" on the buttns "Create content item", "Add existing content item", and "Add new content item" to read "icon" instead.
    function changeContentItemToIcon() {
      // buttons
      $('input[value="Add new content item"]').attr('value', 'Add new button');
      $('input[value="Add existing content item"]').attr('value', 'Add existing button');
      $('input[value="Add content item"]').attr('value', 'Add button');
      $('input[value="Create content item"]').attr('value', 'Create button');
      $('input[value="Update content item"]').attr('value', 'Update button');


      // headings/legends
      $(".fieldset-legend:contains(Add new content item)").text("Add new button");
      $(".fieldset-legend:contains(Add existing content item)").text("Add existing button");
      $(".fieldset-legend:contains(Add content item)").text("Add button");
      $(".ief-form-bottom label:contains(Content item)").text("Button name");

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


    // Intitialze draggable grid.
    function initializeIconGrid() {
      // 1. Clear the draggable grid every time; it can get full of broken icons otherwise.
      $("#draggable-grid").empty();

      // 2. Add each item in the IEF table to the draggable grid.
      $('#inline-entity-form-field_icon-form tr.ief-row-entity').each(function() {
        // Duplicate the image found in the inline entity form and copy it into the grid.
        // make sure the img tag itself isn't draggable. (otherwise, we can drag the img rather than the entire icon.)
        // put it in the draggable-grid;
        // and wrap it with a (draggable) ".draggable-icon" div.

        var index = $(this).index();
        var background_color = $(this).find('.field--name-field-color').text();
        var icon_title = $(this).find('.inline-entity-form-node-label').text();
        var text_above = $(this).find('.field--name-field-text-above-icon').text();
        var text_below = $(this).find('.field--name-field-text-below-icon').text();
        var this_image = $(this).find("img").attr('src');//.attr('draggable','false');
        console.log(this_image);

        console.log("Setting up icon " + index + '("' + icon_title + '")');

        $(this).addClass("original-order-" + index);
        $(this).attr('data-original-order', index);

        $('#draggable-grid').addClass('view-icons-on-this-board').append('<div class="views-row brick small draggable-icon original-order-' + index + '"></div>');

        // format the icon.
        $('.draggable-icon.original-order-' + index).append('<div class="views-field-field-text-above-icon">' + text_above + '</div>');
        $('.draggable-icon.original-order-' + index).append('<div class="views-field-field-image"><img src="' + this_image + '"/></div>');
        // $('.draggable-icon.original-order-' + index + ' .views-field-field-image').append(this_image);
        $('.draggable-icon.original-order-' + index).append('<div class="views-field-field-text-below-icon">' + text_below + '</div>');
        $('.draggable-icon.original-order-' + index).append('<div class="views-field-field-color"><div class="field-content">' + background_color + '</div></div>');
        $('.draggable-icon.original-order-' + index).attr('data-original-order', index);
        $('.draggable-icon.original-order-' + index).css("background-color", background_color);
        $('.draggable-icon.original-order-' + index).append('<div class="controls"><div class="edit">Edit</div><div class="remove">Remove</div></div>');
      });
      // End intitialze draggable grid.

      formatViewBoardNode();

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
          handle.text(Math.round($(this).slider("value") * 100) + "%");
        },
        value: imageScaleSliderTextbox.val(),
        min: 0.1,
        max: 3.0,
        // range: "min",
        step: 0.1,
        slide: function(event, ui) {
          console.log("image slider set to " + ui.value);
          handle.text(Math.round(ui.value * 100) + "%");
          imageScaleSlider.val(Number(ui.value));
          imageScaleSliderTextbox.val(ui.value);
        }
      });

      // and finally, we only show the image scale slider for authenticated users if there's an image.
      if ($('.image-preview').length > 0) {
        $('.field--name-field-image-scale').css("display", "block");
      }
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
  // TODO: FORMAT THIS FOR DIVS, NOT IMAGES.
  $(document).on("click", ".draggable-icon .edit", function(event) {
    // var img_src = $(this).parents('.draggable-icon').find('img').attr('src');
    // console.log("looking for this icon: " + img_src);
    // $('.field--name-field-image > img[src="' + img_src +'"]').parents('.ief-row-entity').find('.ief-entity-operations input[value="Edit"]').mousedown();

    var original_order = $(this).parents('.draggable-icon').attr("data-original-order");
    console.log("looking for icon #" + original_order);
    $('tr.original-order-' + original_order).find('.ief-entity-operations input[value="Edit"]').mousedown();
  });

  // clicking the "remove" button on an icon in the grid triggers a click on the
  // "remove" button for the corresponding entry in the hidden inline entity form table
  $(document).on("click", ".draggable-icon .remove", function(event) {
    // var img_src = $(this).parents('.draggable-icon').find('img').attr('src');
    // console.log("looking for this icon: " + img_src);
    // $('.field--name-field-image > img[src="' + img_src +'"]').parents('.ief-row-entity').find('.ief-entity-operations input[value="Remove"]').mousedown();
    var original_order = $(this).parents('.draggable-icon').attr("data-original-order");
    console.log("looking for icon #" + original_order);
    $('tr.original-order-' + original_order).find('.ief-entity-operations input[value="Remove"]').mousedown();
  });
  ////////////////////////////
  // End board editing page //
  ////////////////////////////


  ////////////////////////////////////////////////////////
  // Gridly (https://github.com/ksylvest/jquery-gridly) //
  ////////////////////////////////////////////////////////
  // Gridly callback functions
  // 1. Called before the drag and drop starts with the elements in their starting position.
  var reordering = function($grid_icons) {
    // console.log("Reordering the grid.");
  };
  // 2. Called after the drag and drop ends with the elements in their ending position.
  var reordered = function($grid_icons) {
    console.log("The grid has been reordered.");

    // Update the "sort order" select boxes in the IEF table.
    $grid_icons.each(function(index) {
      var current_icon_original_order = $grid_icons[index].dataset.originalOrder;
      // console.log("I'm going to look for icon number " + index);
      $('#edit-field-icon-entities-' + current_icon_original_order + '-delta').css("border", '1px solid red');
      // console.log("Found " + $('#edit-field-icon-entities-' + current_icon_original_order + '-delta').val());
      $('#edit-field-icon-entities-' + current_icon_original_order + '-delta').val(index).change();
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
        $(this).find('.views-field-field-image').css('background-image', 'url("' + image_url + '")');

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
        var image_size_native_width = $(this).find('img').attr('width');
        var image_size_native_height = $(this).find('img').attr('height');

        var image_size_native = image_size_native_width;
        if (image_size_native_height > image_size_native_width) {
          image_size_native = image_size_native_height;
        }

        console.log("Native icon size: " + image_size_native_width + " by " + image_size_native_height);


        // get the width of the current icon tile (.views-row), then calculate the proportion of the tile at 1000px wide.
        var image_width_as_percentage = image_size_native / $(this).width() * 100;

        console.log("Icon size: " + image_width_as_percentage);
        $(this).find('.views-field-field-image').css('background-size', 33.33 * image_scale + "%"); // default image width is 33.33% of the icon (.views-row).

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
