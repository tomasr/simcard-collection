var app = angular.module('SCC', ['ngGrid']);

app.controller('SCController', function($scope,$http) {
  $scope.sims = [];
  $scope.loadData = function() {
    var httpRequest = $http.get('mint.json').success(
      function(data) {
        console.log('completed request: ' + data);
        $scope.sims = angular.fromJson(data).result;
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
  $scope.loadData();
});
