var assert = chai.assert,
    expect = chai.expect,
    should = chai.should(),
    chart = undefined; // Note that should has to be executed

var foobar = {
  sayHello: function() {
    return 'Hello World!';
  }
};

describe('Stacked Bar Chart', function() {
  describe('public optional methods', function() {

    beforeEach(function() {
      chart = d3.select('#d3-tests')
            .append('svg')
          .chart('StackedBarChart')
          .height(500);
    });

    describe("#width", function () {
      it('sets the width to the default width', function () {

        expect(chart.width()).to.equal(420);
      });

      it('sets the width to a different value', function () {
        chart.width(550);

        expect(chart.width()).to.equal(550);
      });


    });

    describe("#height", function () {
      it('sets the width to the default width', function () {

        expect(chart.height()).to.equal(500);
      });

      it('sets the height to a different value', function() {
        chart.height(750);

        expect(chart.height()).to.equal(750);
      });
    });
  });



});