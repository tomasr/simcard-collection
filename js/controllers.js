var app = angular.module('SCC', ['ngGrid']);

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

app.controller('SCController', function($scope,$http,$filter) {
  $scope.sims = [];
  $scope.simsGroupedBy2 = [];
  $scope.currentImg = 'images/blank-full.png';
  $scope.imageTitle = '';

  $scope.loadData = function() {
    var httpRequest = $http.get('mint.json').success(
      function(data) {
        $scope.sims = angular.fromJson(data).result;
        $scope.simsGroupedBy2 = $filter('groupBy')($scope.sims, 2);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      })
  };
  $scope.sccGridOptions = {
    data: 'sims',
    showFilter: true,
    showGroupPanel: true,
    jqueryUITheme: true,
    multiSelect: false,
    maintainColumnRadios: true,
    columnDefs: [
      {field: 'mobileNetwork', width: 120, displayName: 'Network'},
      {field: 'country', width: 160, displayName: 'Country'},
      {field: 'serial', width: 180, displayName: 'Serial'},
      {field: 'description', width: "*", displayName: 'Description'},
    ]
  };
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
  $scope.loadData();
});
