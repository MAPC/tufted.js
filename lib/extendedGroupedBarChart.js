d3.chart('BaseChart').extend('extGroupedBarChart', {
  initialize: function () {
    var chart = this;

    chart.charts = {
      bargraph: chart.base.append("g").classed("bar", true)
        .chart('BarChart')
        .width(chart.base.attr("width"))
        .height(chart.base.attr("height"))
    };

    chart.attach("bar", chart.charts.bargraph);
  },

  demux: function(name, data) {
    return data;
  },

  transform: function (data) {
    var keys = d3.keys(data[0]).filter(function(key) { return key !== "series" });
    console.log(keys);

    data.forEach(function(d) {
      d.values = keys.map(function(name) { return { name: name, value: +d[name] }; });
    });

    console.log(data);

    var chart = this;

    chart.xScale.domain(data.map(function(d) { return d.series; }));
    chart.x1Scale.domain(["Under 5 Years", "5 to 13 Years", "14 to 17 Years", "18 to 24 Years", "25 to 44 Years", "45 to 64 Years", "65 Years and Over"]).rangeRoundBands([0, chart.xScale.rangeBand()]);
    chart.yScale.domain([0, d3.max(data, function(d) { return d3.max(d.values, function(d) { return d.value; }); })]);

    return data;
  }
});
