d3.chart("BaseChart").extend("LineChart", {

  initialize: function() {

    var chart = this;

    chart._callouts = [];

    chart.xScale = d3.scale.ordinal()
      .rangeRoundBands([0, chart.width()], 1);

    chart.yScale = d3.scale.linear()
      .range([chart.height(), 0]);

    chart.color = d3.scale.category10();

    chart.renderLine = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return chart.xScale(d.year); })
      .y(function(d) { return chart.yScale(d.value); });

    chart.duration = 500;

    chart.areas.xAxisLayer = chart.base.append('g').classed('x axis',true)
    chart.areas.yAxisLayer = chart.base.append('g').classed('y axis', true)
                    
    chart.attach('xAxis', chart.areas.xAxisLayer);
    chart.attach('yAxis', chart.areas.yAxisLayer);

    chart.layers.lines = chart.base.select('g').append('g')
      .classed('lines', true)

    chart.layers.circles = chart.base.select('g').append('g')
      .classed('circles', true)

    chart.layers.labels = chart.base.select('g').append('g')
      .classed('text-labels', true)

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
      chart.xScale.rangeRoundBands([0, newWidth], 1);
      chart.layer("lines").selectAll("path").attr('d', function(d) { return chart.renderLine(d.values); });
      chart.layer("circles").selectAll("circle").attr("cx", function(d) { return chart.xScale(d.year) })
    });

    chart.on('change:height', function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    }); 

    // create a layer of circles that will go into
    // a new group element on the base of the chart
    chart.layer('lines', chart.layers.lines, {

      // select the elements we wish to bind to and
      // bind the data to them.
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
          .data(data)
            .enter().append("g")
            .attr("class", "legend")

        chart.areas.legend
            .append("circle")
            .filter(function(d) { return d.flag == true; })
              .attr("r", 5)
              .attr("cx", function(d,i) {
                return 1 + (i * 100);
              })
              .attr("fill", function(d) {
                return chart.colorScale(d.series);
              })
              .attr("cy", 5)

        chart.areas.legend
            .append("text")
            .filter(function(d) { return d.flag == true; })
            .attr("transform", function (d,i) {
              return "translate(" + (10 + (i*100)) + ",0)";
            })
            .attr("dy", ".71em")
            .attr("x", 0)
            .attr("y", 0)
            .style("font-family", chart.font)
            .style("font-size", chart.font_size)
            .text(function(d) { 
              return d.series;
            })
            .call(chart.wrap, 85)

      return this.selectAll('.line')
        .data(data);
      },

      // insert actual rects
      insert: function() {
        return this.append('path')
          .attr('class', function(d,i) {
            return "line-" + i;
          });
      },

      // define lifecycle events
      events: {
        'enter': function() {
          var chart = this.chart();
          this.attr('d', function(d) { return chart.renderLine(d.values); })
            .attr("class", function(d,i) {

              if (d.flag) {
                var str = d.series.replace(/\s/g, '');
                return "line callout callout-" + str;
              } else {
                return "line line-" + 1;
              }     
            })
            .attr("data-content", function(d) {
              return d.series;
            })
            .style("fill", "none")
            .style("stroke-width", "3")
            .style("stroke", function(d,i) {
              if (d.flag) {
                return chart.colorScale(d.series); 
              } else {
                return "Lightgray"
              }       
            })
            .on("mousemove", function(d,i) {

              chart.tooltip(d.series, this, chart.areas.tooltip); 


              d3.select(this)
                .style("stroke", function (d) {
                  if (d.flag) {
                    return chart.colorScale(d.series); 
                  } else {
                    return "darkgray"
                  }      
                });

              d3.select(this)
                .style("stroke-width", "7");

            })
            .on("mouseout", function(d,i) {

              chart.areas.tooltip.attr("display", "none");

              d3.select(this)
                .style("stroke", function (d) {
                  if (d.flag) {
                    return chart.colorScale(d.series); 
                  } else {
                    return "Lightgray"
                  }   
                });
   

              d3.select(this)
                .transition()
                .duration(350)
                .style("stroke-width", "3");
            }); 
        },

        'enter:transition': function() {
          var chart = this.chart();

        }
      }
    });

    chart.layer('circles', chart.layers.circles, {

      dataBind: function(data) {
        return this.selectAll("circles")
                  .data(data);
      },

      insert: function() {
        return this.append('g')
          .attr('class', 'data-points');
      },

      events: {

        'enter': function () {

          var chart = this.chart();

          this.selectAll("circle")
            .data(function(d) {return d.values; })
            .enter()
          .append("svg:circle")
            .attr("r", 3)
            .attr("cx", function(d) { return chart.xScale(d.year) })
            .attr("cy", function(d) { return chart.yScale(d.value) })
            .attr("title", function(d) { return (d.year) })
            .attr("data-content", function(d) { return d.value })
            .attr("fill", "black")
            .on("mouseover", function(d, i) {

              chart.tooltip(d.value, this, chart.areas.tooltip); 

              d3.select(this)
                .attr("r", "6"); 
            })
            .on("mouseout", function(d) {

              chart.areas.tooltip.attr("display", "none");

              d3.select(this)
                .transition()
                .duration(150)
                .attr("r", "3")
            });

        }
      }
    });

  },

  callouts: function(collection) {
    if (arguments.length === 0) {
      return this._callouts;
    }

    if (Array.isArray(collection)) {
      this._callouts = collection
    } 

    return this;
  },

  matchWithCallouts: function (comparator) {
    return this._callouts.indexOf(comparator) !== -1
  },

  // set/get the color to use for the circles as they are
  // rendered.
  transform: function(data) {
    var chart = this;
    // update the scales
    var _data = data;

    _data.forEach(function(d,i) {
      if(chart.callouts()[0]!==undefined) {
        if(chart.matchWithCallouts(d.series)) {
          _data[i]["flag"] = true;
        } else {
          _data[i]["flag"] = false;
        }
      } else {
        _data[i]["flag"] = true;
      }

      d.values.forEach(function(d) {
        d.year = d.year.toString();
      });
    });


    var buffer = [];
    _data[0].values.forEach(function(d) {
      buffer.push(d.year);
    });

    var max = d3.max(_data, function(d) { 
      return d3.max(d.values, function(d) { 
        return d.value; 
      }); 
    });

    var min = d3.min(_data, function(d) {
      return d3.min(d.values, function(d) {
        return d.value;
      })
    });


    chart.xScale.domain(buffer);
    chart.yScale.domain([min,max]);

    chart._callouts.forEach(function(d) {
      var pluck = [];
      pluck = _data.filter(function(f) { 
        return f.series == d; 
      });
      _data = _data.filter(function(f) {
        return f.series !== d;
      });
      _data.push(pluck[0]);
    });


    return _data;
  }
});