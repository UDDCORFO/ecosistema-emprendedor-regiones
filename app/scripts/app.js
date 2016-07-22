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
      console.log($rootScope.data);
    };

    function renderMap(){

        var sizes = $rootScope.map.container.node().getBoundingClientRect();

        var width = sizes.width,
            height = 600;

        $rootScope.map.svg = $rootScope.map.container.append("svg")
            .attr("width", width)
            .attr("height", height);

        var chile = REGIONES_TOPOJSON; //from regiones.json
        
        console.log((width/100)*130);
        var projection = d3.geoMercator()
            .scale(650)
            .translate([width / 2, height / 2])
            .precision(0.1)
//            .rotate([0,-250,0])
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
            .attr("d", d3.geoPath().projection(projection))
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
