d3.chart("BaseChart").extend("BarChart", {

  initialize: function() {
    var chart = this;

    chart.xScale = d3.scale.ordinal().rangeRoundBands([0, chart.width()], 0.1);
    chart.yScale = d3.scale.linear().rangeRound([chart.height(), 0]);
    chart.color = d3.scale.category10();
    chart.duration = 500;

    chart.on('change:width', function(newWidth) {
      chart.xScale()
      chart.xScale.rangeRoundBands([0, newWidth], 0.1);
      chart.layer("bars").selectAll("rect").attr("width", function(d) { return chart.xScale.rangeBand(); }).attr('x', function(d) { return chart.xScale(d.name); });
    });

    chart.on('change:height', function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    }); 

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

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

    chart.layer('bars', chart.layers.bars, {

      dataBind: function(data) {

        var chart = this.chart();
        
        var yAxis = d3.svg.axis()
            .scale(chart.yScale)
            .tickSize(-(chart.width()), 0)
            .orient("left")
            .tickFormat(chart.format());
            var formatSomething = d3.format("$011,.2f");

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
            .style("font-family", chart.font)
            .style("font-size", chart.font_size)

        var xAxis = d3.svg.axis()
          .scale(chart.xScale)
          .orient("bottom");
        chart._xAxis = xAxis;

        if (chart._tickValues.length > 0) {
          xAxis.tickValues(chart._tickValues);
        }

        chart.base.select('g').append('g')
              .classed('x axis',true)
              .attr("transform", "translate(0," + chart.height() + ")")
              .call(xAxis)
            .selectAll("text")
              .style("font-family", chart.font)
              .style("font-size", chart.font_size)
              .style("text-anchor", "middle")
              .call(chart.wrap, 60)

        chart.areas.legend =
          chart.areas.legend
          .selectAll(".legend")
          .data(chart.xScale.domain())
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
            .attr("data-content", function(d) { return d.value })
            .attr("data-legend", function(d) { return d.name })
            .attr('y', function(d) { return chart.yScale(0); })
            .attr('width', chart.xScale.rangeBand())
            .attr('height', 0)
            .style('fill', function(d) {return chart.colorScale(d.name);})
            .on("mousemove", function(d) {
              chart.tooltip(d.value, this, chart.areas.tooltip);
            })
            .on("mouseout", function(d) {
              chart.areas.tooltip.attr("display", "none");
            });
        },

        'enter:transition': function() { 
          var chart = this.chart();

          this.duration(chart.duration)
            .attr('y', function(d) { return chart.yScale(d3.max([0, d.value])); })
            .attr('height', function(d) { return Math.abs(chart.yScale(d.value) - chart.yScale(0)); });            

        }
      }
    });

  },

  action: function () {
    this.trigger("acted", "action executed!");
  },
  // set/get the color to use for the circles as they are
  // rendered.
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