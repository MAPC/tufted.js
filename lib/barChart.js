d3.chart("BaseChart").extend("BarChart", {

  initialize: function() {
    var chart = this;

    chart.xScale = d3.scale.ordinal().rangeRoundBands([0, chart.width()], 0.1);
    chart.yScale = d3.scale.linear().rangeRound([chart.height(), 0]);
    chart.color = d3.scale.category10();
    chart.duration = 500;

    chart.on('change:width', function(newWidth) {
      chart.xScale.rangeRoundBands([0, newWidth], 0.1);
    });

    chart.on('change:height', function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    }); 

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)

    var selection = chart.base.node().parentNode
    chart.areas.legend = d3.select(chart.base.node().parentNode).append("div");

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

        if (chart._tickValues.length > 0) {
          xAxis.tickValues(chart._tickValues);
        }

        chart.base.select('g').append('g')
              .classed('x axis',true)
              .attr("transform", "translate(0," + chart.height() + ")")
              .call(xAxis)
              .selectAll("text")
              .style("font", "10px sans-serif")
              .call(chart.wrap, 50)

        chart.areas.legend
          .append("ul")
          .selectAll("li")
          .data(chart.xScale.domain())
          .enter()
            .append("li")
            .style("color", function(d,i) { return chart.colorScale(d) })
            .style("font-size", "2.2em")
            .style("line-height", ".4em")
              .append("span")
              .style("color", "black")
              .style("font-size", ".40em")
              .text(function(d) { return d });

        // chart.areas.legend
        //   .selectAll("circle")
        // .data(chart.xScale.domain())
        //   .enter()
        //   .append("circle")
        //   .attr("cx", chart.width() + chart._margin.right/8 )
        //   .attr("cy", function(d,i) {
        //     return  i * 15 })
        //   .attr("r", 5)
        //   .attr("fill", chart.color)

        // chart.areas.legend
        //   .selectAll("text")
        // .data(chart.xScale.domain())
        //   .enter()
        //   .append("text")
        //   .attr("x", chart.width() + chart._margin.right/8 + 15)
        //   .attr("y", function(d,i) {
        //     return i * 15 
        //   })
        //   .attr("dy", ".35em")
        //   .style("text-anchor", "beginning")
        //   .text(function(d) { return d; });

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
            .attr("data-legend", function(d) { return d.name })
            .attr('y', function(d) { return chart.yScale(0); })
            .attr('width', chart.xScale.rangeBand())
            .attr('height', 0)
            .on("mouseover", function() {
              d3.select(this)
                .style("opacity", 1)
            })
            .on("mouseout", function() {
              d3.select(this)
                .style("opacity", 0.8)
            })
            .style('fill', function(d) {return chart.colorScale(d.name);});
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

    var max = d3.max(data, function(d) { return d.value });
    var min = d3.min(data, function(d) { return d.value });

    if (min > 0) {
      min = 0;
    }

    // // update the scales
    chart.xScale.domain(data.map(function(d) { return d.name; }));
    chart.yScale.domain([min,max]);

    return data;
  }
});