<img height="400" align="right" src="https://raw.githubusercontent.com/MAPC/tufted.js/master/tufted-logo-05.png">
Tufted.js is data visualization for the modern web. Designed for urban planners, policy professionals, and data geeks with some coding experience, this tool makes it easy to create mobile-friendly, style-agnostic interactive charts and maps. Additionally, because it's extensible and reusable (using Bocoup's d3.chart: http://bocoup.com/weblog/reusability-with-d3/), it makes it easier for developers to optimize the library for particular projects while creating a bridge across an organization's web products. Ultimately, we hope Tufted.js fills a/the missing link between the data analyst and the developer. 

Dependencies:
D3.js
D3chart.js 

Development:
browserify

Optional:
beefy

Build:
beefy build.js:tufted.js --live

Examples:
Bar Chart:
```
var testDataTwoDimension = [
      {name: 'A', value: 4},
      {name: 'B', value: -36},
      {name: 'C', value: 19},
      {name: 'D', value: -2},
      {name: 'E', value: 6},
    ];

var chart = d3.select('#chart')
      .append("svg")
      .chart("BarChart")
      .width(400)
      .height(400);

chart.draw(testDataTwoDimension); 
```

Grouped Bar Chart:
```
var groupedBarData = [
    { series: "1", values:
      [{name: 'A', value: 4},
       {name: 'B', value: 36}]
    },
    { series: "2", values:
      [{name: 'A', value: 36},
       {name: 'B', value: 36}]
    },
    { series: "3", values:
      [{name: 'A', value: 19},
       {name: 'B', value: 36}]
    },
    { series: "4", values:
      [{name: 'A', value: 2},
       {name: 'B', value: 36}]
    },
    { series: "5", values:
      [{name: 'A', value: 6},
       {name: 'B', value: 6}]
    }
    ];

var chart = d3.select('#grouped-bar-chart')
      .append("svg")
      .chart("GroupedBarChart")
      .width(400)
      .height(400);

chart.draw(groupedBarData);
```
