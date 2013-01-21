/**
 * @fileoverview base class for base control rendering.
 */

goog.provide('remobid.common.ui.control.ControlBaseRenderer');
goog.provide('remobid.common.ui.control.controlBaseRenderer.ErrorType');
goog.provide('remobid.common.ui.control.controlBaseRenderer.bindMethods');

goog.require('goog.soy');
goog.require('goog.ui.ControlRenderer');
goog.require('remobid.common.ui.control.controlBase.Mapping');
goog.require('remobid.templates.test');


/**
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
remobid.common.ui.control.ControlBaseRenderer = function() {
  goog.base(this);

  /**
   * the template to use with this renderer.
   * @type {function}
   * @private
   */
  this.template_ = remobid.templates.test.modelDisplay;
};
goog.inherits(remobid.common.ui.control.ControlBaseRenderer,
  goog.ui.ControlRenderer);
goog.addSingletonGetter(remobid.common.ui.control.ControlBaseRenderer);

/**
 * overrides the template of this renderer.
 * @param {function} template
 *    the new template.
 */
remobid.common.ui.control.ControlBaseRenderer.prototype.setTemplate = function(
    template) {
  this.template_ = template;
};

/**
 * @param {remobid.common.ui.control.ControlBase} control the control to render.
 * @return {!Node} the HTML element for the control.
 */
remobid.common.ui.control.ControlBaseRenderer.prototype.createDom = function(
    control) {
  var templateData, element;

  templateData = {
    modelData: control.getModelData()
  };
  element = goog.soy.renderAsFragment(this.template_,
    templateData);

  this.setAriaStates(control, element);
  return element;
};

/**
 * parses the template and set the bindOptions to the given Control. Need to be
 * called just one time.
 * @param {Node} element the element of a control.
 * @param {Object.<remobid.common.model.modelBase.Mapping>} mappings the
 *    attribute mappings of the used model for this control.
 * @return {Object.<string, Array>} the bindings found in the html code.
 */
remobid.common.ui.control.ControlBaseRenderer.prototype.parseBinding = function(
    element, mappings) {
  var nodes2bind, bindings;

  nodes2bind = goog.dom.findNodes(element, function(node) {
    return node.nodeType != goog.dom.NodeType.TEXT &&
      (goog.dom.dataset.has(node, 'rbBindGet') ||
        goog.dom.dataset.has(node, 'rbBindSet'));
  });
  // also check the root node, since findNodes only checks the children of a
  // given node
  if (goog.dom.dataset.has(element, 'rbBindGet') ||
      goog.dom.dataset.has(element, 'rbBindSet'))
    nodes2bind.push(element);

  bindings = {};

  goog.array.forEach(
    nodes2bind,
    goog.bind(this.parseNode_, this, mappings, bindings)
  );

  return bindings;
};

/**
 * parses one given dom node for all binding attributes. Also checks against
 * the given mappings if the binding contains invalid data.
 * @param {Object.<remobid.common.model.modelBase.Mapping>} mappings
 *    the mappings to check against for invalid data.
 * @param {Object} bindings
 *    the final bindings object to put all new found bindings into.
 * @param {Node} node
 *    the node to check.
 * @private
 */
remobid.common.ui.control.ControlBaseRenderer.prototype.parseNode_ =
    function(mappings, bindings, node) {
  var bindValues;

  bindValues = goog.dom.dataset.get(node, 'rbBindGet').split('|');
  goog.array.forEach(bindValues, function(values) {
    if (values == '')
      return;

    var bindOptions = values.split(',');
    var name = bindOptions[0];
    var mapping = goog.object.findValue(mappings, function(mapping) {
      return mapping.name == name;
    });

    // an unknown mapping name was found
    if (!mapping) {
      // todo change to remobid error instance
      errorTypes = remobid.common.ui.control.controlBaseRenderer.ErrorType;
      throw new Error(errorTypes.UNKNOWN_BINDING_NAME);
      return;
    }

    var method = bindOptions[1].split(':');
    // an unknown method was found
    if (!goog.object.containsKey(
          remobid.common.ui.control.controlBaseRenderer.bindMethods,
          method[0])) {
      // todo change to remobid error instance
      var errorTypes = remobid.common.ui.control.controlBaseRenderer.ErrorType;
      throw new Error(errorTypes.UNKNOWN_BINDING_METHOD);
      return;
    }

    if (!goog.object.containsKey(bindings, name)) {
      bindings[name] = [];
    }
    bindings[name].push({
      mappings: mapping,
      method:
        remobid.common.ui.control.controlBaseRenderer.bindMethods[method[0]],
      methodOptions: method[1] || null,
      element: node,
      control: method === 'control' ? true : null,
      useHelper: bindOptions[2] === '1',
      markParent: bindOptions[3] === '1',
      classForExternal: !!bindOptions[4] ? bindOptions[4] : null
    });

  });
};

/**
 * applies all binding to the appropriate elements
 * @param {string} attribute
 *    the attribute of the model which was changed.
 * @param {boolean} external
 *    whenever the the change was triggered from external.
 * @param {Object.<string, Array>} bindOptions
 *    all bind options of the control.
 * @param {remobid.common.ui.control.ControlBase} control
 *    the control.
 */
remobid.common.ui.control.ControlBaseRenderer.prototype.handleChangeEvent =
    function(attribute, external, bindOptions, control) {
  bindOptions = bindOptions[attribute];
  if (!bindOptions)
    return;

  goog.array.forEach(bindOptions, function(options) {
    var value = options.mappings.getter.call(control.getModel());
    if (options.useHelper &&
        goog.object.containsKey(control.getMappings(), attribute) &&
        goog.isFunction(control.getMappings()[attribute].getter)) {
      value = control.getMappings()[attribute].getter(value);
    }
    options.method(
      value,
      options.element,
      options.control,
      options.methodOptions
    );
  });

};
//

/**
 * holds all valid functions that can be called via the binding
 * @type {Object.<string, function>}
 */
remobid.common.ui.control.controlBaseRenderer.bindMethods = {
  'html': function(value, element, control) {
    element.innerHTML = value;
  },
  'text': function(value, element, control) {
    goog.dom.setTextContent(element, value);
  },
  'tglClass': goog.nullFunction,
  'chAttr': function(value, element, control, options) {
    element[options] = value;
  },
  'control': goog.nullFunction
};

/** @enum {string} */
remobid.common.ui.control.controlBaseRenderer.ErrorType = {
  // if the template tries to bind to an unknown attribute of the model
  UNKNOWN_BINDING_NAME: 'unknown_name',
  // if the template tries to bind with an unknown method
  UNKNOWN_BINDING_METHOD: 'unknown_method'
};
