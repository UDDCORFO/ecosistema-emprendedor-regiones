'use strict';

/**
 * @ngdoc function
 * @name ecosistemaEmprendedorRegionesApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ecosistemaEmprendedorRegionesApp
 */
angular.module('ecosistemaEmprendedorRegionesApp')
  .controller('DetailsCtrl', function ($scope, $routeParams, $location) {
    

    $scope.$on("newData", function () {
  		$scope.renderChart();
  	});

    $scope.renderChart = function(){
    	if($scope.data){
	    	$scope.id =  $routeParams.id;
	    	$scope.current = _.find($scope.data, ['region', parseInt($routeParams.id)]);
	    	$scope.current.nombre = $scope.regions[$routeParams.id];    		
    	}
    };

    $scope.prev = function(){
    	var prev = $scope.current.region-1;
    	if(prev == 0){
    		prev = 15;
    	}
    	$location.path('/details/'+prev);
    };

    $scope.next = function(){
    	var next = $scope.current.region+1;
    	if(next == 15){
    		next = 1;
    	}
    	$location.path('/details/'+next);
    };

    $scope.renderChart();


  });
