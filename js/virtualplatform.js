(function ($, Drupal, once) {
  $(document).ready(function() {
    console.log("Loaded virtual platform.");

    checkIfInIframe();

    // Make "Add another item" link on the IEF entity reference list into a button:
    $('.field-add-more-submit').addClass('btn-primary');

    ///////////////////////////
    // Start draggable grid. //
    ///////////////////////////
    $('#edit-field-icon-wrapper').after('<div id="draggable-grid" class="gridly"></div>');


    // identify an element to observe
    if ($("#node-board-form #edit-field-icon").length > 0) {
      const elementToObserve = document.querySelector("#edit-field-icon");
      // create a new instance of `MutationObserver` named `observer`,
      // passing it a callback function
      const observer = new MutationObserver(() => {
        // console.log('callback that runs when observer is triggered');
        console.log("The inline entity reference field changed.");
        // initializeIconGrid();
      });
      // call `observe()` on that MutationObserver instance,
      // passing it the element to observe, and the options object
      observer.observe(elementToObserve, {subtree: true, childList: true});
    }

    // function reorderDraggableList() {
    //   var num_icons_in_list = $('#draggable-grid .draggable-icon').length;
    //
    //   $('#draggable-grid .draggable-icon').each(function() {
    //     var current_index = $(this).index();
    //     console.log("current_index: " + current_index);
    //
    //     var original_index = $(this).find("img").data('originalOrder');
    //     console.log("originalOrder: " + original_index);
    //     $('#edit-field-icon-entities-' + original_index + '-delta').val(current_index).change();
    //   });
    // }
    function checkIfInIframe() {
      if ( window.location !== window.parent.location ) {
        $('body').addClass('iframe');
      } else {
        // The page is not in an iframe
      }
    }

    function initializeIconGrid() {
      $("#draggable-grid").empty();
      $('#ief-entity-table-edit-field-icon-entities tr.draggable').each(function() {
        // Duplicate this image.
        // make sure the img tag itself isn't draggable. (otherwise, we can drag the img rather than the entire icon.)
        // put it in the draggable-grid;
        // and wrap it with a (draggable) ".draggable-icon" div.
        var index = $(this).index();
        if (!$(this).hasClass("ready-to-drag")) {
          console.log("Setting up icon " + index);
          $(this).addClass("original-order-" + index);
          $(this).find("img").clone().addClass('original-order-' + index).attr('data-original-order', index).attr('draggable','false').appendTo('#draggable-grid').wrap('<div class="brick small draggable-icon ready-to-drag"></div>');
        }

        // this ensures the icon is a square.
        var icon_width = $(".draggable-icon").width();
        $('.draggable-icon').css('height', icon_width);
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
        // console.log($elements);

        // reorderDraggableList();
        // var num_icons_in_list = $('#draggable-grid .draggable-icon').length;
        // $('#draggable-grid .draggable-icon').each(function() {
        //   var current_index = $(this).index();
        //   console.log("current_index: " + current_index);

        //   var original_index = $(this).find("img").data('originalOrder');
        //   console.log("originalOrder: " + original_index);
        //   $('#edit-field-icon-entities-' + original_index + '-delta').val(current_index).change();
        // });

        // var count = 0;
        // for (board_icon in $grid_icons) {
        //   console.log(board_icon);
        //   // var img_url = board_icon.firstChild.currentSrc;
        //   // console.log(count + ": " + img_url);
        //   count++;
        // }
        $grid_icons.each(function(count) {
          // console.log($grid_icons[count].firstChild);

          var current_icon_image = $grid_icons[count].firstChild.currentSrc;
          var current_icon_original_order = $grid_icons[count].firstChild.dataset.originalOrder;
          // var current_icon_original_order = $(this).find("img").data('originalOrder');
          // console.log("originalOrder: " + current_icon_original_order);
          $('#edit-field-icon-entities-' + current_icon_original_order + '-delta').val(count).change();
        });


      }

      // console.log(reordered.Prototype);


      // Initialize Gridly
      $('.gridly').gridly({
        base: 60, // px
        gutter: 0, // px
        columns: 8
      });

      $('.gridly').gridly({
        callbacks: { reordering: reordering , reordered: reordered }
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

    initializeIconGrid();




  });
})(jQuery, Drupal, once);
