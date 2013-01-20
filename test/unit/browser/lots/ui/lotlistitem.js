/**
 * @fileoverview Test for the listitem of a lot.
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');

goog.require('goog.testing.asserts');
goog.require('remobid.lots.ui.LotListItem');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - LotListItem -', function() {
  var sandBox;

  before(function() {
    sandBox = goog.dom.getElement('sandBox');
  });

  beforeEach(function(done) {
    remobid.test.mock.Utilities.clearStack(done);
  });
  
});
