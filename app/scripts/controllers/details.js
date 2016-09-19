'use strict';

/**
 * @ngdoc function
 * @name ecosistemaEmprendedorRegionesApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ecosistemaEmprendedorRegionesApp
 */
angular.module('ecosistemaEmprendedorRegionesApp')
  .controller('DetailsCtrl', function ($scope, $routeParams, $location, ColorService) {
    
    $scope.$on("newData", function () {
  		$scope.renderChart();
  	});

    $scope.rendered = false;

    $scope.renderChart = function(){
    	if($scope.data && !$scope.rendered){
            $scope.rendered = true;
	    	$scope.id =  $routeParams.id;
	    	$scope.current = _.find($scope.data, ['region', parseInt($routeParams.id)]);
            ColorService.selectRegion($scope.id);
            
            var detail = [];
            angular.forEach($scope.current,function(v,i){
                if(['region','nombre','ranking','general'].indexOf(i)==-1){
                    detail.push({axis:$scope.dimension_labels[i],value:v})
                }
            });
            $scope.radarData = [detail];

            console.log('radarchart',$scope.radarData);

            var w = d3.select("#radar-chart").node().getBoundingClientRect().width;

            ////////////////////////////////////////////////////////////// 
            //////////////////////// Set-Up ////////////////////////////// 
            ////////////////////////////////////////////////////////////// 

            var margin = {top: 100, right: 100, bottom: 100, left: 100},
                width = 618,
                height = 618;

            console.log(w);
            console.log(width);
            console.log(height);

            ////////////////////////////////////////////////////////////// 
            //////////////////// Draw the Chart ////////////////////////// 
            ////////////////////////////////////////////////////////////// 

            var color = d3.scale.ordinal()
                .range(["#EDC951","#CC333F","#00A0B0"]);
                
            var radarChartOptions = {
              w: width,
              h: height,
              margin: margin,
              maxValue: 0.5,
              levels: 10,
              roundStrokes: false,
              color: color
            };
            //Call function to draw the Radar chart
            RadarChart("#radar-chart", $scope.radarData, radarChartOptions);

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
    	if(next == 16){
    		next = 1;
    	}
    	$location.path('/details/'+next);
    };

    $scope.renderChart();

  });
