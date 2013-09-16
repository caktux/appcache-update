;(function($, window, document, undefined) {

  /**
   * AppCache update progress
   */
  AppCache = $.extend(window.applicationCache, {
    debug: false,
    autoswap: false,
    showUpdateProgress: true,
    showUpdateNotice: true,
    handleLogout: false,
    logoutLink: 'a[href*=logout]',
    appStatus: 'online',
    appEvents: {},
    // Create a cache properties object to help us keep track of
    // the progress of the caching.
    filesDownloaded: 0,
    totalFiles: 0
    // TODO - Chrome ignores abort(), Safari gags a few times
    // allowUpdateFlag: false,
    mobileIndicator: '#mobile-refresh',
    // Get the total number of files in the cache manifest,
    // parsing the manifest file on the first run to count
    // the number of files, then store the total with
    // localStorage
    getTotalFiles: function() {
      // Check the total file count and reset download count.
      AppCache.filesDownloaded = 0;
      var lastTotalFiles = (localStorage.getItem('appCacheTotalFiles')) ? JSON.parse((localStorage.getItem('appCacheTotalFiles'))) : 0;
      AppCache.totalFiles = lastTotalFiles;

      if (lastTotalFiles) return lastTotalFiles;

      // Or grab the cache manifest file.
      $.ajax({
        type: "GET",
        url: "/appcache.manifest",
        dataType: "text",
        cache: false,
        success: function( content ) {
          // Strip out the non-cache sections.
          // NOTE: The line break here is only to prevent
          // wrapping in the BLOG.
          content = content.replace(
            new RegExp(
              "(NETWORK|FALLBACK):" +
              "((?!(NETWORK|FALLBACK|CACHE):)[\\w\\W]*)",
              "gi"
              ),
              ""
          );
          // Strip out all comments.
          content = content.replace(
            new RegExp( "#[^\\r\\n]*(\\r\\n?|\\n)", "g" ),
              ""
          );
          // Strip out the cache manifest header and
          // trailing slashes.
          content = content.replace(
            new RegExp( "CACHE MANIFEST\\s*|\\s*$", "g" ),
              ""
          );
          // Strip out extra line breaks and replace with
          // a hash sign that we can break on.
          content = content.replace(
            new RegExp( "[\\r\\n]+", "g" ),
              "#"
          );
          // Get the total number of files.
          var totalFiles = content.split( "#" ).length + 1;
          // Store the total number of files. Here, we are
          // adding one for *THIS* file, which is cached
          // implicitly as it points to the manifest.
          AppCache.totalFiles = totalFiles;
          localStorage.setItem('appCacheTotalFiles', JSON.stringify(totalFiles));
          return totalFiles;
        }
      });
    },

    // Calls update() and force a page refresh on updateready, used for logout
    reloadCaches: function(loadingElement) {
      $(AppCache).on('updateready', function(e) {
        loadingElement.remove();
        window.location.reload();
      }, false);
      AppCache.update();
    },

    // Display the download progress.
    displayProgress: function() {
      // Check to see if we have a total number of files.
      if (AppCache.totalFiles) {
        // We have the total number of files, so output the
        // running total as a function of the known total.
        AppCache.cacheProgress =
          AppCache.filesDownloaded + " " + 
          'of ' +
          AppCache.totalFiles + " " +
          'files downloaded.';
      } else {
        // We don't yet know the total number of files, so
        // just output the running total.
        AppCache.cacheProgress =
          AppCache.filesDownloaded + " " +
          'files downloaded.';
      }
      $('#appCacheProgress').text(AppCache.cacheProgress);
    },

    // Log an event to the event list.
    logEvent: function (event) {
      // AppCache.appEvents += event;
      $('#appCacheEvents').prepend(
        "<li>" +
          (event + " at " + (new Date()).toTimeString()) +
        "</li>"
      );
      // $('#appcache-debug').scrollTop($('#appcache-debug')[0].scrollHeight);
    }
  });

  // This gets fired when new cache files have been downloaded
  // and are ready to replace the *existing* cache. The old
  // cache will need to be swapped out.
  $(AppCache).on("updateready", function( event ) {
    // Swap out the old cache.
    if (AppCache.autoswap || AppCache.showUpdateProgress) window.applicationCache.swapCache();
    if (AppCache.showUpdateProgress) {
      // Remove previous messages (inactive tabs)
      var removeUpdateNotice = function() {
        $('#appcache-update-available').remove();
      }
      removeUpdateNotice();

      // Remove update progress
      $('#appcache-update-progress').addClass('slideout');

      if ( typeof(navigator.standalone) != 'undefined' && navigator.standalone ) {
        $(AppCache.mobileIndicator).css('text-shadow', '0 0 5px #fff');
      }
      else {
        var updateElement = $('<div id="appcache-update-available">Update available, <a href="#">refresh</a>?</div>');
        updateElement.appendTo('body');
        setTimeout( function() { updateElement.addClass('slidein'); }, 1);
        updateElement.find('a').on('click', function(e) {
          e.preventDefault(); e.stopPropagation();
          updateElement.removeClass('slidein');
          setTimeout( function() {
            window.location.reload();
          }, 300);
        });
      }
    }
    // if (allowUpdateFlag) {
      // window.location.reload();
    // }
    if (AppCache.debug) {
      AppCache.logEvent( "New cache available, swapping it in." );
      $('#applicationEvents').text(AppCache.appEvents);
    }
  });

  // This gets fired when the browser is downloading the files
  // defined in the cache manifest.
  $(AppCache).on("downloading", function( event ) {
    // Get the total number of files in our manifest.
    AppCache.getTotalFiles();

    // Inject our update-progress
    if (AppCache.showUpdateProgress) {
      var progressElement = $('<div id="appcache-update-progress"><div id="appcache-progress-status"></div></div>');
      progressElement.appendTo('body');
    }

    if (AppCache.debug) {
      // if (allowUpdateFlag) {
        AppCache.logEvent( "Downloading cache" );
      // }
      // else {
        // logEvent( "Abording automatic download" );
        // appCache.abort();
      // }
      $('#applicationEvents').text(AppCache.appEvents);
    }
  });

  // This gets fired for every file that is downloaded by the
  // cache update.
  $(AppCache).on("progress", function( event ) {
    // Increment the running total.
    filesDownloaded = AppCache.filesDownloaded++;
    localStorage.setItem('appCacheTotalFiles', JSON.stringify(filesDownloaded));

    // Update our progress bar
    if (AppCache.showUpdateProgress) {
      var filesPercent = filesDownloaded * 100 / AppCache.totalFiles;
      var progressElement = $('#appcache-progress-status');
      progressElement.css('width', filesPercent + '%');
    }

    if (AppCache.debug) {
      // if (allowUpdateFlag) {
        AppCache.logEvent( "File downloaded" );
      // }
      // else {
        // logEvent( "Abording automatic download" );
        // appCache.abort();
      // }
      $('#applicationEvents').text(AppCache.appEvents);

      // Show the download progress.
      AppCache.displayProgress();
    }
  });

  if (AppCache.handleLogout) {
    $(AppCache.logoutLink).on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).append($('<span id="logout-loading"><span>&nbsp;&nbsp;</span><i class="icon-spinner icon-spin"></i></span>'));
      $.ajax({
        url: $(this).attr('href'),
        type: 'GET'
      }).done( function(data) {
        AppCache.reloadCaches($('#logout-loading'));
      });
    });
  }

  // Debug events
  if (AppCache.debug) {
    AppCache.appStatus = '';

    // Set the initial status of the application.
    AppCache.appStatus = ( navigator.onLine ? "online" : "offline" );
    $('#appCacheStatus').text(AppCache.appStatus);

    // Bind to online/offline events.
    $(window).on("online offline", function( event ) {
      AppCache.appStatus = ( navigator.onLine ? "online" : "offline" ); // Update the online status.
      $('#appCacheStatus').text(AppCache.appStatus);
    });

    // List for checking events. This gets fired when the browser
    // is checking for an udpated manifest file or is attempting
    // to download it for the first time.
    $(AppCache).on("checking", function( event ){
      AppCache.logEvent( "Checking for manifest" );
      $('#applicationEvents').text(AppCache.appEvents);
    });

    // This gets fired if there is no update to the manifest file
    // that has just been checked.
    $(AppCache).on("noupdate", function( event ){
      AppCache.logEvent( "No cache updates" );
      $('#applicationEvents').text(AppCache.appEvents);
    });

    // This gets fired when the cache manifest cannot be found.
    $(AppCache).on("obsolete", function( event ) {
      AppCache.logEvent( "Manifest cannot be found" );
      $('#applicationEvents').text(AppCache.appEvents);
    });

    // This gets fired when all cached files have been
    // downloaded and are available to the application cache.
    $(AppCache).on("cached", function( event ) {
      AppCache.logEvent( "All files downloaded" );
      $('#applicationEvents').text(AppCache.appEvents);
    });

    // This gets fired when an error occurs
    $(AppCache).on("error", function( event ) {
      AppCache.logEvent( "An error occurred" );
      $('#applicationEvents').text(AppCache.appEvents);
    });


    // Debug output

    // Get the DOM references we'll need to play with.
    var updateDiv = $('\
      <div id="appcache-debug">\
        <span id="appCacheStatus">Online</span> - \
        <a id="appCacheUpdate" href="#">check for update</a><br />\
        Progress: <span id="appCacheProgress">N/A</span><br />\
        <ul id="appCacheEvents"></ul>\
      </div>').css({
        background: 'rgba(0,0,0,.35)',
        'line-height': '1em',
        'max-height': '7em',
        width: '98%',
        padding: '0.5em 1%',
        position: 'absolute',
        'text-align': 'left',
        top: 63,
        left: 0,
        'overflow-y': 'scroll',
        'z-index': 900,
    });
    $('body').append(updateDiv);

    var appStatus = $( "#appCacheStatus" );
    var appEvents = $( "#appCacheEvents" );
    var appUpdate = $( "#appCacheUpdate" );
    var cacheProgress = $( "#appCacheProgress" );

    // Bind the manual update link.
    appUpdate.on('click', function( event ) {
      // Prevent the default event.
      event.preventDefault();
      // Manually ask the cache to update.
      $(AppCache).update();
      // allowUpdateFlag = true;
    });
  }
})(window.jQuery || window.Zepto, window, document);