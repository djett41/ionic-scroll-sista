/* global angular,ionic */
(function (angular, ionic) {
  'use strict';

  angular.module('jett.ionic.scroll.sista', ['ionic'])
    .directive('scrollSista', ['$document', '$timeout', '$ionicScrollDelegate', function($document, $timeout, $ionicScrollDelegate) {
        var TRANSITION_DELAY = 400;
        var defaultDelay = TRANSITION_DELAY * 2;
        var defaultDuration = TRANSITION_DELAY + 'ms';
        var scaleHeaderElements = ionic.Platform.isAndroid() ? false : true;

      return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
          var body = $document[0].body;
          var scrollDelegate = $attr.delegateHandle ? $ionicScrollDelegate.$getByHandle($attr.delegateHandle) : $ionicScrollDelegate;
          var scrollView = scrollDelegate.getScrollView();

          //coordinates
          var y, prevY, prevScrollTop;
          //headers
          var cachedHeader, activeHeader, headerHeight, contentTop;
          //subheader
          var subHeader, subHeaderHeight;
          //tabs
          var tabs, tabsHeight, hasTabsTop = false, hasTabsBottom = false;

          //y position that will indicate where specific elements should start and end their transition.
          var headerStart = 0;
          var tabsStart = 0;
          var subheaderStart = 0;
          var defaultEnd, headerEnd, tabsEnd, subheaderEnd;

          /**
           * translates an element along the y axis by the supplied value.  if duration is passed in,
           * a transition duration is set
           * @param element
           * @param y
           * @param duration
           */
          function translateY (element, y, duration) {
            if (duration && !element.style[ionic.CSS.TRANSITION_DURATION]) {
              element.style[ionic.CSS.TRANSITION_DURATION] = duration;
              $timeout(function () {
                element.style[ionic.CSS.TRANSITION_DURATION] = '';
              }, defaultDelay, false);
            }
            element.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + (-y) + 'px, 0)';
          }

          /**
           * Initializes y and scroll variables
           */
          function initCoordinates () {
            y = 0;
            prevY = 0;
            prevScrollTop = 0;
          }

          /**
           * Initializes headers, tabs, and subheader, and determines how they will transition on scroll
           */
          function initElements () {
            cachedHeader = body.querySelector('[nav-bar="cached"] .bar-header');
            activeHeader = body.querySelector('[nav-bar="active"] .bar-header');

            if (!activeHeader) {
              return;
            }

            headerHeight = activeHeader.offsetHeight;
            contentTop = headerHeight;

            //tabs
            tabs = body.querySelector('.tabs');
            if (tabs) {
              tabsHeight = tabs.offsetHeight;
              if (tabs.parentNode.classList.contains('tabs-top')) {
                hasTabsTop = true;
                contentTop += tabsHeight;
              } else if (tabs.parentNode.classList.contains('tabs-bottom')) {
                hasTabsBottom = true;
              }
            }

            //subheader
            subHeader = body.querySelector('.bar-subheader');
            if (subHeader) {
              subHeaderHeight = subHeader.offsetHeight;
              contentTop += subHeaderHeight;
            }

            //set default end for header/tabs elements to scroll out of the scroll view and set elements end to default
            defaultEnd = contentTop * 2;
            headerEnd = tabsEnd = subheaderEnd = defaultEnd;

            //if tabs or subheader aren't available, set height to 0
            tabsHeight = tabsHeight || 0;
            subHeaderHeight = subHeaderHeight || 0;

            switch($attr.scrollSista) {
              case 'header':
                subheaderEnd =  headerHeight;
                tabsEnd = hasTabsTop ? headerHeight : 0;
                break;
              case 'header-tabs':
                headerStart = hasTabsTop ? tabsHeight : 0;
                subheaderEnd = hasTabsTop ? headerHeight + tabsHeight : headerHeight;
                break;
              case 'tabs-subheader':
                headerEnd = 0;
                headerStart = hasTabsTop ? contentTop - headerHeight : subHeaderHeight;
                tabsStart = hasTabsTop ? subHeaderHeight : 0;
                break;
              case 'tabs':
                headerEnd = 0;
                subheaderEnd =  hasTabsTop ? tabsHeight : 0;
                break;
              case 'subheader':
                headerEnd = 0;
                tabsEnd = 0;
                break;
              //defaults to header-tabs-subheader
              default:
                headerStart = hasTabsTop ? contentTop - headerHeight : subHeaderHeight;
                tabsStart = hasTabsTop ? subHeaderHeight : 0;
            }
          }

          /**
           * Translates active and cached headers, and animates active children
           * @param y
           * @param duration
           */
          function translateHeaders (y, duration) {
            var fadeAmt = 1 - (y / headerHeight);

            //translate active header
            translateY(activeHeader, y, duration);
            angular.forEach(activeHeader.children, function (child) {
              child.style.opacity = fadeAmt;
              if (scaleHeaderElements) {
                child.style[ionic.CSS.TRANSFORM] = 'scale(' + fadeAmt + ',' + fadeAmt + ')';
              }
            });
            //translate cached header
            translateY(cachedHeader, y, duration);
          }

          /**
           * Translates header and/or tabs elements and resets content top and/or bottom
           * @param y
           * @param duration
           */
          function translateElements (y, duration) {
            var contentStyle = $element[0].style;
            var headerY = y > headerStart ? y - headerStart : 0;
            var tabsY, subheaderY;

            ionic.requestAnimationFrame(function() {
              //subheader
              if (subHeader) {
                subheaderY =  y > subheaderStart ? y - subheaderStart : 0;
                translateY(subHeader, Math.min(subheaderEnd, subheaderY), duration);
              }

              //tabs
              if (tabs) {
                tabsY = Math.min(tabsEnd, y > tabsStart ? y - tabsStart : 0);

                if (hasTabsBottom) {
                  tabsY = -tabsY;
                  contentStyle.bottom = Math.max(0, tabsHeight - y) + 'px';
                }
                translateY(tabs, tabsY, duration);
              }

              //headers
              translateHeaders(Math.min(headerEnd, headerY), duration);

              //readjust top of ion-content
              contentStyle.top = Math.max(0, contentTop - y) + 'px';
            });
          }

          initCoordinates();

          //Need to reinitialize the values on refreshComplete or things will get out of wack
          $scope.$on('scroll.refreshComplete', function () {
            initCoordinates();
          });

          //If the header/tabs aren't all the way in when the view leaves, place them back at 0
          $scope.$parent.$on('$ionicView.leave', function () {
            var top = $element[0].style.top;
            if (top && top !== (contentTop + 'px')) {
              translateElements(0);
              initCoordinates();
            }
          });

          /**
           * Called onScroll.  computes coordinates based on scroll position and translates accordingly
           */
          $element.bind('scroll', function (e) {
            //Initializing onScroll prevents the race condition of active/cached headers not being correctly set in time
            if (!cachedHeader || !activeHeader) {
              initElements();
            }

            var duration = 0;
            var scrollTop = e.detail.scrollTop;

            y = scrollTop >= 0 ? Math.min(defaultEnd, Math.max(0, y + scrollTop - prevScrollTop)) : 0;

            //if we are at the bottom, animate the header/tabs back in
            if (scrollView.getScrollMax().top - scrollTop <= contentTop) {
              y = 0;
              duration = defaultDuration;
            }

            prevScrollTop = scrollTop;

            //if previous and current y are the same, no need to continue
            if (prevY === y) {
              return;
            }
            prevY = y;

            translateElements(y, duration);
          });

        }
      }
    }]);

})(angular, ionic);
