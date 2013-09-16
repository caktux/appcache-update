appcache-update
===============

HTML5 AppCache update progress plugin


### Requirements ###

* A working appcache manifest enabled website


### Features and usage ###

* Displays a progress bar when the appcache is downloading a new version
  * <code>AppCache.showUpdateProgress</code> (default: <code>true</code>)
* Displays a notice and refresh link
  * <code>AppCache.showUpdateNotice</code> (default: <code>true</code>)
* Keeps track of the total number of files in the appcache with localStorage
  * <code>AppCache.totalFiles</code> (default: <code>true</code>)
* Optional logout link handling
  * <code>AppCache.handleLogout</code> (default: <code>false</code>)
* Optional autoswap to trigger swapCache() (default: <code>false</code>, automatic with <code>showUpdateNotice</code>)
* Provides debug information regarding the appcache
  * <code>AppCache.debug</code> (default: false)
* Use CSS to change the look and transitions
  * Container: <code>#appcache-update-available</code>
    * with transition (top 0.4s ease-out)<code>#appcache-update-available.slidein</code>
  * Progress container: <code>#appcache-update-progress</code>
    * with transition: <code>#appcache-update-progress.slideout</code>
  * Progress status: <code>#appcache-progress-status</code> (width gets updated)


*Credits to Ben Nadel's [blog post](http://www.bennadel.com/blog/2029-Using-HTML5-Offline-Application-Cache-Events-In-Javascript.htm)*  
