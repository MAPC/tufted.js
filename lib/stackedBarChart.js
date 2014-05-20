d3.chart('BaseChart').extend('StackedBarChart', {
  initialize : function() {
    var chart = this;

    chart.xScale = d3.scale.ordinal()
      .rangeRoundBands([0, chart.width()], .1);
    chart.yScale = d3.scale.linear()
      .rangeRound([chart.height(), 0]);
    chart.color = d3.scale.category10();
    chart.duration = 500;

    chart.yAxis = d3.svg.axis()
      .scale(chart.yScale)
      .tickSize(-chart.width(), 0, 0)
      .orient("left")
      .tickFormat(d3.format(".2s"));
 
    chart.on("change:width", function(newWidth) {
      chart.xScale.rangeRoundBands([0, newWidth], 0.1);
    });

    chart.on("change:height", function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    });

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

    // -- actual layers
    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)
 
    chart.areas.legend = chart.base.select('g').append('g')
          .classed('legend', true)

    chart.layer('bars', chart.layers.bars, {
      dataBind: function(data) {
        var chart = this.chart();
 
        var yAxis = d3.svg.axis()
            .scale(chart.yScale)
            .tickSize(-(chart.width()), 0, 0)
            .orient("left")
            .tickFormat(d3.format(".2s"));

        chart.areas.yAxisLayer
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(chart.yAxisLabel());
 
        chart.areas.yAxisLayer
            .selectAll("text")
            .style("font", "10px sans-serif")

        var xAxis = d3.svg.axis()
            .scale(chart.xScale)
            .orient("bottom");

        chart.base.select('g').append('g')
              .classed('x axis', true)
              .attr("transform", "translate(0," + chart.height() + ")")
              .call(xAxis)
              .selectAll("text")
              .style("font", "10px sans-serif")
              .call(chart.wrap, chart.xScale.rangeBand())

        // Bind the data
        return this.selectAll('.category')
          .data(data);
      },
 
      insert: function() {
        var chart = this.chart();
 
        // Append the bars
        return this.append('g')
          .attr('class', 'category');
      },
 
      events: {
 
        "enter": function() {
          var chart = this.chart();
 
          this.attr("transform", function(d, i) { return "translate(" + chart.xScale(d.series) + ",0)"; })
            .selectAll(".category")
              .data(function(d) { return d.groups; })
            .enter().append("rect")
              .attr("class", "bar")
              // .attr("transform", function(d) { return "translate(" + chart.xScale(d.series) + ",0)"; })
              .attr("width", chart.xScale.rangeBand())
              .attr("y", function(d) { return chart.yScale(d.y1); })
              .attr("height", function(d) { return chart.yScale(d.y0) - chart.yScale(d.y1); })
              .style("fill", function(d) { return chart.color(d.name); });
        }
      },
    });

    },

    transform: function(data) {
      var _data = data;
      var chart = this;

      chart.color.domain(d3.keys(data[0]).filter(function(key) { return key !== "series"; }));

      _data.forEach(function(d) {
        var y0 = 0;
        d.groups = chart.color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.groups[d.groups.length - 1].y1;
      });

      data.sort(function(a, b) { return b.total - a.total; });
      
      chart.xScale.domain(data.map(function(d) { return d.series; }));
      chart.yScale.domain([0, d3.max(data, function(d) { return d.total; })]);
      
      return data;
  }
});