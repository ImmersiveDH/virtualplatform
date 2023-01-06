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
    var current_number_of_icons = $('.ief-row-entity').length;

    // Make "Add another item" link on the IEF entity reference list into a button:
    $('.field-add-more-submit').addClass('btn-primary');

    ///////////////////////////
    // Start draggable grid. //
    ///////////////////////////
    $('#edit-field-icon-wrapper').after('<div id="draggable-grid" class="gridly"><img src=""></div>');


    // identify an element to observe
    if ($("#node-board-edit-form #edit-field-icon-wrapper").length > 0) {
      const elementToObserve = document.querySelector("#edit-field-icon-wrapper");
      // create a new instance of `MutationObserver` named `observer`,
      // passing it a callback function
      const observer = new MutationObserver(() => {
        // console.log('callback that runs when observer is triggered');
        console.log("The inline entity reference field changed.");
        // initializeIconGrid();

        var icon_count = $('.ief-row-entity').length;
        if (current_number_of_icons != icon_count) {
          // Todo: this might break if we can somehow replace icons while keeping the total count the same.
          // it also won't work if we change the image of the icon when editing it.

          console.log("an icon has been added or removed. reinitializing the grid.");
          initializeIconGrid();
          current_number_of_icons = icon_count;
        }

        changeContentItemToIcon();

        // confirmOriginalOrder();
      });
      // call `observe()` on that MutationObserver instance,
      // passing it the element to observe, and the options object
      observer.observe(elementToObserve, {subtree: true, childList: true});
    }

    // function confirmOriginalOrder() {
    //   $('.draggable-icon img').each(function() {
    //     var original_index = $(this).attr('data-original-order');
    //     var img_src = $(this).attr('src');
    //     $('.field--name-field-image > img[src="' + img_src +'"]').parents('.ief-row-entity').attr('data-original-order', original_index);
    //     console.log("Updating icon at " + original_index);
    //   });
    //
    //   // $('.field--name-field-image > img').each(function() {
    //   //   var img_src = $(this).attr('src');
    //   //   var originalOrder =
    //   //   $()
    //   // });
    // }

    // Changes "Content item" on the buttns "Create content item", "Add existing content item", and "Add new content item" to read "icon" instead.
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

    }


    // function checkIfInIframe() {
    //   if ( window.location !== window.parent.location ) {
    //     $('body').addClass('iframe');
    //   } else {
    //     // The page is not in an iframe
    //   }
    // }

    function initializeIconGrid() {
      $("#draggable-grid").empty();
      $('#inline-entity-form-field_icon-form tr.ief-row-entity').each(function() {
        // Duplicate this image.
        // make sure the img tag itself isn't draggable. (otherwise, we can drag the img rather than the entire icon.)
        // put it in the draggable-grid;
        // and wrap it with a (draggable) ".draggable-icon" div.
        var index = $(this).index();
        // if (!$(this).hasClass("ready-to-drag")) {
          console.log("Setting up icon " + index);
          $(this).addClass("original-order-" + index);
          $(this).find("img").clone().addClass('original-order-' + index).attr('data-original-order', index).attr('draggable','false').appendTo('#draggable-grid').wrap('<div class="brick small draggable-icon original-order-' + index + '"></div>');
          $('.draggable-icon.original-order-' + index).attr('data-original-order', index).append('<div class="controls"><div class="edit">Edit</div></div>');
        // }
      });

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
      function initGridly() {
        // first add them up.
       //  var num_icons = $('.draggable-icon').length;
       //  while (num_icons < 32) {
       //   $('.gridly').append('<div class="draggable-icon not-draggable"></div>');
       //   num_icons++;
       // }

        var grid_columns = 8;
        var max_width_total = $('#draggable-grid').width();
        var max_width_individual =  Math.floor(max_width_total / grid_columns);

        // this ensures the icon is a square.
        $('.draggable-icon').css('height', max_width_individual).css('width', max_width_individual);

        $('.gridly').gridly({
          base: max_width_individual, // px
          gutter: 1, // px
          columns: grid_columns
        });

        // we want to reset the grid height every time or else it runs into trouble when we resize.
        // $('.draggable-icon').height(max_width_individual);
        // $('.gridly').css('height', 'max_width_total / 2);

        $('.gridly').gridly({
          callbacks: { reordering: reordering , reordered: reordered }
        });
      }
      initGridly();

      // Resize the height of icons of the displayed board itself.
      // function initBoardIcons() {
      //   var grid_columns = 8;
      //   var max_width_total = $('#block-views-block-icons-on-this-board-block-1').width();
      //   var max_width_individual = max_width_total / grid_columns;
      //   $('#block-views-block-icons-on-this-board-block-1 .views-row').height(max_width_individual);
      // }
      // initBoardIcons();

      $(window).resize(function() {
        initGridly();
        // initBoardIcons();
      });


      // if ($('#draggable-grid-after').length < 1) {
      //   $('#draggable-grid').after('<div id="draggable-grid-after"></div>');
      //   var i = 0;
      //   while (i < 16) {
      //     $('#draggable-grid-after').append('<div class="non-draggable-grid-item"></div>');
      //     i++;
      //   }
      // }


      // clicking the "edit" button on an icon in the grid triggers a click on the
      // "edit" button for the corresponding entry in the hidden inline entity form table
      $(document).on("click", ".draggable-icon .edit", function(event) {
        // var originalOrder = $(this).parent().parent().attr('data-original-order');
        // console.log("index of this button: " + originalOrder);
        // $('tr.original-order-' + originalOrder + ' .ief-entity-operations input[value="Edit"]').mousedown();
        var img_src = $(this).parents('.draggable-icon').find('img').attr('src');
        console.log("looking for this icon: " + img_src);
        $('.field--name-field-image > img[src="' + img_src +'"]').parents('.ief-row-entity').find('.ief-entity-operations input[value="Edit"]').mousedown();
      });

      // $(document).on("click", ".gridly .delete", function(event) {
      //   var $this;
      //   event.preventDefault();
      //   event.stopPropagation();
      //   $this = $(this);
      //   $this.closest('.brick').remove();
      //   return $('.gridly').gridly('layout');
      // });
      // $(document).on("click", ".add", function(event) {
      //   event.preventDefault();
      //   event.stopPropagation();
      //   $('.gridly').append(brick);
      //   return $('.gridly').gridly();
      // });

      // turn dragging off on display page,
      // turn dragging on for edit page.
      // $('.gridly').gridly('draggable', 'off'); // disables dragging
      // $('.gridly').gridly('draggable', 'on');  // enables dragging

      ////////////////
      // End Gridly //
      ////////////////
    }

    changeContentItemToIcon();
    initializeIconGrid();

  });
})(jQuery, Drupal, once);
