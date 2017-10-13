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
  .controller("DetailsCtrl", function(
    $scope,
    $routeParams,
    $location,
    ColorService,
    $timeout
  ) {
    $scope.$on("newData", function() {
      $timeout(function() {
        if ($scope.rendered) {
          $scope.update($routeParams.id);
        } else {
          $scope.init();
        }
      }, 500);
    });

    /*    $scope.$on("mapClicked", function(ev, d) {
      $scope.$apply(function() {
        $scope.update(d.id);
      });
    });*/

    $scope.$on("regionChanged", function(ev, d) {
      if ($scope.data && $scope.rendered) {
        $scope.update(d.id);
      }
    });

    $scope.rendered = false;
    $scope.chart = false;
    $scope.loadingDetail = true;

    $scope.init = function() {
      if ($scope.data && !$scope.rendered) {
        $scope.loadingDetail = false;
        $scope.rendered = true;
        $scope.update($routeParams.id);
      }
    };

    $scope.update = function(id) {
      //DATA
      $location.search("id", id);
      $scope.id = id;
      $scope.current = _.find($scope.data, ["region", parseInt(id)]);
      ColorService.selectRegion($scope.id);

      var w = Math.round(
        d3
          .select("#radar-chart")
          .node()
          .getBoundingClientRect().width
      );
      var detail = [];
      angular.forEach($scope.current, function(v, i) {
        if (["region", "nombre", "ranking", "general"].indexOf(i) == -1) {
          detail.push({
            nombre: $scope.current.nombre,
            ix: 0,
            axis: $scope.dimension_labels[i],
            description: $scope.dimension_descriptions[i],
            value: v
          });
        }
      });

      if (
        Math.round(
          d3
            .select("body")
            .node()
            .getBoundingClientRect().width
        ) < 700
      ) {
        $scope.renderLineChart(w, detail);
      } else {
        $scope.renderRadarChart(w, detail);
      }

      $scope.chart = true;
    };

    var chart;

    var color = d3.scale.ordinal().range(["#ff8303"]);

    $scope.renderLineChart = function(w, detail) {
      var dataConfig = {
        json: _.orderBy(detail, ["value"], ["desc"]),
        type: "bar",
        xSort: false,
        keys: {
          x: "axis",
          value: ["value"]
        },
        color: color
      };

      if (!chart) {
        chart = c3.generate({
          bindto: "#radar-chart",
          data: dataConfig,
          size: {
            height: 500
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
              lines: [
                {
                  value: $scope.current.general,
                  text: "Índice general: " + $scope.current.general,
                  position: "start",
                  class: "promedio-line"
                }
              ]
            }
          },
          legend: {
            show: false
          }
        });
      } else {
        chart.load(dataConfig);
        chart.ygrids([
          {
            value: $scope.current.general,
            text: "Índice general: " + $scope.current.general,
            position: "start",
            class: "promedio-line"
          }
        ]);
      }

      d3
        .select("g.promedio-line line")
        .style("stroke", color)
        .style("stroke-width", 3);

      d3.select("g.promedio-line text").style("fill", color);
    };

    $scope.renderRadarChart = function(w, detail) {
      $scope.radarData = [detail];

      var margin = { top: 100, right: 150, bottom: 100, left: 150 },
        size = w;

      var color = d3.scale.ordinal().range(["#ff8303"]);

      var radarChartOptions = {
        w: size - margin.right - margin.left,
        h: size - margin.right - margin.left,
        margin: margin,
        maxValue: 1,
        levels: 10,
        roundStrokes: false,
        color: color,
        labelFactor: 1.2
      };

      RadarChart("#radar-chart", $scope.radarData, radarChartOptions);
    };

    $scope.prev = function() {
      var prev = $scope.current.region - 1;
      if (prev == 0) {
        prev = 15;
      }
      $scope.update(prev);
    };

    $scope.next = function() {
      var next = $scope.current.region + 1;
      if (next == 16) {
        next = 1;
      }
      $scope.update(next);
    };

    $timeout(function() {
      $scope.init();
    }, 500);
  });
