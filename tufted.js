(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var basechart = require('./lib/baseChart');
var barchart = require('./lib/barChart');
var groupedbarchart = require('./lib/groupedBarChart');
var linechart = require('./lib/lineChart');
var stackedbarchart = require('./lib/stackedBarChart');
// var legendmixin = require('./lib/legendMixin');
// module.exports = {
//   barchart: barchart,
//   basechart: basechart,
//   groupedbarchart: groupedbarchart,
//   linechart: linechart,
//   stackedbarchart: stackedbarchart
// } 




exports.basechart = basechart
exports.barchart = barchart
exports.groupedbarchart = groupedbarchart
exports.linechart = linechart
exports.stackedbarchart = stackedbarchart
},{"./lib/barChart":2,"./lib/baseChart":3,"./lib/groupedBarChart":4,"./lib/lineChart":5,"./lib/stackedBarChart":6}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){

  // obtains element computed style
  // context is chart

d3.chart("BaseChart", {
  initialize: function () {
    var chart = this;

    chart.areas = {};
    chart.layers = {};
    chart.areas.legend = {};
    chart.areas.tooltip =  {};

    chart.font = getComputedStyle(chart.base.node()).getPropertyValue("font-family") || "Arial";
    chart.font_size = getComputedStyle(chart.base.node()).getPropertyValue("font-size") || "1em";
    chart.font_style = "font: "+ chart.font_size + " '" + chart.font + "';"
    
    chart._format = d3.format();
    this._tickValues = [];
    this._yAxisLabel = "Y-Axis";
    this._margin = {top: 60, right: 20, bottom: 80, left: 60};
    this._width  = setInitialWidth();
    this._height = setInitialHeight();
    this.colorScale = d3.scale.category10();
    this.updateContainerWidth();
    this.updateContainerHeight();


    function setInitialWidth () {
      if (chart.base.attr('width')) {
        return chart.base.attr('width') - chart._margin.left - chart._margin.right;
      } else {
        return numbersOnly(getComputedStyle(chart.base.node().parentNode).width) - chart._margin.left - chart._margin.right;
      }
    }

    function setInitialHeight() {
      if (chart.base.attr('height')) {
        return chart.base.attr('height') - chart._margin.top - chart._margin.bottom;
      } else {
        return numbersOnly(getComputedStyle(chart.base.node().parentNode).height) - chart._margin.top - chart._margin.bottom;
      }
    }

    function numbersOnly(string) {
      var regex = /([0-9,]{1,})/;
      var match = regex.exec(string);

      return parseInt(match[0]);
    }

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

  tickValues: function(collection) {
    if (arguments.length === 0) {
      return this._tickValues;
    }

    if (Array.isArray(collection)) {
      this._tickValues = collection
    } 

    return this;
  },

  xScale: function (scale_object) {
    if (!arguments.length) {
      scale_object = d3.scale.ordinal()
    }
    if (colorScale instanceof Object) {
      scale_object = d3.scale.ordinal()
        .range(colorScale)
    }
    if (this.data) this.draw(this.data);

    return this;
  },

  yAxisLabel: function(string) {
    if (arguments.length === 0) {
      return this._yAxisLabel;
    }

    if (typeof string === "string") {
      this._yAxisLabel = string
    } 

    return this;
  },

  format: function(string) {
    if (arguments.length === 0) {
      return this._format;
    }

    if (typeof string === "string") {
      this._format = d3.format(string);
    } 

    return this;
  },

  colors: function(colorScale) {

    if (!arguments.length) {
      colorScale = d3.scale.category10();
      // return this.colorScale;
    }
    if (colorScale instanceof Array) {
      colorScale = d3.scale.ordinal()
        .range(colorScale)
        // .domain([0, colorScale.length-1]);

    }
    this.colorScale = colorScale;
    if (this.data) this.draw(this.data);

    return this;
  },

  tooltip: function (d, element, box) {

    var position = d3.mouse(element),
        xOffset = 0,
        yOffset = -12;


    box.attr("transform", "translate(" + (position[0] + xOffset) + ", " + (position[1] + yOffset) + ")")
      .attr("display", "block")
      .select("text")
      .text(d);

    box.select("rect")
      .attr("y", -parseFloat(box.select("text")[0][0].getBBox().height))
      .attr("width", parseFloat(box.select("text")[0][0].getBBox().width)+11)
      .attr("height", parseFloat(box.select("text")[0][0].getBBox().height)+7);

    if ((Math.abs(position[0] - this.width() )) < parseFloat(box.select("text")[0][0].getBBox().width))  {
      console.log(parseFloat(box.select("text")[0][0].getBBox().width));

      box.select("text")
        .attr("text-anchor", "end")

      box.select("rect")
        .attr("x", -5 + -parseFloat(box.select("text")[0][0].getBBox().width))

    } else {
      box.select('text')
        .attr("text-anchor", "start")

      box.select("rect")
        .attr("x", -5)
    }
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
      }
      ,
 
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
            .attr("height", "0")
            .on("mousemove", function(d) {
              chart.tooltip(d.value, chart.layers.bars[0][0], chart.areas.tooltip);
            })
            .on("mouseout", function(d) {
              chart.areas.tooltip.attr("display", "none");
            });
        },
 
        "merge:transition": function() {
          var chart = this.chart();

          this.duration(chart.duration)
              .attr("transform", function(d, i) {return "translate(" + chart.xScale(d.series) + ",0)"; })
            .selectAll(".bar")
              .attr("width", chart.x1Scale.rangeBand())
            .attr('y', function(d) { return chart.yScale(d3.max([0, d.value])); })
            .attr('height', function(d) { return Math.abs(chart.yScale(d.value) - chart.yScale(0)); });
        }
      },
    });

    },

    transform: function(data) {
      var chart = this;


   
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

      return data;
  }
});
},{}],5:[function(require,module,exports){
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

    chart.on('change:width', function(newWidth) {
      chart.xScale.rangeRoundBands([0, newWidth], 1);
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
            .attr("y", -50)
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
              .call(chart.wrap, 50)

        console.log(data);

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

    console.log("_data", _data); //why is this have new properties before the properties are set?

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

    chart.areas.yAxisLayer = chart.base.select('g').append('g')
      .classed('ylabels', true)

    // -- actual layers
    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)
 
    chart.areas.legend = chart.base.select('g').append('g')
          .classed('legend', true)

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
          .data(data[0].groups)
          .enter().append("g")
          .attr("class", "legend")
          
        chart.areas.legend
            .append("circle")
              .attr("r", 5)
              .attr("cx", function(d,i) {
                return 1 + (i * 100);
              })
              .attr("fill", function(d) {
                return chart.colorScale(d.name);
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
              return d.name;
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
            .selectAll(".category")
              .data(function(d) { return d.groups; })
            .enter().append("rect")
              .attr("class", "bar")
              // .attr("transform", function(d) { return "translate(" + chart.xScale(d.series) + ",0)"; })
              .attr("width", chart.xScale.rangeBand())
              .attr("y", function(d) { return chart.yScale(d.y1); })
              .attr("height", function(d) { return chart.yScale(d.y0) - chart.yScale(d.y1); })
              .style("fill", function(d) { return chart.color(d.name); })
              .on("mousemove", function(d) {
                chart.tooltip((d.y1-d.y0), chart.layers.bars[0][0], chart.areas.tooltip);
              })
              .on("mouseout", function(d) {
                chart.areas.tooltip.attr("display", "none");
              });

              
        }
      },
    });

    },

    transform: function(data) {
      var _data = data;
      var chart = this;

      chart.color.domain(d3.keys(data[0]).filter(function(key) { return key !== "series"; }));

      _data.forEach(function(d) {
        var y0 = 0;
        d.groups = chart.color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.groups[d.groups.length - 1].y1;
      });

      data.sort(function(a, b) { return b.total - a.total; });
      
      chart.xScale.domain(data.map(function(d) { return d.series; }));
      chart.yScale.domain([0, d3.max(data, function(d) { return d.total; })]);
      
      return data;
  }
});
},{}]},{},[1]);
