var app = angular.module('SCC',[]);

app.filter('groupBy', function() {
  return function(items, groupedBy) {
    if (items) {
      var finalItems = [], thisGroup;
      for (var i = 0; i < items.length; i++) {
        if (!thisGroup) {
          thisGroup = [];
        }
        thisGroup.push(items[i]);
        if (((i+1) % groupedBy) == 0) {
          finalItems.push(thisGroup);
          thisGroup = null;
        }
      };
      if (thisGroup) {
        finalItems.push(thisGroup);
      }
      return finalItems;
    }
  };
});

app.directive('ngHolder', function() {
  return {
    replace: true,
    link: function(scope, element, args) {
      scope.$watch('ngHolder', function(value) {
        var img = "<img data-src='holder.js/" + args.ngHolder + "' class='placeholder' id='" + args.id + "-img'/>";
        element.append(img);
        //Holder.run({images: '#' + args.id + '-img'});
      });
    }
  };
});

app.controller('SCController', function($scope,$http,$filter) {
  $scope.sims = [];
  $scope.networkList = [];
  $scope.countryList = [];
  $scope.matchingSimsGrouped = [];
  $scope.matchingSims = [];
  $scope.currentImg = null;
  $scope.imageTitle = '';

  function groupByField(list, getter) {
    var result = {};
    result[" all"] = list;
    for ( var i=0; i < list.length; i++ ) {
      var key = getter(list[i]);
      var subset = result[key];
      if ( !subset ) {
        subset = [];
        result[key] = subset;
      }
      subset.push(list[i]);
    }
    return result;
  }

  $scope.loadData = function() {
    var httpRequest = $http.get('mint.json').success(
      function(data) {
        $scope.sims = angular.fromJson(data).result;
        $scope.networkList = groupByField($scope.sims, function (obj) { return obj.mobileNetwork; });
        $scope.countryList = groupByField($scope.sims, function (obj) { return obj.country; });
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      })
  };

  $scope.filterData = function() {
    $scope.matchingSims = $scope.getMatchingCards();
    $scope.matchingSimsGrouped = $filter('groupBy')($scope.matchingSims, 2);
  }

  $scope.getMatchingCards = function() {
    var result = [];
    var cardsByCountry = $scope.countryList[$scope.selectedCountry];
    if ( !cardsByCountry ) {
      return result;
    }
    var network = $scope.selectedNetwork;
    if ( network && network !== ' all' ) {
      for ( var i=0; i < cardsByCountry.length; i++ ) {
        if ( cardsByCountry[i].mobileNetwork === network ) {
          result.push(cardsByCountry[i]);
        }
      }
      return result;
    } else {
      return cardsByCountry;
    }
  };

  $scope.showImage = function(sim, image) {
    if ( image === 'front' ) {
      $scope.imageTitle = sim.serial + ' (Front)';
      $scope.currentImg = "images/full/" + sim.imgfront;
    } else {
      $scope.imageTitle = sim.serial + ' (Back)';
      $scope.currentImg = "images/full/" + sim.imgback;
    }
    $('#myModal').modal({hide: false});
  }
  $scope.loadData();
});
