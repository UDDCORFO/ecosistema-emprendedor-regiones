'use strict';

/**
 * @ngdoc function
 * @name ecosistemaEmprendedorRegionesApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ecosistemaEmprendedorRegionesApp
 */
angular.module('ecosistemaEmprendedorRegionesApp')
  .controller('DetailsCtrl', function ($scope, $routeParams, $location, ColorService, $timeout) {
    
    $scope.$on("newData", function () {
        $timeout($scope.renderChart,500);
  	});

    $scope.rendered = false;

    $scope.loadingDetail =  true;

    $scope.renderChart = function(){
    	if($scope.data && !$scope.rendered){
            console.info('RENDER CHART');
            $scope.loadingDetail =  false;
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

            var w = Math.round(d3.select("#radar-chart").node().getBoundingClientRect().width);

            ////////////////////////////////////////////////////////////// 
            //////////////////////// Set-Up ////////////////////////////// 
            ////////////////////////////////////////////////////////////// 

            var margin = {top: 100, right: 100, bottom: 100, left: 100},
                size = w;

            ////////////////////////////////////////////////////////////// 
            //////////////////// Draw the Chart ////////////////////////// 
            ////////////////////////////////////////////////////////////// 

            var color = d3.scale.ordinal()
                .range(["#EDC951","#CC333F","#00A0B0"]);
                
            var radarChartOptions = {
              w: size-margin.right-margin.left,
              h: size-margin.right-margin.left,
              margin: margin,
              maxValue: 1,
              levels: 10,
              roundStrokes: false,
              color: color,
              labelFactor:1.1
            };
            //$('#radar-chart').html('<p>ALTO CHART</p>');
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

    if(d3.select('#radar-chart').select('p').empty()){
        console.info('nuevo!');
        $timeout(function(){
            $scope.renderChart();
        },500);
    } else {
        console.info('update!');
        $timeout(function(){
            $scope.renderChart();
        },500);
    }


  });
