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
      .orient("left");

    chart.areas.xAxisLayer = chart.base.append('g').classed('x axis',true)
    chart.areas.yAxisLayer = chart.base.append('g').classed('y axis', true)
                    
    chart.attach('xAxis', chart.areas.xAxisLayer);
    chart.attach('yAxis', chart.areas.yAxisLayer);

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

        chart.base
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", -((chart.height() / 2) + chart._margin.top))
            .style("text-anchor", "middle")
            .text(chart.yAxisLabel());

        chart.areas.xAxisLayer.attr("transform", "translate(0," + chart.height() + ")")
                    .chart('Axis', {parent: chart, setScale: chart.xScale, orient: "bottom"});

        chart.areas.yAxisLayer
                    .chart('Axis', {parent: chart, setScale: chart.yScale, orient: "left", tickFormat: chart._yFormat });

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
              .style("fill", function(d) { return chart.colorScale(d.name); })
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
      var chart = this; 
      chart.data = data;

      var groups = d3.keys(chart.data[0]).filter(function(key) { return key !== "series"; });

      chart.data.forEach(function(d) {
        var y0 = 0;
        d.groups = groups.map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.groups[d.groups.length - 1].y1;
      });
      
      chart.xScale.domain(chart.data.map(function(d) { return d.series; }));
      chart.yScale.domain([0, d3.max(chart.data, function(d) { return d.total; })]);
      
      return chart.data;
  }
});