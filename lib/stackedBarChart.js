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

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

    chart.areas.xAxisLayer = chart.base.select('g').append('g')
      .classed('x axis', true)

    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)
 
    chart.areas.legend = chart.base.select('g').append('g')
          .classed('legend', true)

    chart.areas.legend = chart.base.select('g').append('g')
      .attr("transform", "translate(0, -40)");

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
      console.log("stacked bar");
      chart.areas.xAxisLayer.call(chart.xAxis)            
        .selectAll("text")
        .call(chart.wrap, chart.xScale.rangeBand());

      chart.xScale.rangeRoundBands([0, newWidth], 0.1);

      chart.layer("bars")
        .selectAll("g")
          .attr("transform", function(d, i) { return "translate(" + chart.xScale(d.series) + ",0)"; })
        .selectAll("rect")
          .attr("width", chart.xScale.rangeBand());
    });

    chart.on("change:height", function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    });

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

        chart.base
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", -((chart.height() / 2) + chart._margin.top))
            .style("text-anchor", "middle")
            .text(chart.yAxisLabel());

        chart.areas.yAxisLayer
            .selectAll("text")
            .style("font-family", chart.font)
            .style("font-size", chart.font_size)

        chart.xAxis = d3.svg.axis()
            .scale(chart.xScale)
            .orient("bottom");

        chart.areas.xAxisLayer
              .attr("transform", "translate(0," + chart.height() + ")")
              .call(chart.xAxis)
            .selectAll("text")
              .style("font-family", chart.font)
              .style("font-size", chart.font_size)
              .style("text-anchor", "middle")
              .call(chart.wrap, chart.xScale.rangeBand())

        chart.areas.legend =
          chart.areas.legend
          .selectAll(".legend")
          .data(data[0].groups)
          .enter().append("g")
          .attr("class", "legend")
          
        chart.areas.legend
            .append("circle")
              .attr("r", 5)
              .attr("cx", function(d,i) {
                return 1 + (i * 100);
              })
              .attr("fill", function(d) {
                return chart.colorScale(d.name);
              })
              .attr("cy", 5)

        chart.areas.legend
            .append("text")
            .attr("transform", function (d,i) {
              return "translate(" + (10 + (i*100)) + ",0)";
            })
            .attr("dy", ".71em")
            .attr("x", 0)
            .attr("y", 0)
            .style("font-family", chart.font)
            .style("font-size", chart.font_size)
            .text(function(d) { 
              return d.name;
            })
            .call(chart.wrap, 85)

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
              .style("fill", function(d) { return chart.color(d.name); })
              .on("mousemove", function(d) {
                chart.tooltip((d.y1-d.y0), chart.layers.bars[0][0], chart.areas.tooltip);
              })
              .on("mouseout", function(d) {
                chart.areas.tooltip.attr("display", "none");
              });

              
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