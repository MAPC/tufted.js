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
 

    chart.areas = {};

    // cache for selections that are layer bases.
    chart.layers = {};

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

    // -- actual layers
    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)
 
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
            .attr("y", -35)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Percent");
 
        var xAxis = d3.svg.axis()
          .scale(chart.xScale)
          .orient("bottom");

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
            .attr("width", chart.x1Scale.rangeBand())
            .style("fill", function(d) { return chart.color(d.name); })
            .attr("x", function(d) { return chart.x1Scale(d.name); })
            .attr("y", chart.height())
            .attr("height", 0);

          this.selectAll("text")
              .data(function(d) { return d.values})
            .enter().append("text")
              .style("text-anchor", "middle")
              .attr("x", function(d) { return chart.x1Scale(d.name) + chart.x1Scale.rangeBand()/2 })
              .attr("y", function(d) { return chart.yScale(d.value/2); })
              .text(function(d) { return d.value })

          this.selectAll("line")
              .data(function(d) { return d.values })
            .enter().append("line")
              .attr("class", "error")
              .attr("x1", function(d) { return chart.x1Scale(d.name) + (chart.x1Scale.rangeBand()/2); })
              .attr("y1", function(d) { return chart.yScale((d.value + d.error)) })
              .attr("x2", function(d) { return chart.x1Scale(d.name) + (chart.x1Scale.rangeBand()/2); })
              .attr("y2", function(d) { return chart.yScale((d.value - d.error)) })
        },
 
        "merge:transition": function() {
          var chart = this.chart();
 
          this.duration(chart.duration)
              .attr("transform", function(d, i) {return "translate(" + chart.xScale(d.series) + ",0)"; })
            .selectAll(".bar")
              .attr("width", chart.x1Scale.rangeBand())
              .attr("x", function(d) { return chart.x1Scale(d.name); })
              .attr("y", function(d, i) { return chart.yScale(d.value); })
              .attr("height", function(d, i) { return chart.height() - chart.yScale(d.value); });

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

      var series = [];

      data.forEach(function(d){
        series.push(d.series);
      });

      var keys = d3.set(series).values();

      var newData = [];

      keys.forEach(function(series) {
        var values = [];
        var filter = data.filter(function(element) { 
          return element.series == series 
        });

        filter.forEach(function(d){
          values.push({ "name": d.name, "value": d.value })
        });

        newData.push({ "series": series, "values": values })
      });


      var buffer = [];
      var x1domain = newData[0].values.forEach(function(d) {
        buffer.push(d.name);
      });

      console.log(buffer);
      
      chart.xScale.domain(newData.map(function(d) { return d.series; }));
      chart.x1Scale.domain(buffer).rangeRoundBands([0, chart.xScale.rangeBand()]);
      chart.yScale.domain([0, d3.max(newData, function(d) { 
        return d3.max(d.values, function(d) { 
          return d.value; 
        }); 
      })]);

      return newData;
  }
});