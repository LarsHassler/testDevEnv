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
      lotNo: '100A',
      picture: 'http://img.remobid.com/1.jpg'
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
      assertEquals('there should be a img tag within the picture element',
        'IMG',
        foundElements[0].children[0].tagName.toUpperCase()
      );
      assertEquals('src of the img is wrong',
        'http://img.remobid.com/1.jpg',
        foundElements[0].children[0].src
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

  describe('template binding - #integration ', function() {

    it('should update the element of the lotno', function() {
      control.createDom();
      var element = control.getElement();
      var foundElements = goog.dom.getElementsByClass('rb-lot-lotno', element);
      model.setLotNo('99B');
      mockClock.tick(model.changedEventDelay_);
      assertEquals('template not updated',
        '99B',
        goog.dom.getTextContent(foundElements[0])
      );
    });

    it('should update the src of the picture', function() {
      control.createDom();
      var element = control.getElement();
      var foundElements = goog.dom.getElementsByClass('rb-lot-pic', element);
      model.setPicture('http://testur.de/pic2.jpg');
      mockClock.tick(model.changedEventDelay_);
      assertEquals('template not updated',
        'http://testur.de/pic2.jpg',
        foundElements[0].children[0].src
      );
    });

  });
  
});
