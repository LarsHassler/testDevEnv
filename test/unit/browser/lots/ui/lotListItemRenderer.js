/**
 * @fileoverview Tests the renderer for a list item of a lot .
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');

goog.require('goog.testing.asserts');
goog.require('remobid.lots.model.Lot');
goog.require('remobid.lots.ui.LotListItem');
goog.require('remobid.lots.ui.LotListItemRenderer');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - lot item Renderer -', function() {
  var model, control, renderer;

  beforeEach(function(done) {
    model = new remobid.lots.model.Lot('123');
    model.setAutoStore(false);
    model.updateDataViaMappings({
      lotNo: '100A'
    });
    control = new remobid.lots.ui.LotListItem(model);
    renderer = remobid.lots.ui.LotListItemRenderer.getInstance();
    remobid.test.mock.Utilities.clearStack(done);
  });

  describe('rendered template - ', function() {

    it('should have exactly one element for the lot number', function() {
      var element = renderer.createDom(control);
      var foundElements = goog.dom.getElementsByClass('rb-lot-lotno', element);
      assertEquals('element not found or multiple elements found',
        1,
        foundElements.length
      );
      assertEquals('wrong value inside the template',
        '100A',
        goog.dom.getTextContent(foundElements[0])
      );

    });

    it('should have exactly one element for the picture', function() {
      var element = renderer.createDom(control);
      var foundElements = goog.dom.getElementsByClass('rb-lot-pic', element);
      assertEquals('element not found or multiple elements found',
        1,
        foundElements.length
      );
    });

    it('should have exactly one element for the start price', function() {
      var element = renderer.createDom(control);
      var foundElements = goog.dom.getElementsByClass('rb-lot-start', element);
      assertEquals('element not found or multiple elements found',
        1,
        foundElements.length
      );
    });

    it('should have exactly one element for the current bid/sold price',
        function() {
          var element = renderer.createDom(control);
          var foundElements = goog.dom.getElementsByClass(
            'rb-lot-bid',
            element
          );
          assertEquals('element not found or multiple elements found',
            1,
            foundElements.length
          );
    });
  });
  
});
