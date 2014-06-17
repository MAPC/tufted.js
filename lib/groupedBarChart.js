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

        var xAxis = d3.svg.axis()
          .scale(chart.xScale)
          .orient("bottom")

        if (chart._tickValues.length > 0) {
          xAxis.tickValues(chart._tickValues);
        }

        chart.base.select('g').append('g')
              .classed('x axis', true)
              .attr("transform", "translate(0," + chart.height() + ")")
              .call(xAxis)
              .selectAll("text")
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
            .selectAll(".bar")
            .data(function(d) {return d.values;})
            .enter()
          .append("rect")
            .attr("title", function(d) { return d.name })
            .attr("data-content", function(d) { return  "Estimate: " + d.value + '%' })
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

          // this.selectAll("text")
          //     .data(function(d) { return d.values})
          //   .enter().append("text")
          //     .style("text-anchor", "middle")
          //     .attr("x", function(d) { return chart.x1Scale(d.name) + chart.x1Scale.rangeBand()/2 })
          //     .attr("y", function(d) { return chart.yScale(d.value/2); })
          //     .text(function(d) { return d.value })

          // this.selectAll("line")
          //     .data(function(d) { return d.values })
          //   .enter().append("line")
          //     .attr("class", "error")
          //     .attr("x1", function(d) { return chart.x1Scale(d.name) + (chart.x1Scale.rangeBand()/2); })
          //     .attr("y1", function(d) { return chart.yScale((d.value + d.error)) })
          //     .attr("x2", function(d) { return chart.x1Scale(d.name) + (chart.x1Scale.rangeBand()/2); })
          //     .attr("y2", function(d) { return chart.yScale((d.value - d.error)) })
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
      console.log(data);
      return data;
  }
});