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

    chart.areas = {};

    chart.layers = {};

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

    chart.layers.lines = chart.base.select('g').append('g')
      .classed('lines', true)

    chart.layers.circles = chart.base.select('g').append('g')
      .classed('circles', true)

    chart.layers.labels = chart.base.select('g').append('g')
      .classed('text-labels', true)

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
          .orient("left");

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
              .call(chart.wrap, 50)

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
            .attr("class", "line")
            .style("stroke", function(d) {
              if (chart.matchWithCallouts(d.series) || chart.callouts() == false) {
                return chart.color(d.series)
              } else {
                return "Lightgray"
              }       
            })
            .on("mouseover", function(d,i) {
              d3.select(this)
                .style("stroke-width", "7");
            })
            .on("mouseout", function(d,i) {
              d3.select(this)
                .transition()
                .duration(350)
                .style("stroke-width", "3");
            }); 

          // this.append("text")
          //   .datum(function(d) { return { name: d.series, value: d.values[d.values.length - 1] }; })
          //     .attr("transform", function(d) { return "translate(" + (chart.xScale(d.value.year) + 10) + "," + chart.yScale(d.value.value) + ")"; })
          //     .attr("x", 3)
          //     .attr("dy", ".15em")
          //     .attr("id", function(d,i) { return "label" + i })
          //     .text(function(d) { return d.name; });
        },

        'enter:transition': function() {
          var chart = this.chart();

          // this.duration(chart.duration)
          //   .attr('y', function(d) { return chart.yScale(d3.max([0, d.value])); })
          //   .attr('height', function(d) { return Math.abs(chart.yScale(d.value) - chart.yScale(0)); });

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
            .text(function(d) { return d.series; });

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

    chart.xScale.domain(d3.extent([2005,2006,2007,2008,2009,2010,2011,2012].map(function(d) { return chart.parseDate(d.toString()) })));
    chart.yScale.domain([30,60]);

    return data;
  }
});