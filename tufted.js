(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var basechart = require('./lib/baseChart');
var barchart = require('./lib/barChart');
var groupedbarchart = require('./lib/groupedBarChart');
var linechart = require('./lib/lineChart');
var stackedbarchart = require('./lib/stackedBarChart');
var axis = require('./lib/axis');
var scatterPlot = require('./lib/scatterPlot');
var choroplethMap = require('./lib/choroplethMap');

exports.axis = axis
exports.basechart = basechart
exports.barchart = barchart
exports.groupedbarchart = groupedbarchart
exports.linechart = linechart
exports.stackedbarchart = stackedbarchart
exports.scatterPlot = scatterPlot
exports.choroplethMap = choroplethMap

},{"./lib/axis":2,"./lib/barChart":3,"./lib/baseChart":4,"./lib/choroplethMap":5,"./lib/groupedBarChart":6,"./lib/lineChart":7,"./lib/scatterPlot":8,"./lib/stackedBarChart":9}],2:[function(require,module,exports){
d3.chart("BaseChart").extend('Axis', {
  initialize : function(options) { 
    var component = this,
        chart = options.parent;

    component._axis = d3.svg.axis()
      .scale(options.setScale)
      .orient(options.orient);

    if(options.tickFormat) {
      component._axis
        .tickFormat(d3.format(options.tickFormat));
    }

    chart.on('change:width', function(newWidth) { 
      component._axis.scale(options.setScale);

      if(options.wrap) {
        component.layer("axis").call(component._axis).selectAll("text").call(chart.wrap, options.setScale.rangeBand());
      } else {
        component.layer("axis").call(component._axis).selectAll("text");
      }
    });

    this.layer('axis', component.base, {
      dataBind: function(data) {
        return this.selectAll('g').data([data])
      },
      insert: function() {
        return this.append('g').classed('axis wrapper', true);
      },
      events: {
        'merge:transition': function() {
          if(options.wrap) {
            this.call(component._axis).selectAll("text")
                .call(chart.wrap, 
                  options.setScale.rangeBand());
          } else {
            this.call(component._axis).selectAll("text")
          }
        }
      }
    });
  }
});
},{}],3:[function(require,module,exports){
d3.chart("BaseChart").extend("BarChart", {

  initialize: function() {
    var chart = this; 

    chart.xScale = d3.scale.ordinal().rangeRoundBands([0, chart.width()], 0.1);
    chart.yScale = d3.scale.linear().rangeRound([chart.height(), 0]);
    chart.color = d3.scale.category10();
    chart.duration = 500;

    chart.on('change:height', function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    }); 
    // chart.areas.yAxisLayer = chart.base.select('g').append('g')
    //       .classed('ylabels', true)

    chart.areas.xAxisLayer = chart.base.append('g').classed('x axis',true)
    chart.areas.yAxisLayer = chart.base.append('g').classed('y axis', true)
                    
    chart.attach('xAxis', chart.areas.xAxisLayer);
    chart.attach('yAxis', chart.areas.yAxisLayer);

    chart.layers.bars = chart.base.select('g').append('g')
      .classed('bars', true)

    chart.layers.barLabels = chart.base.select('g').append('g')
        .classed('bars', true);

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

      chart.xScale.rangeRoundBands([0, newWidth], 0.1);
      chart.layer("bars").selectAll("rect").attr("width", function(d) { return chart.xScale.rangeBand(); })
            .attr('x', function(d) { return chart.xScale(d.name); });
    });

    chart.layer('bars', chart.layers.bars, {

      dataBind: function(data) {

        var chart = this.chart();

        chart.areas.xAxisLayer.attr("transform", "translate(0," + chart.height() + ")")
                    .chart('Axis', {parent: chart, setScale: chart.xScale, orient: "bottom", wrap: true});

        chart.areas.yAxisLayer
                    .chart('Axis', {parent: chart, setScale: chart.yScale, orient: "left", tickFormat: chart._yFormat });

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
            .attr('y', function(d) { return chart.yScale(0); })
            .attr('width', chart.xScale.rangeBand())
            .attr('height', 0)
            .style('fill', function(d) {return chart.colorScale(d.name);})
            .on("mousemove", function(d) {
              chart.tooltip(d.value, this, chart.areas.tooltip);
            })
            .on("mouseout", function(d) {
              chart.areas.tooltip.attr("display", "none");
            })
        },

        'enter:transition': function() { 
          var chart = this.chart();

          this.duration(chart.duration)
            .attr('y', function(d) { return chart.yScale(d3.max([0, d.value])); })
            .attr('height', function(d) { return Math.abs(chart.yScale(d.value) - chart.yScale(0)); });            

        }
      }
    });

    chart.layer('labels', chart.layers.barLabels, { 
      dataBind: function(data) {
        return this.selectAll(".labels")
                  .data(data)
      },
      insert: function() {
        return this.append('text')
      },

      events: {
        'enter': function() {
          var chart = this.chart();

          this.attr("text-anchor", "middle")
            .attr("x", function(d) { return chart.xScale(d.name) + (chart.xScale.rangeBand() / 2); })
            .attr("y", function(d) { return chart.yScale(d.value); })
            .text(function(d) { return d.value });

        }
      }
    });

  },

  transform: function(data) {
    var chart = this;
    var max = d3.max(data, function(d) { return parseInt(d.value) });
    var min = d3.min(data, function(d) { return parseInt(d.value) });

    if (min > 0) {
      min = 0;
    }
    // // update the scales
    chart.xScale.domain(data.map(function(d) { return d.name; }));
    chart.yScale.domain([min,max]);

    return data;
  }
});
},{}],4:[function(require,module,exports){

  // obtains element computed style
  // context is chart

d3.chart("BaseChart", {
  initialize: function () {
    var chart = this;

    chart.areas = {};
    chart.layers = {};
    chart.areas.legend = {};
    chart.areas.tooltip =  {};

    chart.font = getComputedStyle(chart.base.node()).getPropertyValue("font-family") || "Gill Sans MT";
    chart.font_size = getComputedStyle(chart.base.node()).getPropertyValue("font-size") || "1em";
    chart.font_style = "font: "+ chart.font_size + " '" + chart.font + "';"
    
    this._tickValues = [];
    this._yAxisLabel = "Y-Axis";
    this._margin = {top: 60, right: 20, bottom: 80, left: 80};
    this._width  = setInitialWidth();
    this._height = setInitialHeight();
    this.colorScale = d3.scale.category10();
    this.updateContainerWidth();
    this.updateContainerHeight();

    function setInitialWidth () {
      if (chart.base.attr('width')) {
        return chart.base.attr('width') - chart._margin.left - chart._margin.right;
      } else {
        return parseFloat(getComputedStyle(chart.base.node().parentNode).width) - chart._margin.left - chart._margin.right;
      }
    }

    function setInitialHeight() {
      if (chart.base.attr('height')) {
        return chart.base.attr('height') - chart._margin.top - chart._margin.bottom;
      } else {
        return parseFloat(getComputedStyle(chart.base.node().parentNode).height) - chart._margin.top - chart._margin.bottom;
      }
    }
    chart.TO = false;
    chart.invokeResizeListener(function() {
      chart.width(parseFloat(getComputedStyle(chart.base.node().parentNode).width) - chart._margin.left - chart._margin.right);
    });

    this.base.append('g')
      .attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');

  },

  invokeResizeListener: function(fun) {
    if (fun === undefined) return;
    var oldresize = window.onresize;

    window.onresize = function(e) {
      if (typeof oldresize == 'function') oldresize(e);
      fun(e);
    }
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

  yFormat: function(string) {
    if (arguments.length === 0) {
      return this._yFormat;
    }

    if (typeof string === "string") {
      this._yFormat = string;
    } 

    return this;
  },

  xFormat: function(string) {
    if (arguments.length === 0) {
      return this._xFormat;
    }

    if (typeof string === "string") {
      this._xFormat = string;
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
  
},{}],5:[function(require,module,exports){

  //  you can map the properties out of a geojson to create a new dataset for the other charts. 
  // var array; geojson.features.forEach(function(d){ return array.push(d.properties); });
  // more types: choropleth, bubble chart, and heat?
  // for choropleth, pass an array of options that lets use switch which column to visualize... re-setting scale on color scale might be tough...


d3.chart("BaseChart").extend("choroplethMap", {

  initialize: function() {
    var chart = this; 

    chart.color = d3.scale.category10();

    chart.quantize = d3.scale.quantile()
      .range(["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"]);


    chart.on('change:width', function(newWidth) {
    });

    chart.layers.canvas = chart.base.select('g').append('rect')
      .classed('map', true).attr('width', chart.width()).attr('height', chart.height())
      .style('stroke', 'none').style('fill', 'none');

    chart.layers.map = chart.base.select('g').append('g')
      .classed('bars', true)

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


    chart.layer('map', chart.layers.map, {

      dataBind: function(data) {
        var chart = this.chart();

        return this.selectAll("path")
          .data(data);
      },

      insert: function() {
        return this.append('path')
          .attr('class', function(d,i){
            return "feature-" + i;
          });
      },

      // define lifecycle events
      events: {
        'enter': function() {
          var chart = this.chart();

          this.attr("d", chart.path)
            this.style("opacity", 0)
                        .on("mousemove", function(d) {
              chart.tooltip(d.properties.value, chart.layers.map[0][0], chart.areas.tooltip);
            })
            .on("mouseout", function(d) {
              chart.areas.tooltip.attr("display", "none");
            });
        },
        'merge:transition': function () {
          this.duration(400).
          style("opacity", 1)
            .style("fill", function(d) { 
              return chart.quantize(d.properties.value);
            })
            .style("stroke-width", "1")
            .style("stroke", "white")
        }
      }
    });

  },

  // set/get the color to use for the circles as they are
  // rendered.
  transform: function(data) {
    var chart = this;
    chart.center = d3.geo.centroid(data);
    chart.scale  = 150;
    chart.offset = [chart.width()/2, chart.height()/2];
    chart.projection = d3.geo.mercator().scale(chart.scale).center(chart.center)
          .translate(chart.offset);

    chart.path = d3.geo.path().projection(chart.projection);

    chart.bounds  = chart.path.bounds(data);
    chart.hscale  = chart.scale*chart.width()  / (chart.bounds[1][0] - chart.bounds[0][0]);
    chart.vscale  = chart.scale*chart.height() / (chart.bounds[1][1] - chart.bounds[0][1]);
    chart.scale   = (chart.hscale < chart.vscale) ? chart.hscale : chart.vscale;
    chart.offset  = [chart.width() - (chart.bounds[0][0] + chart.bounds[1][0])/2,
                      chart.height() - (chart.bounds[0][1] + chart.bounds[1][1])/2];

    chart.projection = d3.geo.mercator().center(chart.center)
      .scale(chart.scale).translate(chart.offset);

    chart.path = chart.path.projection(chart.projection);
    var cache = [];

    chart.tabular = data.features.map(function(d) { return d.properties.value; });
    chart.quantize.domain(chart.tabular);

    return data.features;
  }
});
},{}],6:[function(require,module,exports){
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

    // chart.yAxis = d3.svg.axis()
    //   .scale(chart.yScale)
    //   .tickSize(-chart.width(), 0, 0)
    //   .orient("left")
    //   .tickFormat(d3.format(".2s"));

    chart.areas.xAxisLayer = chart.base.append('g').classed('x axis',true)
    chart.areas.yAxisLayer = chart.base.append('g').classed('y axis', true)
                    
    chart.attach('xAxis', chart.areas.xAxisLayer);
    chart.attach('yAxis', chart.areas.yAxisLayer);

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

    chart.on('change:width', function(newWidth) {
      chart.xScale.rangeRoundBands([0, newWidth], 0.1);
      chart.x1Scale.rangeRoundBands([0, chart.xScale.rangeBand()]);

      chart.layer("bars")
        .selectAll("g")
          .attr("transform", function(d, i) { return "translate(" + chart.xScale(d.series) + ",0)"; })
        .selectAll("rect")
          .attr("width", chart.x1Scale.rangeBand())
          .attr("x", function(d) { return chart.x1Scale(d.name); })
    });
    
    chart.on("change:height", function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    });

    chart.layer('bars', chart.layers.bars, {
      dataBind: function(data) {
        var chart = this.chart();

        chart.areas.xAxisLayer.attr("transform", "translate(0," + chart.height() + ")")
                    .chart('Axis', {parent: chart, setScale: chart.xScale, orient: "bottom", wrap: true});

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
},{}],7:[function(require,module,exports){
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

    console.log(_data);
    return _data;
  }
});
},{}],8:[function(require,module,exports){
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
    chart.yScale.domain(d3.extent(data,function(d) { return d.y }));
    return data;
  }
});
},{}],9:[function(require,module,exports){
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

    chart.areas.xAxisLayer = chart.base.append('g').classed('x axis',true)
    chart.areas.yAxisLayer = chart.base.append('g').classed('y axis', true)
                    
    chart.attach('xAxis', chart.areas.xAxisLayer);
    chart.attach('yAxis', chart.areas.yAxisLayer);

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

    chart.on('change:width', function(newWidth) {
      chart.xScale.rangeRoundBands([0, newWidth], 0.1);
      chart.layer("bars")
        .selectAll("g")
          .attr("transform", function(d, i) { return "translate(" + chart.xScale(d.series) + ",0)"; })
        .selectAll("rect")
          .attr("width", chart.xScale.rangeBand());
    });

    chart.on("change:height", function(newHeight) {
      chart.yScale.range([newHeight, 0]);
    });

    chart.layer('bars', chart.layers.bars, {
      dataBind: function(data) {
        var chart = this.chart();

        chart.base
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", -((chart.height() / 2) + chart._margin.top))
            .style("text-anchor", "middle")
            .text(chart.yAxisLabel());

        chart.areas.xAxisLayer.attr("transform", "translate(0," + chart.height() + ")")
                    .chart('Axis', {parent: chart, setScale: chart.xScale, orient: "bottom"});

        chart.areas.yAxisLayer
                    .chart('Axis', {parent: chart, setScale: chart.yScale, orient: "left", tickFormat: chart._yFormat });

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
      var data = data;
      var chart = this;

      chart.color.domain(d3.keys(data[0]).filter(function(key) { return key !== "series"; }));

      data.forEach(function(d) {
        var y0 = 0;
        d.groups = chart.color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.groups[d.groups.length - 1].y1;
      });
      
      chart.xScale.domain(data.map(function(d) { return d.series; }));
      chart.yScale.domain([0, d3.max(data, function(d) { return d.total; })]);
      
      return data;
  }
});
},{}]},{},[1]);
