'use strict';

angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $timeout, $ionicFilterBar, $ionicContentBanner) {
    var filterBarInstance, contentBannerInstance;

    function getItems () {
      if (filterBarInstance) {
        filterBarInstance();
        filterBarInstance = null;
      }

      if (contentBannerInstance) {
        contentBannerInstance();
        contentBannerInstance = null;
      }

      var items = [];
      for (var x = 1; x < 50; x++) {
        items.push({text: 'This is item number ' + x + ' which is an ' + (x % 2 === 0 ? 'EVEN' : 'ODD') + ' number.'});
      }
      $scope.items = items;
    }

    getItems();

    $scope.showFilterBar = function () {
      filterBarInstance = $ionicFilterBar.show({
        items: $scope.items,
        update: function (filteredItems) {
          $scope.items = filteredItems;
        }
      });
    };

    $scope.refreshItems = function () {
      $timeout(function () {
        getItems();
        $scope.$broadcast('scroll.refreshComplete');
      }, 1000);
    };

    $scope.showBanner = function () {
      $ionicContentBanner.show({
        text: ['System Unavailable', 'Please try again later']
      });
    };
  })

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
