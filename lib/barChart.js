d3.chart("BaseChart").extend("BarChart", {

  initialize: function() {
    var chart = this;

    chart.xScale = d3.scale.ordinal().rangeRoundBands([0, chart.width()], 0.1);
    chart.yScale = d3.scale.linear().range([chart.height(), 0]);
    chart.color = d3.scale.category10();
    chart.duration = 500;

    chart.on('change:width', function(newWidth) {
      chart.xScale.rangeRoundBands([0, newWidth], 0.1);
    });

    chart.on('change:height', function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    }); 

    chart.areas = {};

    chart.layers = {};

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)

    // create a layer of circles that will go into
    // a new group element on the base of the chart
    chart.layer('bars', chart.layers.bars, {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function(data) {

        var yAxis = d3.svg.axis()
            .scale(chart.yScale)
            .tickSize(-(chart.width()), 0, 0)
            .orient("left")
            .tickFormat(d3.format(".2s"));

        chart.areas.yAxisLayer
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -35)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Percent");

        var xAxis = d3.svg.axis()
          .scale(chart.xScale)
          .orient("bottom");

        chart.base.select('g').append('g')
              .classed('x axis',true)
              .attr("transform", "translate(0," + chart.height() + ")")
              .call(xAxis)
              .selectAll("text")
              .call(chart.wrap, 50)

      return this.selectAll('.bar')
        .data(data);
      },

      // insert actual rects
      insert: function() {
        return this.append('rect')
          .attr('class', function(d,i){
            return "bar-" + i;
          });
      },


      // define lifecycle events
      events: {
        'enter': function() {
          var chart = this.chart();

          this.attr('x', function(d) { return chart.xScale(d.name); })
            .attr("title", function(d) { return d.name })
            .attr("data-content", function(d) { return  "Estimate: " + d.value + '%' })
            .attr('y', function(d) { return chart.yScale(0); })
            .attr('fill', function(d) {return chart.color(d.name);})
            .attr('width', chart.xScale.rangeBand())
            .attr('height', 0);
        },

        'enter:transition': function() {
          var chart = this.chart();

          this.duration(chart.duration)
            .attr('y', function(d) { return chart.yScale(d3.max([0, d.value])); })
            .attr('height', function(d) { return Math.abs(chart.yScale(d.value) - chart.yScale(0)); });

          $(document).ready(function () {
              $("svg rect").popover({
                  'container': 'body',
                  'placement': 'right',
                  'trigger': 'hover',
                  'html': true
              });
          });
        }
      }
    });



  },
  // set/get the color to use for the circles as they are
  // rendered.
  transform: function(data) {
    var chart = this;

    // // update the scales
    chart.xScale.domain(data.map(function(d) { return d.name; }));
    chart.yScale.domain(d3.extent(data, function(d) {return d.value;}));

    return data;
  }
});