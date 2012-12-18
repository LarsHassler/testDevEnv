
require('nclosure');

goog.require('goog.testing.asserts');
goog.require('remobid.Model');

describe('remobid.Model', function() {
  describe('constructor', function() {
    it('should set given name', function() {
      var Model = new remobid.Model('Jon');
      assertEquals(Model.getName(),'Jon');
    });

    it('should set name to test if no name was given', function() {
      var Model = new remobid.Model();
      assertEquals(Model.getName(),'abtest');
    });
  });

  it('should override the name with the setter methos', function() {
    var Model = new remobid.Model('Jon');
    Model.setName('Jane');
    assertEquals('Jane', Model.getName());
  });
});
