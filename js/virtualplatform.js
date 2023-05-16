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
    // const better_icon_lookup_element = document.querySelector(".region-content");

    // if ($('#inline-entity-form-field_icon-form').length > 0) {
    //   const better_icon_lookup_element = document.querySelector("#inline-entity-form-field_icon-form");

    if ($('.path-icons .region-content').length > 0) {
      const better_icon_lookup_element = document.querySelector(".path-icons .region-content");
      const better_icon_lookup_observer = new MutationObserver(() => {
        console.log("The Better Icon Lookup view changed.");
        setupBetterIconLookupView();
        formatIconViews();
      });
      better_icon_lookup_observer.observe(better_icon_lookup_element, {subtree: true, childList: true});
    }

    else if ($('#block-views-block-better-icon-lookup-block-1').length > 0) {
      const better_icon_lookup_element = document.querySelector(".region-content");
      const better_icon_lookup_observer = new MutationObserver(() => {
        console.log("The Better Icon Lookup view changed.");
        setupBetterIconLookupView();
        formatIconViews();
      });
      better_icon_lookup_observer.observe(better_icon_lookup_element, {subtree: true, childList: true});
    }

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


    // start interactions
    // add a button to interaction nodes. once clicked, it will send the current URL to the AAC simulator space.
    $('.page-node-type-interaction #block-virtualplatform-content').append('<div class="interaction-launch-controls"><button class="btn button btn-primary launch-environment">Open in the virtual environment</button></div>')
    $(document).on("click", ".launch-environment", function(event) {
      // var board_url = $('.field--name-field-board .field__item a').attr('href');
      // if (board_url.indexOf("http") === -1) {
      //   board_url = window.location.protocol + '//' + window.location.hostname + board_url + "\#full-screen";
      // }
      var current_url = window.location;
      console.log("Loading " + current_url);
      window.open("https://aac-simulator.glitch.me?node=" + current_url);
    });



    ///////////////////////////////
    // Start full screen preview //
    ///////////////////////////////
    function turnOnFullScreenPreview() {
      $("body").addClass('full-screen-preview');
      window.location.hash = "full-screen";
      $("#block-fullscreenboardbutton .btn").text("Exit full screen view");
      formatViewBoardNode();
    }

    function turnOffFullScreenPreview() {
      // Only turn off the full screen preview if we're currently in full screen preview mode.
      if ($("body").hasClass('full-screen-preview')) {
        // only toggle off the full screen preview if we're logged in.
        if ($("body.user-logged-in").length > 0) {
          $("body").removeClass('full-screen-preview');
          $("#block-fullscreenboardbutton .btn").text("Full screen view");
          window.location.href = window.location.href.split('#')[0];
          formatViewBoardNode();
        }
      }
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


    // Start spinner/throbber overlay toggle
    function turnOffSpinner() {
      $("body").removeClass('loading-spinner');
    }

    function turnOnSpinner() {
      $("body").addClass('loading-spinner');
    }

    function toggleSpinner() {
      if ($("body").hasClass('loading-spinner')) {
        turnOffSpinner();
      }
      else {
        turnOnSpinner();
      }
    }
    // End spinner/throbber


    var current_number_of_icons = $('.ief-row-entity').length;

    // Make "Add another item" link on the IEF entity reference list into a button:
    $('.field-add-more-submit').addClass('btn-primary');
    $(".form-item-field-icon-actions-bundle select").val('icon'); // force the (bugged) content type select box to always be "icon".


    ///////////////////////////
    // Start draggable grid. //
    ///////////////////////////

    // 1. Create the container for the draggable grid.
    $('#edit-field-icon-wrapper').after('<div id="draggable-grid" class="gridly"></div>');
    // $('#node-board-edit-form').after('<div id="draggable-grid" class="gridly"></div>'); // this is for performance reasons.

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
        if ($('.fieldset-legend:contains("Add existing button")').length > 0) {
          console.log("We are adding an existing icon.");
          $('#block-views-block-better-icon-lookup-block-1').css("display","block");
          formatIconViews();
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

        // Reinitialize the entire draggable grid.
        initializeIconGrid();


        changeContentItemToIcon();
        addScaleSlider(); // add the icon scale slider if it doesn't already exist.
      });
      observer.observe(elementToObserve, {subtree: true, childList: true});
    }

    // 3. Change "Content item" on the buttns "Create content item", "Add existing content item", and "Add new content item" to read "icon" instead.
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
    }

    // 4. make links in /icons view sort taxonomy terms in the /icons view instead of the default taxonomy term view.
    // https://virtual.wintersandassociates.com/icons?title=&tid=Flaticon+Animal+Pack&field_public_value=All
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
        var image_scale = $(this).find('.field--name-field-image-scale').text();
        // console.log(this_image);

        console.log("Setting up icon " + index + '("' + icon_title + '")');

        $(this).addClass("original-order-" + index);
        $(this).attr('data-original-order', index);

        $('#draggable-grid').addClass('view-icons-on-this-board').append('<div class="views-row brick small draggable-icon original-order-' + index + '"></div>');

        // format the icon.
        $('.draggable-icon.original-order-' + index).append('<div class="views-field-field-text-above-icon">' + text_above + '</div>');

        if (this_image) {
          $('.draggable-icon.original-order-' + index).append('<div class="views-field-field-image"><img src="' + this_image + '"/></div>');
        }
        else {
          $('.draggable-icon.original-order-' + index).addClass("no-image");
        }

        $('.draggable-icon.original-order-' + index).append('<div class="views-field views-field-field-image-scale"><div class="field-content">' + image_scale + '</div></div>');

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

    formatIconViews();

    // if ($('#block-views-block-icons-on-this-board-block-1').length > 0) {
    //   var number_of_columns_in_grid = $('.field--name-field-number-of-columns .field__item').text();
    //   var tile_width = 100 / number_of_columns_in_grid;
    //   $('#block-views-block-icons-on-this-board-block-1 .views-row').css("width", tile_width + '%');
    // }

    ////////////////////////////////////
    // When this page is in an iframe //
    ////////////////////////////////////

    // Send message to the parent...
    // 1. When hovering over an icon
    // if (isInIframe) {
      // $('iframe').parent().get(0).contentWindow.focus();
      if (window.location !== window.parent.location) {
        // turn full-screen on.
        var current_location = window.location;
        window.location = window.location + "#full-screen";
        $('body').addClass('full-screen-preview');
        formatViewBoardNode();
        // console.log ("this is in an iframe, but not the way we tried before.");
      }

      // communicate with iframes
      $('.view-icons-on-this-board .views-row').hover(
        function() {
          var this_index = $(this).index();
          $('.view-icons-on-this-board .views-row').removeClass("highlighted-icon");
          $('.view-icons-on-this-board .views-row:eq(' + this_index + ')').addClass("highlighted-icon");
          window.top.postMessage('icon-selected' + '|||' + this_index, '*');
        },
        function() {
          $('.view-icons-on-this-board .views-row').removeClass("highlighted-icon");
          window.top.postMessage('icon-selected' + '|||' + 'none', '*');
        }
      );
    // }

    // Recieve message from parent
    // 1. comes in the form of 'highlight-icon|||10'
    //    This tells us to add the class 'highlighted-icon' to the 10th icon on this board.
    window.onmessage = function(e) {
      var sanitized_input = e.data.split("|||");
      if (sanitized_input[0] == 'highlight-icon') {
        console.log("highlighting icon #" + sanitized_input[1]);
        $('.view-icons-on-this-board .views-row').removeClass("highlighted-icon");
        $('.view-icons-on-this-board .views-row:eq(' + sanitized_input[1] + ')').addClass("highlighted-icon");
      }
    };
  });

  /////////////////////////////////
  // Start AJAX node create/view //
  /////////////////////////////////
  function getNode() {
    var this_node_json = {};
    var ajaxExecute = $.ajax({
      url: "https://virtual.wintersandassociates.com/node/76?_format=json",
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      success: function(data, status, xhr) {
        console.log("Got the node!");
        console.log(data);
        // this_node_json = data;
      }
    });
    ajaxExecute.done(function() { // TODO: ACTUALLY USE THIS AND .fail
      // alert( "success" );
    })
    .fail(function() {
        // alert( "error" );
    })
  }

  function getCsrfToken(callback) {
    jQuery
      .get(Drupal.url('session/token'))
      .done(function (data) {
        var csrfToken = data;
        callback(csrfToken);
      });
  }

  function postNode(csrfToken, node) {
    jQuery.ajax({
      url: 'https://virtual.wintersandassociates.com/node?_format=json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      data: JSON.stringify(node),
      success: function (node) {
        console.log(node);
      }
    });
  }

  var newNode = {
    // '_links': {
    //   'type': {
    //     'href': 'https://virtual.wintersandassociates.com/rest/type/node/basic_page'
    //   }
    // },
    'type': [{
      'target_id': 'basic_page'
    }],
    'title': {
      'value': 'Example node title'
    }
  };

  function patchNode(csrfToken, node_id, node) {
    jQuery.ajax({
      url: 'https://virtual.wintersandassociates.com/node/' + node_id + '?_format=json',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      data: JSON.stringify(node),
      success: function (node) {
        console.log(node);
      }
    });
  }

  function incrementClickCount(this_icon_index, node_id) {
    // 1. Get this Interaction node as an object.
    // var this_node = getNode();
    // console.log(this_node);
    //
    // // build the node object.
    // //
    // var clicks_field_in_db = 'field_clicks_on_icon_' + $(this).index();
    // console.log("updating field " + clicks_field_in_db);
    // var number_of_clicks = this_node.clicks_field_in_db;

    // console.log(number_of_clicks);
    var this_node_json = {};
    var ajaxExecute = $.ajax({
      url: 'https://virtual.wintersandassociates.com/node/' + node_id + '?_format=json',
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      success: function(data, status, xhr) {
        // console.log("Got the node:");
        // console.log(data);

        var clicks_field_in_db = 'field_clicks_on_icon_' + this_icon_index;
        var number_of_clicks = 0; // By default, an icon has been clicked 0 times.

        // If it the resulting array isn't empty, we want to get the number of clicks.
        if (data[clicks_field_in_db].length > 0) {
          number_of_clicks = data[clicks_field_in_db][0].value;
          console.log(data[clicks_field_in_db][0].value);
        }

        console.log("Number of times icon " + this_icon_index + " has been clicked: " + number_of_clicks);

        // ACTUALLY INCREMENT NUMBER OF CLICKS
        number_of_clicks = number_of_clicks + 1;

        var new_click_object = {value: number_of_clicks};
        console.log(new_click_object);

        // data.[clicks_field_in_db][new_click_object];

        $.extend(true, data, {
          [clicks_field_in_db]: new_click_object
        });
        console.log(data);

        // now it's time to update the node!
        getCsrfToken(function (csrfToken) {
          patchNode(csrfToken, node_id, data);
        });
      }
    });
    ajaxExecute.done(function() { // TODO: ACTUALLY USE THIS AND .fail
      // alert( "success" );
    })
    .fail(function() {
        // alert( "error" );
    })



  }

  // only allowe clicks on icons when we're in full-screen mode ON AN INTERACTION NODE.
  $(document).on("click", ".page-node-type-interaction.full-screen-preview .view-icons-on-this-board .views-row", function(event) {
    console.log("Clicked on an icon.");
    var this_node_id = $('.view-this-node-id .views-field-nid').text();
    var this_icon_index = $(this).index() + 1;
    incrementClickCount(this_icon_index, this_node_id);
  });
  ///////////////////////////////
  // End AJAX node create/view //
  ///////////////////////////////



  /////////////////////////////
  // Start image size slider //
  /////////////////////////////
  // todo: make this respect the editor.
  function addScaleSlider() {
    if ($('#image-scale-slider').length < 1) {
      // 1. Get the label for the image field (we don't always know if the label will be changed.)
      var imageScaleTextboxLabel = $(".node-form label:contains('Image Scale'), label:contains('Image scale')");

      // 2. The element to add.
      var sliderToAppendToScaleField = '<div id="image-scale-slider-wrapper"><div id="image-scale-slider"><div class="ui-slider-handle"></div></div></div>';
      // 1. Board edit page (using inline entity form)
      // as well as icon edit page (not using inline entity form)
      imageScaleTextboxLabel.parent().append(sliderToAppendToScaleField);

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
    addEmptyIcons();
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
    formatIconViews();
  });
  ////////////////
  // End gridly //
  ////////////////


  // Format the "Icons on this board" view found on Board nodes (/node/123, not /node/123/edit)
  // (This fixes the display of icons so they're squares.)
  // Todo: merge this into the icon formatter.
  function formatViewBoardNode() {
    if ($('.view-icons-on-this-board').length > 0) {
      var num_columns = 8;
      // if ($('.field--name-field-number-of-columns .field__item').text() != "8") {
        // num_columns = $('.field--name-field-number-of-columns .field__item').text();
      // }

      var max_width_total = $('.view-icons-on-this-board').width();
      var max_width_individual =  Math.floor(max_width_total / num_columns);
      // this ensures all icons are the same square size
      console.log("Formatting the icons on this board to " + max_width_individual + "px square.");
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

        // get the width of the current icon tile (.views-row), then calculate the proportion of the tile at 1000px wide.
        var image_width_as_percentage = image_size_native / $(this).width() * 100;

        // This is just for debug purposes. In production, it doesn't matter if the image exists or not.
        // if (image_size_native_width) {
        //   console.log("Native icon size: " + image_size_native_width + " by " + image_size_native_height);
        //   console.log("Icon size: " + image_width_as_percentage);
        // }

        $(this).find('.views-field-field-image').css('background-size', 33.33 * image_scale + "%"); // default image width is 33.33% of the icon (.views-row).

        // 3. Set the background colour of this icon.
        var background_color_for_this_icon = $(this).find('.views-field-field-color .field-content').text();
        $(this).css("background-color", background_color_for_this_icon);
        // Set text color based on background color.
        $(this).css("color", getTextColorBasedOnBackgroundColor(background_color_for_this_icon));

        // 4. Make sure the text doesn't overflow,
        //    Then run fittext on them.
        $(".views-field-field-text-above-icon, .views-field-field-text-below-icon").each(function() {
          $(this).width(max_width_individual - 10);
          $(this).fitText();
        });

        // 5. if there's fewer than 32 icons (by default), make the board show empty spaces.
        addEmptyIcons();
      });
    }
  }

  // these are views of icons ONLY. NOT THE BOARD.
  function formatIconViews() {
    console.log("formatting icon views.");

    // if ($('.view-icons-on-this-board.view-better-icon-lookup').length == 0) {
    //   $('.view-icons-on-this-board').addClass('view-better-icon-lookup');
    // }
    // if ($('.view-better-icon-lookup').length > 0) {
      // var num_columns = $('.field--name-field-number-of-columns .field__item').text();
      // var max_width_total = $('.view-icons-on-this-board').width();
      // var max_width_individual =  Math.floor(max_width_total / num_columns);
      // console.log("Formatting the icons on this board to " + max_width_individual + "px square.");

      // Add the Bootstrap tooltips to each icon: https://getbootstrap.com/docs/5.0/components/tooltips/
      // $('.views-better-icon-lookup .views-row').attr({
      //   'data-bs-toggle': "tooltip",
      //   'data-bs-html': "true",
      //   'title': "<em>Tooltip</em> <u>with</u> <b>HTML</b>"
      // });

      // this ensures the icon is a square.
      var icon_height = $('.view-better-icon-lookup .views-row:first-child').width();
      $('.view-better-icon-lookup .icon-and-text').css('width', icon_height);
      $('.view-better-icon-lookup .views-field-field-image, .view-better-icon-lookup .icon-and-text').css('height', icon_height);

      $('.view-better-icon-lookup .views-row, .view-icons-on-this-board .views-row').each(function() {
        // 0; is this supposed to be hidden altogether?
        // First, check if this is unpublished.
        if ($(this).find('.views-field-status .field-content').text().trim() == "False") {
          $(this).remove();
          console.log("This icon is unpublished and isn't supposed to be here!");
        }
        // Next, check if it's supposed to be public in the first place.
        else if ($(this).find('.views-field-field-public .field-content').text().trim() == "False") {
          $(this).remove();
          console.log("This icon is not set to be public and isn't supposed to be here!");
        }
        else {
          console.log("we are allowed to see this button.");

          // 1. Change the img src to the background.
          var image_url = $(this).find("img").attr("src");
          $(this).find('.views-field-field-image').css('background-image', 'url("' + image_url + '")');

          // If there's no image, just make the text flow rather than be absolutely
          // positioned to the top and bottom.
          if (!image_url) {
            if ($(this).find('.icon-and-text').length > 0) {
              $(this).find('.icon-and-text').addClass("no-image");
            }
            else {
              $(this).children().wrapAll('<div class="icon-and-text"></div>');
            }
          }

          // 2. Set the background scale of this icon.
          var image_scale = $(this).find('.views-field-field-image-scale .field-content').text();
          if (!image_scale) { // this probably isn't necessary any longer. All icons should have a scale by default.
            image_scale = 1;
          }
          var image_size_native_width = $(this).find('img').attr('width');
          var image_size_native_height = $(this).find('img').attr('height');

          var image_size_native = image_size_native_width;
          if (image_size_native_height > image_size_native_width) {
            image_size_native = image_size_native_height;
          }

          // get the width of the current icon tile (.views-row), then calculate the proportion of the tile at 1000px wide.
          var image_width_as_percentage = image_size_native / $(this).find('.views-field-field-image').width() * 100;

          // This is just for debug purposes. In production, it doesn't matter if the image exists or not.
          // if (image_size_native_width) {
          //   console.log("Native icon size: " + image_size_native_width + " by " + image_size_native_height);
          //   console.log("Icon size: " + image_width_as_percentage);
          // }

          $(this).find('.views-field-field-image').css('background-size', 33.33 * image_scale + "%"); // default image width is 33.33% of the icon (.views-row).

          // 3. Set the background colour of this icon.
          var background_color_for_this_icon = $(this).find('.views-field-field-color .field-content').text();
          $(this).find('.icon-and-text').css("background-color", background_color_for_this_icon);
          // Set text color based on background color.
          $(this).find('.icon-and-text').css("color", getTextColorBasedOnBackgroundColor(background_color_for_this_icon));

          // 4. Make sure the text doesn't overflow,
          //    Then run fittext on them.
          // console.log("Icon height: " + icon_height);
          // if (icon_height == 0) {
          //   icon_height = $(this).width();
          //   console.log("Setting icon_height to " + icon_height);
          // }
          // when does this actually run?
          $(".views-field-field-text-above-icon, .views-field-field-text-below-icon").each(function() {
            // $(this).width(icon_height);
            // $(this).fitText();
          });
        }
      });

      // if ($('.view-better-icon-lookup .views-row').length == 0) {
      //   $('.view-better-icon-lookup .view-content').text("No buttons found.");
      // }
    // }
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
  // When the form changes, update the icon view AGAIN.
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
  // setupBetterIconLookupView();

  // click on an icon in Better Icon Lookup View to make it populate the autocomplete field.
  $(document).on("click", ".view-better-icon-lookup .views-field-nothing, .view-better-icon-lookup .use-this-icon", function(event) {
    var icon_title_and_nid = $(this).parent().find('.views-field-nid .field-content').text();
    console.log("Telling the autocomplete field to use '" + icon_title_and_nid + "'.");
    // console.log("There are " + $('.ief-form-bottom .form-autocomplete').length + " autocomplete fields.");
    $('.ief-form-bottom .form-autocomplete').val(icon_title_and_nid);
    $('#block-views-block-better-icon-lookup-block-1').css("display","none");

    $('.ief-form-bottom .ief-entity-submit').mousedown(); // we MUST use Mousedown, not .click() due to Drupal being Drupal.
  });
  ///////////////////////////////////////////
  // End setup for Better Icon Lookup View //
  ///////////////////////////////////////////

  function addEmptyIcons() {
    var maximum_number_of_icons = 32;

    // $('.view-icons-on-this-board, .view-icons-on-this-board .view-content').css('height', board_height);
    var num_icons = $('.view-icons-on-this-board .views-row').length;
    if (num_icons < maximum_number_of_icons) {
      var icons_to_add = maximum_number_of_icons - num_icons;
      for (let i = 0; i < icons_to_add; i++) {
        $('.view-icons-on-this-board .views-row:last-child').after('<div class="empty-icon views-row brick small draggable-icon" draggable="false" onmousedown="return false" ondragstart="return false;" ondrop="return false;"></div>');
      }
    }
  }


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


  // Check if we're in an iframe
  function isInIframe() {
    if (window.location !== window.parent.location) {
      console.log("this is in an iframe.");
      return true;
    } else {
      return false;
    }
  }
  // function isInIframe () {
  //   try {
  //       return window.self !== window.top;
  //   } catch (e) {
  //       return true;
  //   }
  // }



})(jQuery, Drupal, once);
