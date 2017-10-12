'use strict';

/**
 * @ngdoc function
 * @name ecosistemaEmprendedorRegionesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ecosistemaEmprendedorRegionesApp
 */
angular.module('ecosistemaEmprendedorRegionesApp')
  .controller('MainCtrl', function ($scope, ColorService, $location, $timeout) {
  	
  	$scope.dimension_selected = 'general';

  	$scope.$on("newData", function () {
      $timeout($scope.renderChart,1000);
  	});

    $scope.$on("mapClicked", function (ev, d) {
        $scope.goToDetail(d.id);
    });

  	$scope.dimensionChanged = function(){
      if($scope.data){
    		$scope.renderChart();      
      }
  	};

  	var chart = false;

    $scope.colorScale = ColorService.getThresholdScale(-0.001,1.1);

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
              padding:{
                top:0
              },
    			    axis: {
    			        rotated: true,
    			        x:{
    			        	type:'category'
    			        },
                  y:{
                    max:1,
                    min:0,
                    padding: {
                      top: 0,
                      bottom: 0
                    }
                  }
    			    },
              grid:{
                y:{
                    lines: [
                      {value: $scope.avg, text: 'Promedio: '+$scope.avg,position: 'start', class:'promedio-line'}
                    ],
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
          chart.ygrids([
            {value: $scope.avg, text:'Promedio: '+$scope.avg,position: 'start', class:'promedio-line'}
          ]);
    		}

        d3.select('g.promedio-line line')
          .style('stroke',$scope.colorScale($scope.avg))
          .style('stroke-width',3);

        d3.select('g.promedio-line text')
          .style('fill',$scope.colorScale($scope.avg));

        d3.selectAll('.c3-axis-x .tick')
        .attr('id',function(value, index){
          return 'tick-'+value;
        });

    		ColorService.paintMap($scope.chartData);
      }


  	};

  	$scope.prepareData = function(){
      $scope.sum = 0;
      $scope.avg = 0;
      $scope.qty = 0;

      var data = angular.copy($scope.data).map(function(d){
        var value = d[$scope.dimension_selected];
        $scope.sum += value;
        $scope.qty += 1;
        $scope.avg = Math.round(($scope.sum / $scope.qty) * 100) / 100;
        return {id:d.region,name:d.nombre,value:parseFloat(value),color:$scope.colorScale(value)}
      }).sort(function(a,b){
        return (a.value<b.value)?1:-1;
      });

  		return data;
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
