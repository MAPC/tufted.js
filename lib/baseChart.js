d3.chart("BaseChart", {

  initialize: function () {
    var chart = this;

    chart.areas = {};
    chart.layers = {};

    this._tickValues = [];
    this._yAxisLabel = "Y-Axis";
    this._margin = {top: 20, right: 20, bottom: 80, left: 40};
    this._width  = this.base.attr('width') ? this.base.attr('width') - this._margin.left - this._margin.right : this.base.node().parentNode.clientWidth - this._margin.left - this._margin.right;
    this._height = this.base.attr('height') ? this.base.attr('height') - this._margin.top - this._margin.bottom : this.base.node().parentNode.clientHeight - this._margin.top - this._margin.bottom ;

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

  tickValues: function(collection) {
    if (arguments.length === 0) {
      return this._tickValues;
    }

    if (Array.isArray(collection)) {
      this._tickValues = collection
    } 

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

  colors: function(colorScale) {
    if (!arguments.length) {
      return this.colorScale;
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
  },

  download: function(element) {
    var chart = this;
    if (arguments.length === 0) {
      return this;
    }

    var simg = new Simg((chart.base[0])[0]);

    d3.select(element).on("click", function() {
      simg.download();
    });
    
    return this;
  }
});