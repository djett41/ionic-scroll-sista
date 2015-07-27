(function (angular) {
  'use strict';

  angular.module('jett.ionic.scroll.sista', ['ionic'])
    .directive('scrollSista', function($document, $ionicScrollDelegate) {
      var TRANSITION_DURATION = '400ms';

      /**
       * translates an element along the y axis by the supplied value.  if duration is passed in,
       * a transition duration is set
       * @param element
       * @param y
       * @param duration
       */
      var translateY = function (element, y, duration) {
        if (duration) {
          element.style[ionic.CSS.TRANSITION_DURATION] = duration;
        }
        element.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + y + 'px, 0)';
      };

      //although we could have 1 animate function and has the platform check there, it would seem silly to have to
      //check the platform for every onScroll rather than just once, which is why they are split up.
      var animate;
      if (ionic.Platform.platform() === 'android') {
        animate = function (element, fadeAmt) {
          element.style.opacity = fadeAmt;
        };
      } else {
        animate = function (element, fadeAmt) {
          element.style.opacity = fadeAmt;
          element.style[ionic.CSS.TRANSFORM] = 'scale(' + fadeAmt + ',' + fadeAmt + ')';
        };
      }

      return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
          var headerAndTabs = $attr.scrollSista === 'header-and-tabs';
          var body = $document[0].body;
          var scrollDelegate = $attr.delegateHandle ? $ionicScrollDelegate.$getByHandle($attr.delegateHandle) : $ionicScrollDelegate;
          var scrollView = scrollDelegate.getScrollView();

          //coordinates
          var y, prevY, scrollDelay, prevScrollTop;
          //headers
          var cachedHeader, activeHeader, headerHeight, contentTop;
          //tabs
          var tabsHeight, animateTabs, hasTabsTop = false;

          /**
           * Initializes y and scroll variables
           */
          function initCoordinates () {
            y = 0;
            prevY = 0;
            prevScrollTop = 0;
            scrollDelay = 0.4;
          }

          /**
           * Initializes headers and tabs
           */
          function initElements () {
            cachedHeader = body.querySelector('[nav-bar="cached"] .bar-header');
            activeHeader = body.querySelector('[nav-bar="active"] .bar-header');

            if (!activeHeader) {
              return;
            }

            headerHeight = activeHeader.offsetHeight;
            contentTop = headerHeight;

            var tabs = body.querySelector('.tabs');
            var tabsClasses;

            if (tabs) {
              tabsClasses = tabs.parentNode.classList;
              tabsHeight = tabs.offsetHeight;

              if (tabsClasses.contains('tabs-top')) {
                hasTabsTop = true;
                contentTop += tabsHeight;
                if (headerAndTabs) {
                  animateTabs = function (y, duration) {
                    translateY(tabs, -y, duration);
                  };
                } else {
                  animateTabs = function (y, duration) {
                    translateY(tabs, Math.max(-headerHeight, -y), duration);
                  };
                }
              } else if (tabsClasses.contains('tabs-bottom')) {
                animateTabs = headerAndTabs && function (y, duration, contentStyle) {
                    contentStyle.bottom = Math.max(0, tabsHeight - y) + 'px';
                    translateY(tabs, Math.min(tabsHeight, y), duration);
                  };
              }
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
            translateY(activeHeader, -y, duration);
            angular.forEach(activeHeader.children, function (child) {
              animate(child, fadeAmt);
            });
            //translate cached header
            translateY(cachedHeader, -y, duration);
          }

          /**
           * Translates header and/or tabs elements and resets content top and/or bottom
           * @param y
           * @param duration
           */
          function translateElements (y, duration) {
            var contentStyle = $element[0].style;

            ionic.requestAnimationFrame(function() {
              //If hasTabsTop we want the top tabs to slide in under the header first before the header slides out
              if (headerAndTabs && hasTabsTop && y > 0) {
                if (y >= tabsHeight) {
                  translateHeaders(y - tabsHeight, duration);
                }
              } else {
                translateHeaders(y, duration);
              }

              if (animateTabs) {
                animateTabs(y, duration, contentStyle);
              }
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

            y = scrollTop >= 0 ? Math.min(headerHeight / scrollDelay, Math.max(0, y + scrollTop - prevScrollTop)) : 0;

            //if we are at the bottom, animate the header/tabs back in
            if (scrollView.getScrollMax().top - scrollTop <= contentTop) {
              y = 0;
              duration = TRANSITION_DURATION;
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
    });

})(angular);
