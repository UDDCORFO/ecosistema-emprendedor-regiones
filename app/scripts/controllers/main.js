'use strict';

/**
 * @ngdoc function
 * @name ecosistemaEmprendedorRegionesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ecosistemaEmprendedorRegionesApp
 */
angular.module('ecosistemaEmprendedorRegionesApp')
  .controller('MainCtrl', function ($scope, ColorService) {
  	
  	$scope.dimension_selected = 'n_opp';

  	$scope.$on("newData", function () {
  		$scope.renderChart();
  	});

  	$scope.dimensionChanged = function(){
  		$scope.renderChart();
  	};

  	var chart = false;

  	$scope.colorScale;

  	$scope.renderChart = function(){

  		$scope.chartData = $scope.prepareData();

  		var dataConfig = {
			        json: $scope.chartData,
			        type:'bar',
			        xSort: false,
			        keys: {
				      x: 'name',
				      value: ['value'],
				    },
				    color: function (color, d) {
				    	if(d.index != undefined){
				    		return $scope.chartData[d.index].color;
				    	}
				    }
			    };

  		if(!chart){
  			chart = c3.generate({
  				bindto: '#lines-container',
			    data: dataConfig,
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
  			chart.load(dataConfig);
  		}

  		ColorService.paintMap($scope.chartData);

  	};

  	$scope.prepareData = function(){
  		var data = $scope.data.map(function(d){
  			return {id:d.region,name:$scope.regions[d.region],value:d[$scope.dimension_selected]}
  		}).sort(function(a,b){
  			return a.value<b.value;
  		});

  		var max = 1;
  		if(['n_pinnov','n_procinn','n_finance'].indexOf($scope.dimension_selected)>-1){
  			max = d3.max(data,function(d){return parseInt(d.value);});
  		}
  		var colorScale = ColorService.getThresholdScale(-0.001,max+0.1);

  		return data.map(function(d){
  			d.color = colorScale(d.value);
  			return d;
  		});
  	};


  });
