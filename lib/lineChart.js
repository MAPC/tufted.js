d3.chart("BaseChart").extend("LineChart", {

  initialize: function() {
    var chart = this;
    chart._callouts = [];

    chart.xScale = d3.time.scale()
      .range([0, chart.width()]);
    chart.yScale = d3.scale.linear()
      .range([chart.height(), 0]);
    chart.color = d3.scale.category10();

    chart.renderLine = d3.svg.line()
      .x(function(d) { return chart.xScale(d.year); })
      .y(function(d) { return chart.yScale(d.value); });

    chart.duration = 500;

    chart.on('change:width', function(newWidth) {
      chart.xScale.range([0, newWidth]);
    });

    chart.on('change:height', function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    }); 

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

    chart.layers.lines = chart.base.select('g').append('g')
      .classed('lines', true)

    chart.layers.circles = chart.base.select('g').append('g')
      .classed('circles', true)

    chart.layers.labels = chart.base.select('g').append('g')
      .classed('text-labels', true)

    var selection = chart.base.node().parentNode
    chart.areas.legend = d3.select(chart.base.node().parentNode).append("div");

    // create a layer of circles that will go into
    // a new group element on the base of the chart
    chart.layer('lines', chart.layers.lines, {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function(data) {
        var chart = this.chart();

        var yAxis = d3.svg.axis()
          .scale(chart.yScale)
          .tickSize(-chart.width(), 0, 0)
          .orient("left")
          .tickFormat(d3.format(".2s"));;

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
          .orient("bottom");

        chart.base.select('g').append('g')
              .classed('x axis', true)
              .attr("transform", "translate(0," + chart.height() + ")")
              .call(xAxis)
            .selectAll("text")
              .call(chart.wrap, 50)


        chart.areas.legend
          .append("ul")
          .selectAll("li")
          .data(function() { 
            if (chart.callouts().length > 0) {
              return chart.callouts();
            } else {
              return data.map(function(d) { return d.series }) ;
            }
          })
          .enter()
            .append("li")
            .style("color", function(d,i) { return chart.colorScale(d) })
            .style("font-size", "2.2em")
            .style("line-height", ".4em")
              .append("span")
              .style("color", "black")
              .style("font-size", ".40em")
              .text(function(d) { return d });

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
              if (chart.matchWithCallouts(d.series)) {
                var str = d.series.replace(/\s/g, '');
                return "line callout callout-" + str;
              } else {
                return "line line-" + 1;
              }     

            })
            .style("stroke", function(d,i) {
              if (chart.matchWithCallouts(d.series) || chart.callouts() == false) {
                return chart.colorScale(d.series); 
              } else {
                return "Lightgray"
              }       
            })
            .on("mouseover", function(d,i) {

              d3.select(this)
                .style("stroke-width", "7");

              d3.select(chart.layers.labels[0][0].childNodes[i]).style("display", "block");

            })
            .on("mouseout", function(d,i) {
              d3.select(this)
                .transition()
                .duration(350)
                .style("stroke-width", "3");

              if (chart._callouts.indexOf(d.series) < 0 && chart._callouts.length > 0) {
                d3.select(chart.layers.labels[0][0].childNodes[i])
                  .transition()
                  .delay(350)
                  .style("display", "none");  
              }
            }); 
        },

        'enter:transition': function() {
          var chart = this.chart();

          $(document).ready(function () {
              $("svg circle").popover({
                  'container': 'body',
                  'placement': 'right',
                  'trigger': 'hover',
                  'html': true
              });
          });
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
            .attr("title", function(d) { return (d.year).getFullYear() })
            .attr("data-content", function(d) { return "Estimate: " + d.value + "%" })
            .attr("fill", "black")
            .on("mouseover", function(d, i) {
              d3.select(this)
                .attr("r", "6"); 
            })
            .on("mouseout", function(d) {
              d3.select(this)
                .transition()
                .duration(150)
                .attr("r", "3")
            });

        },

        'enter:transition': function () {
          $(document).ready( function () {
            $("svg circle").popover({
                'container': 'body',
                'placement': 'right',
                'trigger': 'hover',
                'html': true
            });
          });
        }
      }
    });

    chart.layer('text-labels', chart.layers.labels, {
      dataBind: function(data) {
        return this.selectAll("text-labels")
                  .data(data);
      },

      insert: function () {
        return this.append("text")
                  .attr("class", "text-labels")

      },
      events: {
        'enter': function () {
          var chart = this.chart();

          this.attr("transform", function(d,i) { return "translate(" + (chart.xScale((d.values[d.values.length - 1]).year) + 10) + "," + chart.yScale((d.values[d.values.length - 1]).value) + ")"; })
            .attr("x", 3)
            .attr("dy", ".15em")
            .attr("id", function(d,i) { return "label" + i })
            .text(function(d) { return d.series; })
            .call(chart.wrap, 215)
            .style("display", function (d) {
              if (chart._callouts.indexOf(d.series) > -1 || chart._callouts.length == 0) {
                return "block"
              } else {
                return "none"
              }
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

    data.forEach(function(d) {
      d.values.forEach(function(d) {
        d.year = chart.parseDate((d.year).toString());
      });
    });


    var buffer = [];
    data[0].values.forEach(function(d) {
      buffer.push(d.year);
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

    chart.xScale.domain(d3.extent(buffer));
    chart.yScale.domain([min,max]);

    if (chart._callouts) {

      chart._callouts.forEach(function(d) {
        var pluck = [];
        pluck = data.filter(function(f) { 
          return f.series == d; 
        });
        data = data.filter(function(f) {
          return f.series !== d;
        });
        data.push(pluck[0]);
      });
      
    }

    return data;
  }
});