(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var basechart = require('./lib/baseChart');
var barchart = require('./lib/barChart');
var groupedbarchart = require('./lib/groupedBarChart');
var linechart = require('./lib/lineChart');
var stackedbarchart = require('./lib/stackedBarChart');

module.exports = {
  basechart: basechart,
  barchart: barchart,
  groupedbarchart: groupedbarchart,
  linechart: linechart,
  stackedbarchart: stackedbarchart
}
},{"./lib/barChart":2,"./lib/baseChart":3,"./lib/groupedBarChart":4,"./lib/lineChart":5,"./lib/stackedBarChart":6}],2:[function(require,module,exports){
d3.chart("BaseChart").extend("BarChart", {

  initialize: function() {
    var chart = this;

    chart.xScale = d3.scale.ordinal().rangeRoundBands([0, chart.width()], 0.1);
    chart.yScale = d3.scale.linear().range([chart.height(), 0]);
    chart.color = d3.scale.category10();
    chart.duration = 500;

    chart.on('change:width', function(newWidth) {
      chart.xScale.rangeRoundBands([0, newWidth], 0.1);
    });

    chart.on('change:height', function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    }); 

    chart.areas = {};

    chart.layers = {};

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)

    // create a layer of circles that will go into
    // a new group element on the base of the chart
    chart.layer('bars', chart.layers.bars, {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function(data) {

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
              .classed('x axis',true)
              .attr("transform", "translate(0," + chart.height() + ")")
              .call(xAxis)
              .selectAll("text")
              .call(chart.wrap, 50)

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
            .attr('y', function(d) { return chart.yScale(0); })
            .attr('fill', function(d) {return chart.color(d.name);})
            .attr('width', chart.xScale.rangeBand())
            .attr('height', 0);
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

    // // update the scales
    chart.xScale.domain(data.map(function(d) { return d.name; }));
    chart.yScale.domain(d3.extent(data, function(d) {return d.value;}));

    return data;
  }
});
},{}],3:[function(require,module,exports){
d3.chart("BaseChart", {

  initialize: function () {
    this._margin = {top: 20, right: 20, bottom: 90, left: 40};
    this._width  = this.base.attr('width') ? this.base.attr('width') - this._margin.left - this._margin.right : 20;
    this._height = this.base.attr('height') ? this.base.attr('height') - this._margin.top - this._margin.bottom : 20;

      this.updateContainerWidth();
      this.updateContainerHeight();

    this.base.append('g')
      .attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');
  },

  updateContainerWidth: function() { this.base.attr('width', this._width + this._margin.left + this._margin.right); },

  updateContainerHeight: function() { this.base.attr('height', this._height + this._margin.top + this._margin.bottom); },

  width: function(newWidth) {
    if (arguments.length === 0) {
      return this._width;
    }

    // only if the width actually changed:
    if (this._width !== newWidth) {

      var oldWidth = this._width;

      this._width = newWidth;

      // set higher container width
      this.updateContainerWidth();

      // trigger a change event
      this.trigger('change:width', newWidth, oldWidth);
    }

    // always return the chart, for chaining magic.
    return this;
  },

  height: function(newHeight) {
    if (arguments.length === 0) {
      return this._height;
    }

    var oldHeight = this._height;

    this._height = newHeight;

    if (this._height !== oldHeight) {

      this.updateContainerHeight();

      this.trigger('change:height', newHeight, oldHeight);
    }

    return this;
  },

  parseDate: function(string) {

    this.parseDate = d3.time.format("%Y").parse;
    return this.parseDate(string);
  },

  wrap: function(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
});
},{}],4:[function(require,module,exports){
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
      var _data = data;

      var chart = this;

      chart.xScale.domain(_data.map(function(d) { return d.series; }));
      chart.x1Scale.domain(['2000', '2007-11']).rangeRoundBands([0, chart.xScale.rangeBand()]);
      chart.yScale.domain([0, d3.max(_data, function(d) { return d3.max(d.values, function(d) { return d.value; }); })]);

      return data;
  }
});
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
d3.chart('BaseChart').extend('StackedBarChart', {
  initialize : function() {
    var chart = this;

    chart.xScale = d3.scale.ordinal()
      .rangeRoundBands([0, chart.width()], .1);
    chart.yScale = d3.scale.linear()
      .rangeRound([chart.height(), 0]);
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
 
          this.attr("transform", function(d, i) { return "translate(" + chart.xScale(d.State) + ",0)"; })
            .selectAll(".category")
              .data(function(d) { return d.groups; })
            .enter().append("rect")
              .attr("class", "bar")
              // .attr("transform", function(d) { return "translate(" + chart.xScale(d.State) + ",0)"; })
              .attr("width", chart.xScale.rangeBand())
              .attr("y", function(d) { return chart.yScale(d.y1); })
              .attr("height", function(d) { return chart.yScale(d.y0) - chart.yScale(d.y1); })
              .style("fill", function(d) { return chart.color(d.name); });
        }
      },
    });

    },

    transform: function(data) {
      var _data = data;
      var chart = this;

      chart.color.domain(d3.keys(data[0]).filter(function(key) { return key !== "State"; }));

      _data.forEach(function(d) {
        var y0 = 0;
        d.groups = chart.color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.groups[d.groups.length - 1].y1;
      });

      data.sort(function(a, b) { return b.total - a.total; });
      
      chart.xScale.domain(data.map(function(d) { return d.State; }));
      chart.yScale.domain([0, d3.max(data, function(d) { return d.total; })]);
      
      return data;
  }
});
},{}]},{},[1])