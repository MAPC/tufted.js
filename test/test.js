var expect = chai.expect,
    chart = undefined; // Note that should has to be executed

describe('Stacked Bar Chart', function() {
  describe('public optional methods', function() {

    beforeEach(function() {

      chart = d3.select('#charts-styled')
                .append('svg')
                .chart('StackedBarChart')

      $('#charts-styled').empty();
    });

    describe("#width", function () {

      it('sets the width to the containing divs CSS width', function () {

        expect(chart.width()).to.equal(420);
      });

      it('sets the width to a different value', function () {
        chart.width(550);

        expect(chart.width()).to.equal(550);
      });
    });

    describe("#height", function () {
      it('sets the width to the containing divs CSS height', function () {

        expect(chart.height()).to.equal(450);
      });

      it('sets the height to a different value', function() {
        chart.height(750);

        expect(chart.height()).to.equal(750);
      });
    });
  });
});

describe('Bar Chart', function() {
  describe('public optional methods', function() {

    beforeEach(function() {

      chart = d3.select('#charts-styled')
                .append('svg')
                .chart('BarChart')

      $('#charts-styled').empty();
    });

    describe("#width", function () {

      it('sets the width to the containing divs CSS width', function () {

        expect(chart.width()).to.equal(420);
      });

      it('sets the width to a different value', function () {
        chart.width(550);

        expect(chart.width()).to.equal(550);
      });
    });

    describe("#height", function () {
      it('sets the width to the containing divs CSS height', function () {

        expect(chart.height()).to.equal(450);
      });

      it('sets the height to a different value', function() {
        chart.height(750);

        expect(chart.height()).to.equal(750);
      });
    });
  });

  describe("this chart's behavior for data conversion", function () {
    describe("#transform", function () {
      it("returns an array", function () {
        expect(chart.transform(randomData(7))).to.be.an("array");
      });

      it("returns an array of objects with a series key", function () {
        expect(chart.transform(randomData(7))[0]).to.include.keys('series')
      });

      it("returns data array with correct number of objects", function () {
        // chart.draw(randomData());

        expect(chart.transform(randomData(7)).length).to.equal(7);
      });
    });
  });
});

describe('Line Chart', function() {
  describe('public optional methods', function() {

    beforeEach(function() {

      chart = d3.select('#charts-styled')
                .append('svg')
                .chart('LineChart');

      $('#charts-styled').empty();
    });

    describe("#width", function () {

      it('sets the width to the containing divs CSS width', function () {

        expect(chart.width()).to.equal(420);
      });

      it('sets the width to a different value', function () {
        chart.width(550);

        expect(chart.width()).to.equal(550);
      });
    });

    describe("#height", function () {
      it('sets the width to the containing divs CSS height', function () {

        expect(chart.height()).to.equal(450);
      });

      it('sets the height to a different value', function() {
        chart.height(750);

        expect(chart.height()).to.equal(750);
      });
    });

    describe("#data", function () {
      it("converts data to the correct format", function () {

      })
    })
  });
});

describe('Grouped Bar Chart', function() {
  describe('public optional methods', function() {

    beforeEach(function() {

      chart = d3.select('#charts-styled')
                .append('svg')
                .chart('GroupedBarChart');

      $('#charts-styled').empty();
    });

    describe("#width", function () {

      it('sets the width to the containing divs CSS width', function () {

        expect(chart.width()).to.equal(420);
      });

      it('sets the width to a different value', function () {
        chart.width(550);

        expect(chart.width()).to.equal(550);
      });
    });

    describe("#height", function () {
      it('sets the width to the containing divs CSS height', function () {

        expect(chart.height()).to.equal(450);
      });

      it('sets the height to a different value', function() {
        chart.height(750);

        expect(chart.height()).to.equal(750);
      });
    });
  });
});

function randomValue (options) {
  var min = -100;
  var max = 100;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function randomData (seriesCount) {
  var seriesCount = seriesCount === undefined ? 1 : seriesCount;
  var collection = [];
  var names = [];

  for (var i = 0; i < 5; i++) {
    names.push(randomString());
  }

  for (var i = 0; i < seriesCount; i++) {
    var values = [];

    names.forEach(function (name, index) {
      values.push({name: name, value: randomValue()});
    });

    collection.push({series: randomString(), values: values})
  }

  return collection;
}
