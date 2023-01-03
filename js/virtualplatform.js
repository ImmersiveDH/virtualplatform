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
    console.log("Loaded virtual platform.");

    checkIfInIframe();

    // Make "Add another item" link on the IEF entity reference list into a button:
    $('.field-add-more-submit').addClass('btn-primary');

    ///////////////////////////
    // Start draggable grid. //
    ///////////////////////////
    $('#edit-field-icon-wrapper').after('<div id="draggable-grid" class="gridly"><img src=""></div>');


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
        var max_width_individual = max_width_total / grid_columns;

        $('.gridly').gridly({
          base: max_width_individual, // px
          gutter: 0, // px
          columns: grid_columns
        });

        // we want to reset the grid height every time or else it runs into trouble when we resize.
        $('.draggable-icon').height(max_width_individual);
        $('.gridly').css('height', max_width_total / 2);

        $('.gridly').gridly({
          callbacks: { reordering: reordering , reordered: reordered }
        });
      }
      initGridly();

      // Resize the height of icons of the displayed board itself.
      function initBoardIcons() {
        var grid_columns = 8;
        var max_width_total = $('#block-views-block-icons-on-this-board-block-1').width();
        var max_width_individual = max_width_total / grid_columns;
        $('#block-views-block-icons-on-this-board-block-1 .views-row').height(max_width_individual);
      }
      initBoardIcons();

      $(window).resize(function() {
        initGridly();
        initBoardIcons();
      });


      if ($('#draggable-grid-after').length < 1) {
        $('#draggable-grid').after('<div id="draggable-grid-after"></div>');
        var i = 0;
        while (i < 16) {
          $('#draggable-grid-after').append('<div class="non-draggable-grid-item"></div>');
          i++;
        }
      }


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
