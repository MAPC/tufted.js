
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

    chart.invokeResizeListener(function() {
      chart.width(parseFloat(getComputedStyle(chart.base.node().parentNode).width) - chart._margin.left - chart._margin.right);
    })

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
  