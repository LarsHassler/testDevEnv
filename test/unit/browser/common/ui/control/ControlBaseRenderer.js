/**
 * @fileoverview Tests for the base control renderer.
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');

goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.testing.asserts');
goog.require('remobid.common.ui.control.ControlBase');
goog.require('remobid.common.ui.control.controlBase.Mappings');
goog.require('remobid.common.ui.control.ControlBaseRenderer');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - ControlBaseRenderer - ', function() {
  var renderer, control, model, sandBox, testTemplate;

  testTemplate = function(opt_data, opt_ignored) {
    return '<div><span data-rb-bind-get="href,html,1,0|id,text,1,0">' +
        '</span></div>';
  };

  before(function() {
    sandBox = goog.dom.getElement('sandBox');
    if (typeof module !== 'undefined' && module.exports) {
      goog.Timer.defaultTimerObject = goog.global;
      mockClock = new goog.testing.MockClock(true);
    }
  });

  beforeEach(function(done) {
    renderer = remobid.common.ui.control.ControlBaseRenderer.getInstance();
    renderer.setTemplate(testTemplate);
    model = new remobid.common.model.ModelBase('aada');
    model.setAutoStore(false);
    control = new remobid.common.ui.control.ControlBase(model);
    remobid.test.mock.Utilities.clearStack(done);
  });

  after(function() {
    // let the GC remove the instance of the Renderer since it is not longer
    // needed but saved in the global scope
    remobid.common.ui.control.ControlBaseRenderer.instance_ = null;
  });

  describe('binding - ', function() {

    it('should parse all binding', function() {
      var element, binding;
      element = renderer.createDom(control);
      binding = assertNotThrows('valid bindings not accept',
        goog.bind(renderer.parseBinding, renderer, element, control.mappings_)
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
        goog.bind(renderer.parseBinding, renderer, element, control.mappings_)
      );

      var errorType = remobid.common.ui.control.controlBaseRenderer.ErrorType;
      assertEquals('wrong exception thrown',
        errorType.UNKNOWN_BINDING_NAME,
        exception.message
      );
    });

    it('should not accept unknown methods', function() {
      var element, exception;
      element = renderer.createDom(control);
      goog.dom.dataset.set(
        element.children[0],
        'rbBindGet',
        'href,lalaFunction,1,0'
      );
      exception = assertThrows('unknown method accepted',
        goog.bind(renderer.parseBinding, renderer, element, control.mappings_)
      );

      var errorType = remobid.common.ui.control.controlBaseRenderer.ErrorType;
      assertEquals('wrong exception thrown',
        errorType.UNKNOWN_BINDING_METHOD,
        exception.message
      );
    });

    it('should accept all known methods', function() {
      var element = renderer.createDom(control);
      var binding = 'href,html,1,0|' +
          'href,text,1,0|' +
          'href,tglClass:rb-classname,1,0|' +
          'href,chAttr:title,1,0|' +
          'href,control,1,0';
      goog.dom.dataset.set(element.children[0], 'rbBindGet', binding);
      var bindingOptions = assertNotThrows('known method not accepted',
        goog.bind(renderer.parseBinding, renderer, element, control.mappings_)
      );
      assertEquals('wrong binding count for HREF',
        5,
        bindingOptions['href'].length
      );
    });

    it('should return a full object for the binding options', function() {
      var element = renderer.createDom(control);
      var binding = 'href,html,1,0';
      goog.dom.dataset.set(element.children[0], 'rbBindGet', binding);
      var bindingOptions = renderer.parseBinding(element, control.mappings_);

      assertEquals('there should be 1 bindings for HREF',
        1,
        bindingOptions['href'].length
      );

      // check mapping
      assertObjectEquals('wrong mappings bound',
        remobid.common.ui.control.controlBase.Mappings.HREF,
        bindingOptions['href'][0].mappings
      );
      // check method
      assertEquals('wrong method bound',
        remobid.common.ui.control.controlBaseRenderer.bindMethods.html,
        bindingOptions['href'][0].method
      );
      // check element
      assertEquals('wrong element bound',
        element.children[0],
        bindingOptions['href'][0].element
      );
      // check control
      assertNull('should not bound to a control',
        bindingOptions['href'][0].control
      );
      // check useHelper flag
      assertTrue('wrong useHelper flag bound',
        bindingOptions['href'][0].useHelper
      );
      // check markParent flag
      assertFalse('wrong markParent flag bound',
        bindingOptions['href'][0].markParent
      );
      // check css class for external updates
      assertNull('should not have a css class bound',
        bindingOptions['href'][0].classForExternal
      );
    });

    it('should update without a helper function', function() {
      var element = renderer.createDom(control);
      var binding = 'href,text,0,0';
      goog.dom.dataset.set(element.children[0], 'rbBindGet', binding);
      var bindingOptions = renderer.parseBinding(element, control.mappings_);
      model.restUrl_ = 'https://www.testtest.co.uk';
      renderer.handleChangeEvent('href', false, bindingOptions, control);
      assertEquals('wrong updates applied',
        'https://www.testtest.co.uk',
        goog.dom.getTextContent(element.children[0])
      );
    });

    it('should update without a helper function', function() {
      var helperCalled = false;
      var element = renderer.createDom(control);
      var binding = 'href,html,1,0';
      goog.dom.dataset.set(element.children[0], 'rbBindGet', binding);
      var bindingOptions = renderer.parseBinding(element, control.mappings_);
      model.restUrl_ = 'https://www.testtest.co.uk';
      bindingOptions['href'][0].mappings.getterHelper = function(value) {
        helperCalled = true;
        return '#' + value + '!';
      };

      renderer.handleChangeEvent('href', false, bindingOptions, control);

      assertTrue('helper function not called',
        helperCalled
      );

      assertEquals('wrong updates applied',
        '#https://www.testtest.co.uk!',
        element.children[0].innerHTML
      );

      bindingOptions['href'][0].mappings.getterHelper = null;
    });

    it('should not call helper function if flag not set', function() {
      var helperCalled = false;
      var element = renderer.createDom(control);
      var binding = 'href,html,0,0';
      goog.dom.dataset.set(element.children[0], 'rbBindGet', binding);
      var bindingOptions = renderer.parseBinding(element, control.mappings_);
      model.restUrl_ = 'https://www.testtest.co.uk';
      bindingOptions['href'][0].mappings.getterHelper = function(value) {
        helperCalled = true;
        return '#' + value + '!';
      };

      renderer.handleChangeEvent('href', false, bindingOptions, control);

      assertFalse('helper function should not be called',
        helperCalled
      );

      assertEquals('wrong updates applied',
        'https://www.testtest.co.uk',
        element.children[0].innerHTML
      );

      bindingOptions['href'][0].mappings.getterHelper = null;
    });

    it('should handle model changed #integration', function() {
      control.createDom();
      model.setAutoStore(false);
      model.setRestUrl('https://api.remobid/v1/testUrl');

      mockClock.tick(model.changedEventDelay_);
      assertEquals('dom was not updated',
        'https://api.remobid/v1/testUrl',
        goog.dom.getTextContent(control.getElement().children[0])
      );
    });

  });

});
