'use strict';

/**
 * @ngdoc overview
 * @name ecosistemaEmprendedorRegionesApp
 * @description
 * # ecosistemaEmprendedorRegionesApp
 *
 * Main module of the application.
 */
angular
  .module('ecosistemaEmprendedorRegionesApp', [
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .service('TabletopService', function ($q) {

    this.data = false;

    this.loading = false;

    this.getData = function(){
      var that = this;
      return $q(function(resolve, reject) {
        if(!that.data){
          Tabletop.init( { key: '1mB7Mes_YsCRTKNEvVTxQMDXtN17BGakWOxlx7MlRPWM',
                  callback: function(data, tabletop) { 
                    that.data = data;
                    resolve(angular.copy(that.data));
                  },
                  simpleSheet: false,
                  parseNumbers: false,
                  postProcess: function(r){
                    var integers = ['npinnov','nprocinn','nfinance'];
                    angular.forEach(r,function(value,ix){
                      if(integers.indexOf(ix)>-1){
                        r[ix] = parseInt(value.replace(/\./g,''));
                      }else{
                        r[ix] = parseFloat(value);
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
  .run(function(TabletopService,$rootScope) {

    $rootScope.loading = true;
    $rootScope.map = {
      container:  d3.select("#mapa"),
      svg: null
    };

    $rootScope.dimension_labels = {
      n_opp: 'n_opp',
      n_start: 'n_start',
      n_risk: 'Riesgo',
      n_network: 'n_network',
      n_cultsupp: 'n_cultsupp',
      n_oppstart: 'n_oppstart',
      n_techno: 'n_techno',
      n_hc: 'n_hc',
      n_compet: 'n_compet',
      n_pinnov: 'n_pinnov',
      n_procinn: 'n_procinn',
      n_hgrow: 'n_hgrow',
      n_global: 'n_global',
      n_finance: 'n_finance'
    };

    $rootScope.dimension_options = [];
    angular.forEach($rootScope.dimension_labels,function(v,k){
      return $rootScope.dimension_options.push({key:k,value:v});
    });

    $rootScope.regions = {
      1:'Tarapacá',
      2:'Antofagasta',
      3:'Atacama',
      4:'Coquimbo',
      5:'Valparaíso',
      6:'O\'Higgins',
      7:'Maule',
      8:'Bío-Bío',
      9:'La Araucanía',
      10:'Los Lagos',
      11:'Aysén',
      12:'Magallanes',
      13:'Metropolitana de Santiago',
      14:'Los Ríos',
      15:'Arica y Parinacota'
    };

    var pymChild = new pym.Child({ polling: 1000 });
    pymChild.sendHeight();

    function dataLoaded(data){
      $rootScope.fulldata = data;
      $rootScope.years = _.keys($rootScope.fulldata);
      $rootScope.years = $rootScope.years.map(function(e){return parseInt(e);}).sort().reverse();
      $rootScope.selectedYear = $rootScope.years[0];
      $rootScope.loading = false;
      $rootScope.yearChanged();
    };

    $rootScope.yearChanged = function(){
      $rootScope.data = $rootScope.fulldata[$rootScope.selectedYear].elements;
      $rootScope.$broadcast("newData");
    };

    function renderMap(){

        var sizes = $rootScope.map.container.node().getBoundingClientRect();

        var width = sizes.width,
            height = 600;

        $rootScope.map.svg = $rootScope.map.container.append("svg")
            .attr("width", width)
            .attr("height", height);

        var chile = REGIONES_TOPOJSON; //from regiones.json
        
        var projection = d3.geo.mercator()
            .scale(650)
            .translate([width / 2, height / 2])
            .precision(0.1)
            .center([-70,-39]);

        var back = $rootScope.map.svg
            .append("rect")
            .attr("class", 'svg-back')
            .style("fill", "#ff9900")
            .style("opacity", 1)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .on("click",function(d){
                //that.unselect();
            });

        var pathsGroup = $rootScope.map.svg
            .append("g")
            .attr("class", 'paths-group');

        var regiones = pathsGroup.selectAll(".region")
            .data(topojson.feature(chile, chile.objects.regiones).features)
            .enter()
            .append("path")
            .attr("class", function(d) { return "region " + d.id; })
            .attr("id", function(d) { return "region-" + d.id; })
            .attr("d", d3.geo.path().projection(projection))
            .style("fill",function(d){
              return '#ff0000';
              /*var value = that.getRegion(d.id);
              return that.quantize(value.conformado_porcentaje);*/
            });

    }

    //init
    TabletopService.getData().then(dataLoaded);
    renderMap();
    
  });
