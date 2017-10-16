"use strict";

/**
 * @ngdoc function
 * @name ecosistemaEmprendedorRegionesApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ecosistemaEmprendedorRegionesApp
 */
angular
  .module("ecosistemaEmprendedorRegionesApp")
  .controller("CompareCtrl", function(
    $scope,
    $routeParams,
    $location,
    ColorService,
    $timeout
  ) {
    $scope.$on("newData", function() {
      //$scope.setup();
      console.log("newData COMPARE");
      $timeout(function() {
        if ($scope.rendered) {
          $scope.update($routeParams.id, $routeParams.id2);
        } else {
          $scope.init();
        }
      }, 500);
    });

    $scope.$on("regionChanged", function(ev, d) {
      if ($scope.data && $scope.rendered) {
        $scope.update(d.id, $scope.id2);
      }
    });

    $scope.$on("vsRegionChanged", function(ev, d) {
      if ($scope.data && $scope.rendered) {
        $scope.update($scope.id1, d.id);
      }
    });

    $scope.rendered = false;

    $scope.init = function() {
      if ($scope.data && !$scope.rendered) {
        $scope.rendered = true;
        $scope.update($routeParams.id, $routeParams.id2);
      }
    };

    $scope.update = function(id1, id2) {
      console.log("update compare", id1, id2);
      $scope.colorest = d3.scale.ordinal().range(["#ff8303", "#001d34"]);

      $location.search("id", id1);
      $location.search("id2", id2);

      $scope.id1 = id1;
      $scope.region1 = _.find($scope.data, ["region", parseInt(id1)]);
      if (id2) {
        $scope.id2 = id2 + "";
        $scope.region2 = _.find($scope.data, ["region", parseInt(id2)]);
      }
      ColorService.selectRegion($scope.id1, $scope.id2);

      var detail = [];
      angular.forEach($scope.region1, function(v, i) {
        if (["region", "nombre", "ranking", "general"].indexOf(i) == -1) {
          detail.push({
            nombre: $scope.region1.nombre,
            ix: 0,
            axis: $scope.dimension_labels[i],
            description: $scope.dimension_descriptions[i],
            value: v
          });
        }
      });

      $scope.radarData = [detail];

      if ($scope.region2) {
        var detail2 = [];
        angular.forEach($scope.region2, function(v, i) {
          if (["region", "nombre", "ranking", "general"].indexOf(i) == -1) {
            detail2.push({
              nombre: $scope.region2.nombre,
              ix: 1,
              axis: $scope.dimension_labels[i],
              description: $scope.dimension_descriptions[i],
              value: v
            });
          }
        });

        $scope.radarData.push(detail2);
      }

      var w = Math.round(
        d3
          .select("#radar-chart")
          .node()
          .getBoundingClientRect().width
      );

      if (
        Math.round(
          d3
            .select("body")
            .node()
            .getBoundingClientRect().width
        ) < 700
      ) {
        $scope.renderLineChart(w, $scope.radarData);
      } else {
        $scope.renderRadarChart(w, $scope.radarData);
      }

      //$scope.renderChart();
    };

    var chart;

    $scope.renderLineChart = function(w, detail) {
      var values = [$scope.region1.nombre];

      var lines = [
        {
          value: $scope.region1.general,
          position: "start",
          class: "promedio-line1"
        }
      ];

      if ($scope.region2) {
        values.push($scope.region2.nombre);
        lines.push({
          value: $scope.region2.general,
          position: "start",
          class: "promedio-line2"
        });
      }

      var data = _.orderBy(
        detail[0].map(function(r, ix) {
          r[$scope.region1.nombre] = r.value;
          if ($scope.region2) {
            r[$scope.region2.nombre] = detail[1][ix].value;
          }
          delete r.value;
          delete r.nombre;
          return r;
        }),
        [$scope.region1.nombre],
        ["desc"]
      );

      var dataConfig = {
        unload: true,
        json: data,
        type: "bar",
        xSort: false,
        keys: {
          x: "axis",
          value: values
        },
        color: function(color, datum) {
          var current = datum.id ? datum.id : datum;
          return current == $scope.region1.nombre ? "#ff8303" : "#001d34";
        }
      };

      if (!chart) {
        chart = c3.generate({
          bindto: "#radar-chart",
          data: dataConfig,
          size: {
            height: 500,
            width: w
          },
          padding: {
            top: 0
          },
          axis: {
            rotated: true,
            x: {
              type: "category"
            },
            y: {
              max: 1,
              min: 0,
              padding: {
                top: 0,
                bottom: 0
              }
            }
          },
          grid: {
            y: {
              lines: lines
            }
          },
          legend: {
            show: false
          }
        });
      } else {
        chart.load(dataConfig);
        chart.ygrids(lines);
      }

      d3
        .select("g.promedio-line1 line")
        .style("stroke", "#ff8303")
        .style("stroke-width", 2);

      d3
        .select("g.promedio-line2 line")
        .style("stroke", "#001d34")
        .style("stroke-width", 2);
    };

    $scope.renderRadarChart = function(w, detail) {
      //////////////////////////////////////////////////////////////
      //////////////////////// Set-Up //////////////////////////////
      //////////////////////////////////////////////////////////////

      var margin = { top: 100, right: 150, bottom: 100, left: 150 },
        size = w;

      //////////////////////////////////////////////////////////////
      //////////////////// Draw the Chart //////////////////////////
      //////////////////////////////////////////////////////////////

      var radarChartOptions = {
        w: size - margin.right - margin.left,
        h: size - margin.right - margin.left,
        margin: margin,
        maxValue: 1,
        levels: 10,
        roundStrokes: false,
        color: $scope.colorest,
        labelFactor: 1.2
      };
      //$('#radar-chart').html('<p>ALTO CHART</p>');
      //Call function to draw the Radar chart
      RadarChart("#radar-chart", $scope.radarData, radarChartOptions);
    };

    //$scope.init();
    $timeout($scope.init, 500);
  });
