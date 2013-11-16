var app = angular.module('SCC', []);
app.config(['$routeProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/detail/:serial', {
      templateUrl: 'detail.html',
      controller: DetailController,
      controllerAs: 'detail'
    });
    $routeProvider.when('/country/:country', {
      templateUrl: 'all.html',
      controller: AllController,
      controllerAs: 'all'
    });
    $routeProvider.when('/country/:country/network/:network', {
      templateUrl: 'all.html',
      controller: AllController,
      controllerAs: 'all'
    });
    $routeProvider.otherwise({
      templateUrl: 'all.html',
      controller: AllController,
      controllerAs: 'all'
    });

    // configure html5 to get links working on jsfiddle
    //$locationProvider.html5Mode(true);
}]);

app.directive('addOptionAll',
  function($timeout) {
    return {
      link : function(scope, element, attrs) {
        // use $timeout if you want to add "All" at the bottom else dont use                
        $timeout(function(){
          element.prepend("<option value='*'> All</option>");
        }, 1000);
     }
  };
});
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

app.filter('unique-fvalue', function() {
  return function(items, property) {
    if ( items ) {
      var nitems = [];
      for ( var i=0; i < items.length; i++ ) {
        if ( nitems.indexOf(items[i][property]) < 0 ) {
          nitems.push(items[i][property]);
        }
      }
      nitems.sort();
      return nitems;
    }
  }
});

app.directive('ngHolder', function() {
  return {
    replace: true,
    link: function(scope, element, args) {
      scope.$watch('ngHolder', function(value) {
        var img = "<img data-src='holder.js/" + args.ngHolder + "' class='placeholder' id='" + args.id + "-img'/>";
        element.append(img);
        //Holder.run({images: '.placeholder'});
      });
    }
  };
});

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


function SCController($scope, $http, $filter) {
  $scope.sims = [];
  $scope.networkList = null;
  $scope.countryList = null;

  $scope.loadData = function() {
    var httpRequest = $http.get('mint.json').success(
      function(data) {
        var json = angular.fromJson(data);
        $scope.sims = json.sims;
        $scope.countryList = json.countries;
        $scope.networkList = $filter('unique-fvalue')($scope.sims, 'mobileNetwork');
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      })
  };

  $scope.findSimBySerial = function(serial) {
    for ( i=0; i < $scope.sims.length; i++ ) {
      if ( $scope.sims[i].serial === serial ) {
        return $scope.sims[i];
      }
    }
    return null;
  };

  $scope.simsByCountry = function(country) {
    if ( country === '*' ) {
      return $scope.sims;
    }
    var result = [];
    for ( i=0; i < $scope.sims.length; i++ ) {
      if ( $scope.sims[i].country === country ) {
        result.push($scope.sims[i]);
      }
    }
    return result;
  }

  $scope.loadData();
}

function AllController($scope, $filter, $location, $routeParams) {
  $scope.matchingSimsGrouped = [];
  $scope.matchingSims = [];
  $scope.currentImg = 'images/blank-full.png';
  $scope.imageTitle = '';
  $scope.selectedCountry = $routeParams.country;
  $scope.selectedNetwork = $routeParams.network;

  $scope.showImage = function(sim, image) {
    if ( image === 'front' ) {
      $scope.imageTitle = sim.serial + ' (Front)';
      $scope.currentImg = "images/full/" + sim.imgfront;
    } else {
      $scope.imageTitle = sim.serial + ' (Back)';
      $scope.currentImg = "images/full/" + sim.imgback;
    }

    $('#myModal').modal({show: true});
  }

  $scope.filterData = function() {
    $scope.matchingSims = $scope.getMatchingCards();
    $scope.matchingSimsGrouped = $filter('groupBy')($scope.matchingSims, 2);
  }

  $scope.navigateToCountry = function() {
    $location.path('/country/' + $scope.selectedCountry);
  }
  $scope.navigateToNetwork = function() {
    if ( !$scope.selectedCountry ) {
      $scope.selectedCountry = '*';
    }
    $location.path('/country/' + $scope.selectedCountry + '/network/' + $scope.selectedNetwork);
  }

  $scope.getMatchingCards = function() {
    var result = [];
    var cardsByCountry = $scope.$parent.simsByCountry($scope.selectedCountry);
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

  $('#myModal').on('hide.bs.modal', function() {
    $scope.currentImg = "images/blank-full.png";
    $scope.$apply();
  });
  if ( $scope.selectedCountry ) {
    $scope.filterData();
  }
}


// Controller for the detail page
function DetailController($scope, $routeParams) {
  $scope.sim = $scope.$parent.findSimBySerial($routeParams.serial);
}
