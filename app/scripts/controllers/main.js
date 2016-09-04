'use strict';

/**
 * @ngdoc function
 * @name ecosistemaEmprendedorRegionesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ecosistemaEmprendedorRegionesApp
 */
angular.module('ecosistemaEmprendedorRegionesApp')
  .controller('MainCtrl', function ($scope, ColorService, $location) {
  	
  	$scope.dimension_selected = 'general';

  	$scope.$on("newData", function () {
  		$scope.renderChart();
  	});

  	$scope.dimensionChanged = function(){
      if($scope.data){
    		$scope.renderChart();      
      }
  	};

  	var chart = false;

  	$scope.colorScale;

  	$scope.renderChart = function(){

      if($scope.data){

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
  				    },
              onclick: function (d, element) {
                $scope.goToDetail($scope.chartData[d.index].id);
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
        
          d3.selectAll('.c3-axis-x .tick')
          .on('mouseenter', function(value,index){
            $scope.hoverTick($scope.chartData[value].id);
          })
          .on('mouseleave', function(value,index){
            $scope.unhoverTick($scope.chartData[value].id);
          })
          .on('click', function(value,index){
            $scope.goToDetail($scope.chartData[value].id);
          });
    		
        } else {
    			chart.load(dataConfig);
    		}

        d3.selectAll('.c3-axis-x .tick')
        .attr('id',function(value, index){
          return 'tick-'+value;
        });

    		ColorService.paintMap($scope.chartData);
      }


  	};

  	$scope.prepareData = function(){
  		var data = angular.copy($scope.data).map(function(d){
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

    $scope.hoverTick = function(id){
      //console.log('hoverTick',id);
      $scope.hoverMap(id);
    };

    $scope.unhoverTick = function(id){
      //console.log('hoverTick',id);
      $scope.unhoverMap(id);
    };

    $scope.renderChart();

  });
