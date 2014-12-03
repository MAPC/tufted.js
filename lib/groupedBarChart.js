d3.chart('BaseChart').extend('GroupedBarChart', {
  initialize : function() {
    var chart = this;

    chart.xScale = d3.scale.ordinal()
      .rangeRoundBands([0, chart.width()], 0.1);
    chart.x1Scale = d3.scale.ordinal();
    chart.yScale = d3.scale.linear()
      .range([chart.height(), 0]);
    chart.color = d3.scale.category10();
    chart.duration = 500;

    chart.yAxis = d3.svg.axis()
      .scale(chart.yScale)
      .tickSize(-chart.width(), 0, 0)
      .orient("left")
      .tickFormat(d3.format(".2s"));

    chart.areas.xAxisLayer = chart.base.append('g').classed('x axis',true)
    chart.areas.yAxisLayer = chart.base.append('g').classed('y axis', true)
                    
    chart.attach('xAxis', chart.areas.xAxisLayer);
    chart.attach('yAxis', chart.areas.yAxisLayer);

    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)

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
      chart.x1Scale.rangeRoundBands([0, chart.xScale.rangeBand()]);

      chart.layer("bars")
        .selectAll("g")
          .attr("transform", function(d, i) { return "translate(" + chart.xScale(d.series) + ",0)"; })
        .selectAll("rect")
          .attr("width", chart.x1Scale.rangeBand())
          .attr("x", function(d) { return chart.x1Scale(d.name); })
    });
    
    chart.on("change:height", function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    });

    chart.layer('bars', chart.layers.bars, {
      dataBind: function(data) {
        var chart = this.chart();

        chart.areas.xAxisLayer.attr("transform", "translate(0," + chart.height() + ")")
                    .chart('Axis', {parent: chart, setScale: chart.xScale, orient: "bottom"});

        chart.areas.yAxisLayer
                    .chart('Axis', {parent: chart, setScale: chart.yScale, orient: "left", tickFormat: chart._yFormat });

        chart.base
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", -((chart.height() / 2) + chart._margin.top))
            .style("text-anchor", "middle")
            .text(chart.yAxisLabel());

        chart.areas.legend =
          chart.areas.legend
            .selectAll(".legend")
            .data(chart.x1Scale.domain())
            .enter().append("g")
            .attr("class", "legend")

        chart.areas.legend
            .append("circle")
              .attr("r", 5)
              .attr("cx", function(d,i) {
                return 1 + (i * 100);
              })
              .attr("fill", function(d) {
                return chart.colorScale(d);
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
              return d;
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
      }
      ,
 
      events: {
 
        "enter": function() {
          var chart = this.chart();

          this.attr("transform", function(d, i) { return "translate(" + chart.xScale(d.series) + ",0)"; })
            .selectAll(".bar")
            .data(function(d) {return d.values;})
            .enter()
          .append("rect")
            .attr("title", function(d) { return d.name })
            .attr("data-content", function(d) { return d.value })
            .attr('class', 'bar')
            .attr("data-legend", function(d) { return d.name })
            .attr("width", chart.x1Scale.rangeBand())
            .style("fill", function(d,i) { return chart.colorScale(d.name);; })
            .attr("x", function(d) { return chart.x1Scale(d.name); })
            .attr('y', function(d) { return chart.yScale(0); })
            .attr("height", "0")
            .on("mousemove", function(d) {
              chart.tooltip(d.value, chart.layers.bars[0][0], chart.areas.tooltip);
            })
            .on("mouseout", function(d) {
              chart.areas.tooltip.attr("display", "none");
            });
        },
 
        "merge:transition": function() {
          var chart = this.chart();

          this.duration(chart.duration)
              .attr("transform", function(d, i) {return "translate(" + chart.xScale(d.series) + ",0)"; })
            .selectAll(".bar")
              .attr("width", chart.x1Scale.rangeBand())
            .attr('y', function(d) { return chart.yScale(d3.max([0, d.value])); })
            .attr('height', function(d) { return Math.abs(chart.yScale(d.value) - chart.yScale(0)); });
        }
      },
    });

    },

    transform: function(data) {
      var chart = this;

      var buffer = [];
      var x1domain = data[0].values.forEach(function(d) {
        buffer.push(d.name);
      });
      
      var max = d3.max(data, function(d) { 
        return d3.max(d.values, function(d) { 
          return d.value; 
        }); 
      });

      var min = d3.min(data, function(d) {
        return d3.min(d.values, function(d) {
          return d.value;
        })
      });

      if (min > 0) {
        min = 0;
      }

      chart.xScale.domain(data.map(function(d) { return d.series; }));
      chart.x1Scale.domain(buffer).rangeRoundBands([0, chart.xScale.rangeBand()]);
      chart.yScale.domain([min, max]);

      return data;
  }
});