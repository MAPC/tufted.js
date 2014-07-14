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
 
    chart.on("change:width", function(newWidth) {
      chart.xScale.rangeRoundBands([0, newWidth], 0.1);
    });

    chart.on("change:height", function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    });

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)

    chart.areas.legend = chart.base.select('g').append('g')
      .attr("transform", "translate(0, -40)");

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
            .style("font-family", chart.font)
            .style("font-size", chart.font_size)

        var xAxis = d3.svg.axis()
          .scale(chart.xScale)
          .orient("bottom");

        chart.base.select('g').append('g')
              .classed('x axis', true)
              .attr("transform", "translate(0," + chart.height() + ")")
              .call(xAxis)
            .selectAll("text")
              .style("font-family", chart.font)
              .style("font-size", chart.font_size)
              .style("text-anchor", "middle")
              .call(chart.wrap, chart.xScale.rangeBand())

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
      },
 
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
            .attr("height", 0);

        chart.areas.legend
          .append("ul")
          .selectAll("li")
          .data(chart.x1Scale.domain())
          .enter()
            .append("li")
            .style("color", function(d,i) { return chart.colorScale(d) })
            .style("font-size", "2.2em")
            .style("line-height", ".4em")
              .append("span")
              .style("color", "black")
              .style("font-size", ".40em")
              .text(function(d) { return d });
        },
 
        "merge:transition": function() {
          var chart = this.chart();

          this.duration(chart.duration)
              .attr("transform", function(d, i) {return "translate(" + chart.xScale(d.series) + ",0)"; })
            .selectAll(".bar")
              .attr("width", chart.x1Scale.rangeBand())
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
      },
    });

    },


    transform: function(data) {
      var chart = this;

      // data standards? :(
      // var series = [];
      // data.forEach(function(d){
      //   series.push(d.series);
      // });
      // var keys = d3.set(series).values();

      // var newData = [];

      // keys.forEach(function(series) {
      //   var values = [];
      //   var filter = data.filter(function(element) { 
      //     return element.series == series 
      //   });

      //   filter.forEach(function(d){
      //     values.push({ "name": d.name, "value": d.value })
      //   });

      //   newData.push({ "series": series, "values": values })
      // });



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
      // chart.colorScale
      //   .domain(chart.x1Scale());
      return data;
  }
});