d3.chart("BaseChart").extend('Axis', {
  initialize : function(options) { 
    var component = this,
        chart = options.parent;

    component._axis = d3.svg.axis()
      .scale(options.setScale)
      .orient(options.orient)
      // .outerTickSize(300)
      // .tickPadding(10)

    if(options.tickFormat) {
      component._axis
        .tickFormat(d3.format(options.tickFormat));
    }

    chart.areas.axisLayer = chart.base.select('g').append('g')
          .classed('axis',true)

    chart.on('change:width', function(newWidth) { 
      component._axis.scale(options.setScale);
      if(options.orient == "bottom" || options.orient == "top") {
        component.layer("axis").call(component._axis).selectAll("text");
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
          if(options.orient == "bottom" || options.orient == "top") {
            this.call(component._axis).selectAll("text")
                .call(chart.wrap, 
                  options.setScale.range());
          } else {
            this.call(component._axis).selectAll("text")
          }
        }
      }
    });
  }
});