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