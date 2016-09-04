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
	    	$scope.current.nombre = $scope.regions[$routeParams.id];
            ColorService.selectRegion($scope.id);
            

            var detail = [];
            angular.forEach($scope.current,function(v,i){
                if(['n_pinnov','n_procinn','n_finance','region','nombre','ranking'].indexOf(i)==-1){
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
            ////////////////////////// Data ////////////////////////////// 
            ////////////////////////////////////////////////////////////// 

            var data = [
                      [//iPhone
                        {axis:"Battery Life",value:0.22},
                        {axis:"Brand",value:0.28},
                        {axis:"Contract Cost",value:0.29},
                        {axis:"Design And Quality",value:0.17},
                        {axis:"Have Internet Connectivity",value:0.22},
                        {axis:"Large Screen",value:0.02},
                        {axis:"Price Of Device",value:0.21},
                        {axis:"To Be A Smartphone",value:0.50}          
                      ],[//Samsung
                        {axis:"Battery Life",value:0.27},
                        {axis:"Brand",value:0.16},
                        {axis:"Contract Cost",value:0.35},
                        {axis:"Design And Quality",value:0.13},
                        {axis:"Have Internet Connectivity",value:0.20},
                        {axis:"Large Screen",value:0.13},
                        {axis:"Price Of Device",value:0.35},
                        {axis:"To Be A Smartphone",value:0.38}
                      ],[//Nokia Smartphone
                        {axis:"Battery Life",value:0.26},
                        {axis:"Brand",value:0.10},
                        {axis:"Contract Cost",value:0.30},
                        {axis:"Design And Quality",value:0.14},
                        {axis:"Have Internet Connectivity",value:0.22},
                        {axis:"Large Screen",value:0.04},
                        {axis:"Price Of Device",value:0.41},
                        {axis:"To Be A Smartphone",value:0.30}
                      ]
                    ];
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
