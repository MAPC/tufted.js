var expect = chai.expect,
    chart = undefined; // Note that should has to be executed

var foobar = {
  sayHello: function() {
    return 'Hello World!';
  }
};

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