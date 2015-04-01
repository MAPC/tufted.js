d3.chart("BaseChart").extend("ScatterPlot", {

  initialize: function() {
    var chart = this; 

    chart.xScale = d3.scale.linear().rangeRound([0, chart.width()],0.1);
    chart.yScale = d3.scale.linear().rangeRound([chart.height(), 0.1]);
    chart.color = d3.scale.category10();
    chart.duration = 500;
    chart.on('change:height', function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    }); 

    chart.areas.xAxisLayer = chart.base.append('g').classed('x axis',true)
    chart.areas.yAxisLayer = chart.base.append('g').classed('y axis', true)
                    
    chart.attach('xAxis', chart.areas.xAxisLayer);
    chart.attach('yAxis', chart.areas.yAxisLayer);

    chart.layers.circles = chart.base.select('g').append('g')
      .classed('circles', true)

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

      chart.xScale.rangeRound([0, newWidth], 0);
      chart.layer("circles").selectAll("circle")
            .attr("cy", function(d) { return chart.yScale(d.y); })
            .attr('cx', function(d) { return chart.xScale(d.x); });
    });

    chart.layer('circles', chart.layers.circles, {

      dataBind: function(data) {

        var chart = this.chart();

        chart.areas.xAxisLayer.attr("transform", "translate(0," + chart.height() + ")")
                    .chart('Axis', {parent: chart, setScale: chart.xScale, orient: "bottom" });

        chart.areas.yAxisLayer
                    .chart('Axis', {parent: chart, setScale: chart.yScale, orient: "left" });

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
        return this.append('circle')
          .attr('class', function(d,i){
            return "circle-" + i;
          });
      },

      // define lifecycle events
      events: {
        'enter': function() {
          var chart = this.chart();

          this.attr('cx', chart.xScale.range()[0])
            .attr("class", "circle")
            .attr('cy', chart.yScale.range()[0])
            .attr('r', 3)
            .style('fill', 'black')
            .on("mousemove", function(d) {
              d3.select(this)
                .attr("r", 6); 

              chart.tooltip(d.name + ": " + d.x + ", " + d.y, this, chart.areas.tooltip);
            })
            .on("mouseout", function(d) {
              d3.select(this)
                .transition()
                .duration(150)
                .attr("r", 3);

              chart.areas.tooltip.attr("display", "none");
            });
        },

        'enter:transition': function() { 
          var chart = this.chart();

          this.duration(chart.duration)
            .attr('cy', function(d) { return chart.yScale(d.y); })
            .attr('cx', function(d) { return chart.xScale(d.x); });           

        }
      }
    });

  },

  transform: function(data) {
    var chart = this;

    chart.xScale.domain(d3.extent(data,function(d) { return d.x }));
    if (chart.yDomain().length > 0) {
      chart.yScale.domain(chart.yDomain()); 
    } else {
      chart.yScale.domain(d3.extent(data,function(d) { return d.y }));      
    }
    return data;
  }
});