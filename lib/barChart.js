d3.chart("BaseChart").extend("BarChart", {

  initialize: function() {
    var chart = this; 

    chart.xScale = d3.scale.ordinal().rangeRoundBands([0, chart.width()], 0.1);
    chart.yScale = d3.scale.linear().rangeRound([chart.height(), 0]);
    chart.color = d3.scale.category10();
    chart.duration = 500;

    chart.on('change:height', function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    }); 
    // chart.areas.yAxisLayer = chart.base.select('g').append('g')
    //       .classed('ylabels', true)

    chart.areas.xAxisLayer = chart.base.append('g').classed('x axis',true)
    chart.areas.yAxisLayer = chart.base.append('g').classed('y axis', true)
                    
    chart.attach('xAxis', chart.areas.xAxisLayer);
    chart.attach('yAxis', chart.areas.yAxisLayer);

    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)

    chart.layers.barLabels = chart.base.select('g').append('g')
        .classed('bars', true);

    chart.areas.tooltip = chart.base.select("g")
      .append("g")      
      .attr("id", "tooltip")
      .attr("display", "none")
      .attr("position", "absolute")
      .attr("pointer-events","none");

    chart.areas.tooltip
      .append("rect")
      .attr("fill", "white")
      .attr("rx", 5)
      .attr("ry", 5);

    chart.areas.tooltip
      .append("text");

    chart.on('change:width', function(newWidth) {
      chart.attach('yAxis', chart.areas.yAxisLayer);

      chart.xScale.rangeRoundBands([0, newWidth], 0.1);
      chart.layer("bars").selectAll("rect").attr("width", function(d) { return chart.xScale.rangeBand(); })
            .attr('x', function(d) { return chart.xScale(d.name); });
    });

    chart.layer('bars', chart.layers.bars, {

      dataBind: function(data) {

        var chart = this.chart();

        chart.areas.xAxisLayer.attr("transform", "translate(0," + chart.height() + ")")
                    .chart('Axis', {parent: chart, setScale: chart.xScale, orient: "bottom", wrap: true});

        chart.areas.yAxisLayer
                    .chart('Axis', {parent: chart, setScale: chart.yScale, orient: "left", tickFormat: chart._yFormat });

        chart.base
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", -((chart.height() / 2) + chart._margin.top))
            .style("text-anchor", "middle")
            .text(chart.yAxisLabel());

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
            .attr("class", "bar")
            .attr('y', function(d) { return chart.yScale(0); })
            .attr('width', chart.xScale.rangeBand())
            .attr('height', 0)
            .style('fill', function(d) {return chart.colorScale(d.name);})
            .on("mousemove", function(d) {
              chart.tooltip(d.value, this, chart.areas.tooltip);
            })
            .on("mouseout", function(d) {
              chart.areas.tooltip.attr("display", "none");
            })
        },

        'enter:transition': function() { 
          var chart = this.chart();

          this.duration(chart.duration)
            .attr('y', function(d) { return chart.yScale(d3.max([0, d.value])); })
            .attr('height', function(d) { return Math.abs(chart.yScale(d.value) - chart.yScale(0)); });            

        }
      }
    });

    chart.layer('labels', chart.layers.barLabels, { 
      dataBind: function(data) {
        return this.selectAll(".labels")
                  .data(data)
      },
      insert: function() {
        return this.append('text')
      },

      events: {
        'enter': function() {
          var chart = this.chart();

          this.attr("text-anchor", "middle")
            .attr("x", function(d) { return chart.xScale(d.name) + (chart.xScale.rangeBand() / 2); })
            .attr("y", function(d) { return chart.yScale(d.value); })
            .text(function(d) { return d.value });

        }
      }
    });

  },

  transform: function(data) {
    var chart = this;
    var max = d3.max(data, function(d) { return parseInt(d.value) });
    var min = d3.min(data, function(d) { return parseInt(d.value) });

    if (min > 0) {
      min = 0;
    }
    // // update the scales
    chart.xScale.domain(data.map(function(d) { return d.name; }));
    chart.yScale.domain([min,max]);

    return data;
  }
});