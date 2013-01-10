/**
 * @fileoverview Tests for the base control renderer.
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');

goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.asserts');
goog.require('remobid.common.ui.control.ControlBase');
goog.require('remobid.common.ui.control.ControlBaseRenderer');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - ControlBaseRenderer - ', function() {
  var renderer, control, model, sandBox, testTemplate, replacer;

  testTemplate = function(opt_data, opt_ignored) {
    return '<div><span data-rb-bind-get="href,html,1,0|id,text,1,0">' +
        '</span></div>';
  };

  before(function() {
    sandBox = goog.dom.getElement('sandBox');
  });

  beforeEach(function(done) {
    renderer = remobid.common.ui.control.ControlBaseRenderer.getInstance();
    replacer = new goog.testing.PropertyReplacer();
    replacer.set(renderer, 'template_', testTemplate);
    model = new remobid.common.model.ModelBase('aada');
    model.setAutoStore(false);
    control = new remobid.common.ui.control.ControlBase(model);
    remobid.test.mock.Utilities.clearStack(done);
  });

  after(function() {
    // let the GC remove the instance of the Renderer since it is not longer
    // needed but saved in the global scope
    remobid.common.ui.control.ControlBaseRenderer.instance_ = null;
    replacer.reset();
  });


  describe('binding - ', function() {

    it('should parse all binding', function() {
      var element, binding;
      element = renderer.createDom(control);
      binding = assertNotThrows('valid bindings not accept',
        goog.bind(renderer.parseBinding, renderer, element, model.mappings_)
      );

      var expectedBindingAttributes = ['href', 'id'];

      assertArrayEquals('wrong attributes parsed',
        expectedBindingAttributes,
        goog.object.getKeys(binding)
      );
    });

    it('should not accept unknown attributes to bind', function() {
      var element, exception;
      element = renderer.createDom(control);
      goog.dom.dataset.set(element, 'rbBindGet', 'unknown,html,1,0');
      exception = assertThrows('unknown attribute accepted',
        goog.bind(renderer.parseBinding, renderer, element, model.mappings_)
      );

      assertEquals('wrong exception thrown',
        remobid.common.ui.control.controlBaseRenderer.ErrorType.UNKNOWN_BINDING_NAME,
        exception.message
      );
    });


    it('should not accept unknown methods', function() {
      var element, exception;
      element = renderer.createDom(control);
      goog.dom.dataset.set(element.children[0], 'rbBindGet', 'href,lalaFunction,1,0');
      exception = assertThrows('unknown method accepted',
        goog.bind(renderer.parseBinding, renderer, element, model.mappings_)
      );

      assertEquals('wrong exception thrown',
        remobid.common.ui.control.controlBaseRenderer.ErrorType.UNKNOWN_BINDING_METHOD,
        exception.message
      );
    });

    it('should accept all known methods', function() {
      var binding, element, exception;
      element = renderer.createDom(control);
      binding = 'href,html,1,0|' +
          'href,text,1,0|' +
          'href,tglClass:rb-classname,1,0|' +
          'href,chAttr:title,1,0|' +
          'href,control,1,0';
      goog.dom.dataset.set(element.children[0], 'rbBindGet', binding);
      assertNotThrows('known method not accepted',
        goog.bind(renderer.parseBinding, renderer, element, model.mappings_)
      );
    });

  });

});
