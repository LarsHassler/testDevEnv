/**
 * @fileoverview test for the base class of ui list.
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');

goog.require('goog.testing.asserts');
goog.require('remobid.common.ui.list.BaseList');
goog.require('remobid.common.model.Collection');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - BaseList - ', function() {
  var listModel, list;

  beforeEach(function(done) {
    listModel = new remobid.common.model.Collection();
    list = new remobid.common.ui.list.BaseList(listModel);

    remobid.test.mock.Utilities.clearStack(done);
  });


  describe('set model - ', function() {

    it('should remove all children on model change', function() {
      var child = new goog.ui.Control('aa');
      list.addChild(child);
      var listModel2 = new remobid.common.model.Collection();
      list.setModel(listModel);
      assertArrayEquals('child was removed even if the list' +
          ' model was not changed',
        [child],
        list.children_
      );
      list.setModel(listModel2);
      assertArrayEquals('children were not removed',
        [],
        list.children_
      );
    });

  });


  
});
