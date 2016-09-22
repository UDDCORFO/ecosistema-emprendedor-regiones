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
      .when('/details/:id', {
        templateUrl: 'views/details.html',
        controller: 'DetailsCtrl',
        controllerAs: 'details'
      })
      .when('/compare/:id1/:id2?', {
        templateUrl: 'views/compare.html',
        controller: 'CompareCtrl',
        controllerAs: 'compare'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .service('ColorService', function () {

    this.getThresholdScale = function(min,max){
      var d = (max-min)/10;
      return d3.scale.threshold()
//          .range(['#bcbddc','#b1abd3','#a69bcb','#9b8ac3','#907aba','#8469b1','#7958a9','#6d49a0','#613897','#54278f'])
          .range(['#001d34','#2a2734','#443233','#5e3d32','#784830','#92532d','#ac5f29','#c76b23','#e27619','#ff8303'])
          .domain([min+1*d,min+2*d,min+3*d,min+4*d,min+5*d,min+6*d,min+7*d,min+8*d,min+9*d,min+10*d]);
    };

    this.paintMap = function(data){

      angular.forEach(data,function(r){
        d3.select("path#region-"+r.id)
          .transition()
          .duration(1000)
          .style('fill',r.color);
      });

    };

    this.selectRegion = function(id1,id2){

      d3.selectAll("path.region")
        .transition()
        .duration(1000)
        .style('fill',function(d){
          if(d.id==id1){
            return '#ff9900';
          } else if(id2 && d.id==id2){
            return '#001D34';
          } else {
            return '#ddd';
          }
        });

    };

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
                    var integers = ['region'];
                    angular.forEach(r,function(value,ix){
                      if(integers.indexOf(ix)>-1){
                        r[ix] = parseInt(value.replace(/\./g,''));
                      }else{
                        r[ix] = parseFloat((value+'').replace(/\,/g,'.'));
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
  .run(function(TabletopService, $rootScope, ColorService, $location) {

    $rootScope.loading = true;
    $rootScope.map = {
      container:  d3.select("#mapa"),
      svg: null
    };

    $rootScope.dimension_labels = {
      general: 'Índice general',
      n_opp: 'Percepción de Oportunidades',
      n_start: 'Habilidades de Emprendimiento',
      n_risk: 'Tolerancia al Riesgo',
      n_network: 'Calidad de redes de trabajo',
      n_cultsupp: 'Aceptación cultural al emprendimiento',
      n_oppstart: 'Facilidad para iniciar negocios',
      n_techno: 'Absorbción tecnológica',
      n_hc: 'Calidad de los recursos humanos',
      n_compet: 'Nivel de competencia',
      n_pinnov: 'Desarrollo de nuevos productos',
      n_procinn: 'Desarrollo de nuevas tecnologías',
      n_hgrow: 'Creación de empresas de alto crecimiento',
      n_global: 'Internacionalización',
      n_finance: 'Financiamiento disponible'
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

    //$rootScope.colors = ['#bcbddc','#aca4cf','#9b8ac3','#8b72b6','#7958a9','#67409c','#54278f'];

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
      $rootScope.data = $rootScope.fulldata[$rootScope.selectedYear].elements
        .sort(function(a,b){return (a.general<b.general)?1:-1})
        .map(function(d,ix){
          d.ranking = ix+1;
          d.nombre = $rootScope.regions[d.region];
          return d;
        });
      $rootScope.$broadcast("newData");
    };

    $rootScope.goToDetail = function(id){
      $rootScope.$apply(function() {
        $location.path('/details/'+id);
      });
    };

    $rootScope.hoverMap = function(id){
      //console.log('hoverMap',id);
    };

    $rootScope.unhoverMap = function(id){
      //console.log('unhoverMap',id);
    };

    $rootScope.romanize = function(num){

      var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},
          roman = '',
          i;
      for ( i in lookup ) {
        while ( num >= lookup[i] ) {
          roman += i;
          num -= lookup[i];
        }
      }
      return roman;
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
            .style("fill", "#fff")
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
            .attr("class", function(d) { return "region"; })
            .attr("id", function(d) { return "region-" + d.id; })
            .attr("d", d3.geo.path().projection(projection))
            .style("fill",function(d){
              return '#ddd';
            })
            .on("click",function(d){
              $rootScope.goToDetail(d.id);
            });

    }

    //init
    TabletopService.getData().then(dataLoaded);
    renderMap();
    
  });
