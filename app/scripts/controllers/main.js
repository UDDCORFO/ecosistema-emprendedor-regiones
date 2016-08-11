'use strict';

/**
 * @ngdoc function
 * @name ecosistemaEmprendedorRegionesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ecosistemaEmprendedorRegionesApp
 */
angular.module('ecosistemaEmprendedorRegionesApp')
  .controller('MainCtrl', function ($scope) {
  	
  	$scope.dimension_selected = 'n_opp';

  	$scope.$on("newData", function () {
  		$scope.renderChart();
  	});

  	$scope.dimensionChanged = function(){
  		$scope.renderChart();
  	};

  	var chart = false;

  	$scope.renderChart = function(){

  		console.log($scope.getData());

  		var data = {
			        json: $scope.getData(),
			        type:'bar',
			        keys: {
				      x: 'name',
				      value: ['value'],
				    }
			    };

  		if(!chart){
  			chart = c3.generate({
  				bindto: '#lines-container',
			    data: data,
			    size: {
				  height: 600
				},
			    axis: {
			        rotated: true,
			        x:{
			        	type:'category'
			        }
			    },
			    legend: {
				  show: false
				}
			});
  		} else {
  			chart.load(data);
  		}

  	};

  	$scope.getData = function(){
  		return $scope.data.map(function(d){
  			return {name:$scope.regions[d.region],value:d[$scope.dimension_selected]}
  		}).sort(function(a,b){
  			return a.value<b.value;
  		});
  	};


  });
