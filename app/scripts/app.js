"use strict";

$.urlParam = function(url, name) {
  var results = new RegExp("[?&]" + name + "=([^&#]*)").exec(url);
  if (results === null) {
    return null;
  } else {
    return results[1] || 0;
  }
};

/**
 * @ngdoc overview
 * @name ecosistemaEmprendedorRegionesApp
 * @description
 * # ecosistemaEmprendedorRegionesApp
 *
 * Main module of the application.
 */
angular
  .module("ecosistemaEmprendedorRegionesApp", [
    "ngAnimate",
    "ngRoute",
    "ngSanitize",
    "ngTouch",
    "ui.select"
  ])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when("/", {
        templateUrl: "views/main.html",
        controller: "MainCtrl",
        controllerAs: "main"
      })
      .when("/details", {
        templateUrl: "views/details.html",
        controller: "DetailsCtrl",
        controllerAs: "details",
        reloadOnSearch: false
      })
      .when("/compare", {
        templateUrl: "views/compare.html",
        controller: "CompareCtrl",
        controllerAs: "compare",
        reloadOnSearch: false
      })
      .otherwise({
        redirectTo: "/"
      });
    $locationProvider.hashPrefix("");
  })
  .service("ColorService", function($rootScope) {
    this.getThresholdScale = function(min, max) {
      var d = (max - min) / 10;
      var colors = [
        "#001d34",
        "#2f2934",
        "#4e3633",
        "#6d4331",
        "#8c502e",
        "#ac5e29",
        "#cc6c21",
        "#ec7b13",
        "#ff932e",
        "#ffb365"
      ];
      if ($rootScope.dataset == "midee") {
        colors.reverse();
      }
      return (
        d3.scale
          .threshold()
          //.range(['#bcbddc','#b1abd3','#a69bcb','#9b8ac3','#907aba','#8469b1','#7958a9','#6d49a0','#613897','#54278f'])
          //.range(['#001d34','#2a2734','#443233','#5e3d32','#784830','#92532d','#ac5f29','#c76b23','#e27619','#ff8303'])
          .range(colors)
          .domain([
            min + 1 * d,
            min + 2 * d,
            min + 3 * d,
            min + 4 * d,
            min + 5 * d,
            min + 6 * d,
            min + 7 * d,
            min + 8 * d,
            min + 9 * d,
            min + 10 * d
          ])
      );
    };

    this.paintMap = function(data) {
      angular.forEach(data, function(r) {
        d3
          .select("path#region-" + r.id)
          .transition()
          .duration(1000)
          .style("fill", r.color);
      });
    };

    this.selectRegion = function(id1, id2) {
      d3
        .selectAll("path.region")
        .transition()
        .duration(1000)
        .style("fill", function(d) {
          if (d.id == id1) {
            return $rootScope.dataset == "mideco" ? "#ff8303" : "#001D34";
          } else if (id2 && d.id == id2) {
            return $rootScope.dataset == "mideco" ? "#001D34" : "#ff8303";
          } else {
            return "#ddd";
          }
        });
    };
  })
  .service("TabletopService", function($q, $rootScope) {
    this.data = false;

    this.loading = false;

    this.getData = function() {
      var that = this;
      return $q(function(resolve, reject) {
        if (!that.data) {
          Tabletop.init({
            key: $rootScope.dataset_key,
            callback: function(data, tabletop) {
              that.data = data;
              resolve(angular.copy(that.data));
            },
            simpleSheet: false,
            parseNumbers: false,
            postProcess: function(r) {
              var integers = ["region"];
              angular.forEach(r, function(value, ix) {
                if (integers.indexOf(ix) > -1) {
                  r[ix] = parseInt(value.replace(/\./g, ""));
                } else {
                  r[ix] = parseFloat((value + "").replace(/\,/g, "."));
                }
              });
              return r;
            }
          });
        } else {
          resolve(angular.copy(that.data));
        }
      });
    };
  })
  .run(function(
    TabletopService,
    $rootScope,
    ColorService,
    $location,
    $routeParams,
    $timeout
  ) {
    $rootScope.loading = true;
    $rootScope.map = {
      container: d3.select("#mapa"),
      svg: null
    };

    //check dataset
    $rootScope.dataset_param = $.urlParam($location.absUrl(), "dataset");
    $rootScope.dataset = $rootScope.dataset_param
      ? $rootScope.dataset_param
      : "mideco";

    $rootScope.dataset_key =
      $rootScope.dataset == "mideco"
        ? "1mB7Mes_YsCRTKNEvVTxQMDXtN17BGakWOxlx7MlRPWM"
        : "1wtF07FqjgnVkYNTFKn6UR0T92VdKVwsisqWm31XeqWA";

    /* DIMENSIONES */

    $rootScope.dimension_labels_index = {
      mideco: {
        general: "Índice general",
        n_opp: "Percepción oportunidades",
        n_start: "Habilidades emprendimiento",
        n_risk: "Tolerancia al fracaso",
        n_network: "Calidad de redes de trabajo",
        n_cultsupp: "Aceptación cultural al emprendimiento",
        n_oppstart: "Facilidad para iniciar negocios",
        n_techno: "Absorbción tecnológica",
        n_hc: "Calidad de los recursos humanos",
        n_compet: "Nivel de competencia",
        n_pinnov: "Desarrollo de nuevos productos",
        n_procinn: "Desarrollo de nuevas tecnologías",
        n_hgrow: "Creación de empresas de alto crecimiento",
        n_global: "Internacionalización",
        n_finance: "Financiamiento disponible"
      },
      midee: {
        general: "Índice general",
        n_calidad: "Calidad del Mercado Digital",
        n_articulacion: "Articulación del Emprendimiento Digital",
        n_ciudadania: "Ciudadanía Digital",
        n_infraestructura: "Infraestructura Digital",
        n_innov: "Innovación",
        n_financiamiento: "Financiamiento"
      }
    };

    $rootScope.dimension_labels =
      $rootScope.dimension_labels_index[$rootScope.dataset];

    $rootScope.dimension_descriptions_index = {
      mideco: {
        general:
          "Índice general construído en base a todos los índices relevados.",
        n_opp:
          "Emprendimiento por oportunidad ponderado por la percepción de barreras a nuevas oportunidades de emprendimiento en la región.",
        n_start:
          "Percepción de habilidad individual para emprender, ponderado por la calidad de recursos humanos disponibles en la región.",
        n_risk:
          "Percepción de posibilidad de fracaso, ponderado por el riesgo de negocios en la región.",
        n_network:
          "Capacidad de movilizar recursos y aprovechar oportunidades entre redes de trabajo, ponderado por la conectividad de la región.",
        n_cultsupp:
          "Soporte cultural al emprendimiento ponderado por la cohesión para apoyar el emprendimiento.",
        n_oppstart:
          "Proporción de emprendedores oportunistas, ponderado por la percepción de corrupción regional.",
        n_techno:
          "Proporción de emprendedores que adoptaron tecnologías, ponderado por la conectividad digital de la región.",
        n_hc:
          "Proporción de emprendedores con al menos educación secundaria, ponderado por la productividad laboral de la región.",
        n_compet:
          "Intensidad de competencia entre emprendedores del mismo producto, ponderado por una medida de rigideces laborales de la región.",
        n_pinnov:
          "Potencial de los emprendedores a irrumpir en un mercado con un producto nuevo, ponderado por una medida regional de innovación.",
        n_procinn:
          "Potencial de los emprendedores para irrumpir en un mercado con un proceso productivo nuevo, ponderado por una medida regional de innovación.",
        n_hgrow:
          "Potencial de crecimiento futuro ponderado por el nivel de sofisticación del mercado.",
        n_global:
          "Tendencia de los emprendedores a exportar sus productos, ponderado por la exposición al exterior que tiene la región.",
        n_finance:
          "Medida del financiamiento (informal) disponible, ponderado por la infraestructura financiera regional."
      },
      midee: {
        general: "Índice general",
        n_calidad: "Calidad del Mercado Digital",
        n_articulacion: "Articulación del Emprendimiento Digital",
        n_ciudadania: "Ciudadanía Digital",
        n_infraestructura: "Infraestructura Digital",
        n_innov: "Innovación",
        n_financiamiento: "Financiamiento"
      }
    };

    $rootScope.dimension_descriptions =
      $rootScope.dimension_descriptions_index[$rootScope.dataset];

    $rootScope.dimension_options = [];
    angular.forEach($rootScope.dimension_labels, function(v, k) {
      return $rootScope.dimension_options.push({ id: k, label: v });
    });

    $rootScope.selectedDimension = { value: $rootScope.dimension_options[0] };

    /* REGIONES */

    $rootScope.regions = {
      1: "Tarapacá",
      2: "Antofagasta",
      3: "Atacama",
      4: "Coquimbo",
      5: "Valparaíso",
      6: "O'Higgins",
      7: "Maule",
      8: "Bío-Bío",
      9: "La Araucanía",
      10: "Los Lagos",
      11: "Aysén",
      12: "Magallanes",
      13: "Metropolitana de Santiago",
      14: "Los Ríos",
      15: "Arica y Parinacota"
    };

    $rootScope.regions_options = [];
    angular.forEach($rootScope.regions, function(v, k) {
      return $rootScope.regions_options.push({ id: k, label: v });
    });

    $rootScope.selectedRegion = { value: $rootScope.regions_options[0] };
    $rootScope.selectedVsRegion = { value: $rootScope.regions_options[1] };

    //$rootScope.colors = ['#bcbddc','#aca4cf','#9b8ac3','#8b72b6','#7958a9','#67409c','#54278f'];

    var pymChild = new pym.Child({ polling: 500 });
    pymChild.sendHeight();

    $timeout(function() {}, 1000);

    function dataLoaded(data) {
      $rootScope.fulldata = data;

      /*YEARs*/
      $rootScope.years = _.keys($rootScope.fulldata);
      $rootScope.years = $rootScope.years
        .map(function(e) {
          return parseInt(e);
        })
        .sort()
        .reverse();

      $rootScope.years = $rootScope.years.map(function(e) {
        return { id: e, label: e };
      });

      $rootScope.selectedYear = {
        value: $rootScope.years[0]
      };

      /*VIEWS*/
      $rootScope.views = [
        { id: "main", label: "País" },
        { id: "details", label: "Región" },
        { id: "compare", label: "Comparar" }
      ];
      var viewId =
        $location.path().replace("/", "") == ""
          ? "main"
          : $location.path().replace("/", "");

      $rootScope.selectedView = {
        value: _.find($rootScope.views, ["id", viewId])
      };

      $rootScope.yearChanged();
      $rootScope.regionChanged();
      $rootScope.vsRegionChanged();

      $rootScope.loading = false;
    }

    $rootScope.viewChanged = function() {
      switch ($rootScope.selectedView.value.id) {
        case "main":
          window.location = "#/home";
          break;
        case "details":
          $rootScope.goToDetail(1);
          break;
        case "compare":
          $rootScope.goToCompare(1, 2);
          break;
      }
    };

    $rootScope.regionChanged = function() {
      $rootScope.currentRegion = _.find($rootScope.data, [
        "region",
        parseInt($rootScope.selectedRegion.value.id)
      ]);
      $rootScope.$broadcast("regionChanged", {
        id: $rootScope.selectedRegion.value.id
      });
    };

    $rootScope.vsRegionChanged = function() {
      $rootScope.vsRegion = _.find($rootScope.data, [
        "region",
        parseInt($rootScope.selectedVsRegion.value.id)
      ]);
      $rootScope.$broadcast("vsRegionChanged", {
        id: $rootScope.selectedVsRegion.value.id
      });
    };

    $rootScope.yearChanged = function() {
      $rootScope.data = $rootScope.fulldata[
        $rootScope.selectedYear.value.id
      ].elements
        .sort(function(a, b) {
          return a.general < b.general ? 1 : -1;
        })
        .map(function(d, ix) {
          d.ranking = ix + 1;
          d.nombre = $rootScope.regions[d.region];
          return d;
        });

      $rootScope.$broadcast("newData");
    };

    $rootScope.dimensionChanged = function() {
      $rootScope.$broadcast("dimensionChanged", {
        dim: $rootScope.selectedDimension.value.id
      });
    };

    $rootScope.goToDetail = function(id) {
      $rootScope.selectedView = {
        value: _.find($rootScope.views, ["id", "details"])
      };
      $rootScope.selectedRegion = {
        value: _.find($rootScope.regions_options, ["id", id + ""])
      };
      window.location = "#/details?id=" + id;
    };

    $rootScope.goToCompare = function(id1, id2) {
      $rootScope.selectedRegion = {
        value: _.find($rootScope.regions_options, ["id", id1 + ""])
      };
      $rootScope.selectedVsRegion = {
        value: _.find($rootScope.regions_options, ["id", id2 + ""])
      };
      window.location = "#/compare?id=" + id1 + "&id2=" + id2;
    };

    $rootScope.hoverMap = function(id) {
      //console.log('hoverMap',id);
    };

    $rootScope.unhoverMap = function(id) {
      //console.log('unhoverMap',id);
    };

    $rootScope.romanize = function(num) {
      var lookup = {
          M: 1000,
          CM: 900,
          D: 500,
          CD: 400,
          C: 100,
          XC: 90,
          L: 50,
          XL: 40,
          X: 10,
          IX: 9,
          V: 5,
          IV: 4,
          I: 1
        },
        roman = "",
        i;
      for (i in lookup) {
        while (num >= lookup[i]) {
          roman += i;
          num -= lookup[i];
        }
      }
      return roman;
    };

    function renderMap() {
      var sizes = $rootScope.map.container.node().getBoundingClientRect();

      var width = sizes.width,
        height = 600;

      $rootScope.map.svg = $rootScope.map.container
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      var chile = REGIONES_TOPOJSON; //from regiones.json

      var projection = d3.geo
        .mercator()
        .scale(650)
        .translate([width / 2, height / 2])
        .precision(0.1)
        .center([-70, -39]);

      var back = $rootScope.map.svg
        .append("rect")
        .attr("class", "svg-back")
        .style("fill", "#fff")
        .style("opacity", 1)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .on("click", function(d) {
          //that.unselect();
        });

      var pathsGroup = $rootScope.map.svg
        .append("g")
        .attr("class", "paths-group");

      var regiones = pathsGroup
        .selectAll(".region")
        .data(topojson.feature(chile, chile.objects.regiones).features)
        .enter()
        .append("path")
        .attr("class", function(d) {
          return "region";
        })
        .attr("id", function(d) {
          return "region-" + d.id;
        })
        .attr("d", d3.geo.path().projection(projection))
        .style("fill", function(d) {
          return "#ddd";
        })
        .on("click", function(d) {
          switch ($rootScope.selectedView.value.id) {
            case "main":
              $rootScope.goToDetail(d.id);
              break;
            case "details":
              $rootScope.$apply(function() {
                $rootScope.selectedRegion = {
                  value: _.find($rootScope.regions_options, ["id", d.id + ""])
                };
              });
              $rootScope.regionChanged();
              break;
            case "compare":
              $rootScope.$apply(function() {
                $rootScope.selectedVsRegion = {
                  value: _.find($rootScope.regions_options, ["id", d.id + ""])
                };
                $rootScope.vsRegionChanged();
              });
              break;
          }
        });
    }

    //init
    TabletopService.getData().then(dataLoaded);
    renderMap();
  });
