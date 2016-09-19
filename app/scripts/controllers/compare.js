'use strict';

/**
 * @ngdoc function
 * @name ecosistemaEmprendedorRegionesApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ecosistemaEmprendedorRegionesApp
 */
angular.module('ecosistemaEmprendedorRegionesApp')
  .controller('CompareCtrl', function ($scope, $routeParams, $location, ColorService) {
    
    $scope.$on("newData", function () {
  		$scope.setup();
  	});

    $scope.rendered = false;

    $scope.setup = function(){
        $scope.id1 =  $routeParams.id1;
        $scope.region1 = _.find($scope.data, ['region', parseInt($routeParams.id1)]);
        if($routeParams.id2){
            $scope.id2 =  $routeParams.id2;
	    	$scope.region2 = _.find($scope.data, ['region', parseInt($routeParams.id2)]);
        }
        ColorService.selectRegion($scope.id1,$scope.id2);
        $scope.renderChart();
    }

    $scope.changeSelect = function(){
        var params = $scope.id1+'/';
        params += ($scope.id2)?$scope.id2:'';
        $location.path('/compare/'+params);
    }

    $scope.renderChart = function(){
        if($scope.data && !$scope.rendered){
            $scope.rendered = true;
            
            var detail = [];
            angular.forEach($scope.region1,function(v,i){
                if(['region','nombre','ranking','general'].indexOf(i)==-1){
                    detail.push({axis:$scope.dimension_labels[i],value:v})
                }
            });

            $scope.radarData = [detail];

            if($scope.region2){
                var detail2 = [];
                angular.forEach($scope.region2,function(v,i){
                    if(['region','nombre','ranking','general'].indexOf(i)==-1){
                        detail2.push({axis:$scope.dimension_labels[i],value:v})
                    }
                });

                $scope.radarData.push(detail2);
            }

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

    $scope.setup();

  });
