
  //  you can map the properties out of a geojson to create a new dataset for the other charts. 
  // var array; geojson.features.forEach(function(d){ return array.push(d.properties); });
  // more types: choropleth, bubble chart, and heat?
  // for choropleth, pass an array of options that lets use switch which column to visualize... re-setting scale on color scale might be tough...


d3.chart("BaseChart").extend("choroplethMap", {

  initialize: function() {
    var chart = this; 

    chart.on('change:width', function(newWidth) {

    });

    chart.layers.canvas = chart.base.select('g').append('rect')
      .classed('map', true).attr('width', chart.width()).attr('height', chart.height())
        .style('stroke', 'none').style('fill', 'none');

    chart.layers.map = chart.base.select('g')

    chart.layer('map', chart.layers.map, {

      dataBind: function(data) {
        var chart = this.chart();

        return this.selectAll("path")
          .data(data);
      },

      insert: function() {
        return this.append('path')
          .attr('class', function(d,i){
            return "feature-" + i;
          });
      },

      // define lifecycle events
      events: {
        'enter': function() {
          var chart = this.chart();

          this.attr("d", chart.path)
            this.style("opacity", 0)


        },
        'merge:transition': function () {
          this.duration(400).
          style("opacity", 1)
            .style("fill", "lightblue")
            .style("stroke-width", "1")
            .style("stroke", "white")
        }
      }
    });

  },

  // set/get the color to use for the circles as they are
  // rendered.
  transform: function(data) {
    var chart = this;
    chart.center = d3.geo.centroid(data);
    chart.scale  = 150;
    chart.offset = [chart.width()/2, chart.height()/2];
    chart.projection = d3.geo.mercator().scale(chart.scale).center(chart.center)
          .translate(chart.offset);

    chart.path = d3.geo.path().projection(chart.projection);

    chart.bounds  = chart.path.bounds(data);
    chart.hscale  = chart.scale*chart.width()  / (chart.bounds[1][0] - chart.bounds[0][0]);
    chart.vscale  = chart.scale*chart.height() / (chart.bounds[1][1] - chart.bounds[0][1]);
    chart.scale   = (chart.hscale < chart.vscale) ? chart.hscale : chart.vscale;
    chart.offset  = [chart.width() - (chart.bounds[0][0] + chart.bounds[1][0])/2,
                      chart.height() - (chart.bounds[0][1] + chart.bounds[1][1])/2];



    chart.projection = d3.geo.mercator().center(chart.center)
      .scale(chart.scale).translate(chart.offset);

    chart.path = chart.path.projection(chart.projection);

    return data.features;
  }
});