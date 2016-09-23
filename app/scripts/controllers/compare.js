'use strict';

/**
 * @ngdoc function
 * @name ecosistemaEmprendedorRegionesApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ecosistemaEmprendedorRegionesApp
 */
angular.module('ecosistemaEmprendedorRegionesApp')
  .controller('CompareCtrl', function ($scope, $routeParams, $location, ColorService, $timeout) {
    
    $scope.$on("newData", function () {
  		//$scope.setup();
        $timeout($scope.init,500);
  	});

    $scope.$on("mapClicked", function (ev, d) {
        $scope.$apply(function(){
            $scope.update($scope.id1,d.id); 
        });
    });

    $scope.rendered = false;

    $scope.colorest = d3.scale.ordinal()
            .range(["#ff8303","#001d34"]);

    $scope.init = function(){
        if($scope.data && !$scope.rendered){
            $scope.rendered = true;
            $scope.update($routeParams.id1,$routeParams.id2);
        }
    }

    $scope.update = function(id1,id2){
        $location.search('id1',id1);
        $location.search('id2',id2);
        $scope.id1 =  id1;
        $scope.region1 = _.find($scope.data, ['region', parseInt(id1)]);
        if(id2){
            $scope.id2 =  id2+'';
            $scope.region2 = _.find($scope.data, ['region', parseInt(id2)]);
        }
        ColorService.selectRegion($scope.id1,$scope.id2);
        $scope.renderChart();
    }

    $scope.changeSelect = function(){
        $scope.update($scope.id1,$scope.id2);
    }

    $scope.renderChart = function(){
        
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

        var w = Math.round(d3.select("#radar-chart").node().getBoundingClientRect().width);

        ////////////////////////////////////////////////////////////// 
        //////////////////////// Set-Up ////////////////////////////// 
        ////////////////////////////////////////////////////////////// 

        var margin = {top: 100, right: 100, bottom: 100, left: 100},
            size = w;

        ////////////////////////////////////////////////////////////// 
        //////////////////// Draw the Chart ////////////////////////// 
        ////////////////////////////////////////////////////////////// 
            
        var radarChartOptions = {
          w: size-margin.right-margin.left,
          h: size-margin.right-margin.left,
          margin: margin,
          maxValue: 1,
          levels: 10,
          roundStrokes: false,
          color: $scope.colorest,
          labelFactor:1.1
        };
        //$('#radar-chart').html('<p>ALTO CHART</p>');
        //Call function to draw the Radar chart
        RadarChart("#radar-chart", $scope.radarData, radarChartOptions);

    };

    //$scope.init();
    $timeout($scope.init,500);

  });
