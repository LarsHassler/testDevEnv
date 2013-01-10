/**
 * @fileoverview base class for a control. Including live binding functionality.
 */

goog.provide('remobid.common.ui.control.ControlBase');

goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.ui.Control');
goog.require('remobid.common.model.ModelBase.EventType');
goog.require('remobid.common.ui.control.ControlBaseRenderer');


/**
 * @param {remobid.common.model.ModelBase} model the data model for this
 *    control.
 * @param {remobid.common.ui.control.ControlBaseRenderer=} opt_renderer Renderer
 *    used to render or decorate the component.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *    document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 */
remobid.common.ui.control.ControlBase = function(model, opt_renderer,
    opt_domHelper) {
  var renderer = opt_renderer ||
    remobid.common.ui.control.ControlBaseRenderer.getInstance();

  goog.base(this,
    '',
    renderer,
    opt_domHelper);

  /**
   * @type {remobid.common.model.ModelBase}
   * @private
   */
  this.model_ = model;

  /**
   * a reference to the attribute mappings of this control type. Must be
   * extended by all subclasses
   * @type {Object.<remobid.common.model.ModelBase.Mapping>}
   * @private
   */
  this.mappings_ = remobid.common.ui.control.ControlBase.mappings;

  /**
   * holds all options for a
   * @type {?Object.<string, Object>}
   * @private
   */
  this.bindOptions_;

  /**
   * holds an array of all nodes that have bindings for easier access
   * @type {?Array.<Node>}
   * @private
   */
  this.bindNodes_;
};
goog.inherits(remobid.common.ui.control.ControlBase,
  goog.ui.Control);

/** @override */
remobid.common.ui.control.ControlBase.prototype.disposeInternal = function() {

};

/**
 * @override
 */
remobid.common.ui.control.ControlBase.prototype.enterDocument = function(
    element) {
  goog.base(this, 'enterDocument', element);

  this.initBinding(element);
};

/**
 * get all node from the element of the control where the binding data attr is
 * set an creates all necessary binding.
 */
remobid.common.ui.control.ControlBase.prototype.initBinding = function() {
  var dom = this.getDomHelper();

  if (!this.bindOptions_) {
    this.bindOptions_ = this.getRenderer().parseBinding();
  }

  var nodes2bind = goog.dom.findNodes(this.getElement(), function(node) {
    return node.nodeType != goog.dom.NodeType.TEXT &&
      goog.dom.dataset.has(node, 'rbBind');
  });

  goog.array.forEach(nodes2bind, this.bindNode_, this);
};

/**
 * parses the
 * @private
 */
remobid.common.ui.control.ControlBase.prototype.parseBindOptions_ = function() {

};

/**
 * creates the binding for a given node
 * @param {!Node} node the node to bind to.
 * @private
 */
remobid.common.ui.control.ControlBase.prototype.bindNode_ = function(node) {
  var attributes, mapping, bindSet, bindGet, options, bindOptions;


  attributes = goog.dom.dataset.getAll(node);

  mapping = goog.object.findValue(this.mappings_, function(mapping) {
    return mapping.name === attributes['rbBind'];
  });

  if (!mapping) {
    throw Error(
      remobid.common.ui.control.ControlBase.ErrorType.UNKNOWN_MAPPING
    );
  }

  bindSet = goog.object.containsKey(attributes, 'rbBindSet');
  bindGet = goog.object.containsKey(attributes, 'rbBindGet');

  // bind model updates to html updates
  if (bindSet) {
    options = attributes['rbBindGet'].split(',');
    bindOptions = {

    };
  }

  if (bindGet) {
  }

  if (bindSet || bindGet) {
    this.getHandler()
      .listen(
        this.getModel(),
        remobid.common.model.ModelBase.EventType.LOCALLY_CHANGED,
        goog.bind(
          this.getBindFunction(attributes['rbBindType']),
          this,
          node,
          mapping,
          goog.object.containsKey(attributes, 'rbBindHelper')
        )
      );
  }
};

/**
 * generates a JSON Object with all necessary data for the templates.
 * @return {Object} the json object.
 */
remobid.common.ui.control.ControlBase.prototype.getModelData = function() {
  var returnData = {};

  goog.object.forEach(this.mappings_, function(mapping) {
    var value = mapping.getter.apply(this.getModel());
    if (goog.isFunction(mapping.getterHelper)) {
      value = mapping.getterHelper(value);
    }
    returnData[mapping.name] = value;
  }, this);

  return returnData;
};

/**
 * creates the approriate function for a bind type.
 * @param {string} type the type to bind.
 * @return {function(!Node,
 *  remobid.common.ui.control.ControlBase.Mapping, boolean=)} the function that
 *     handles the binding.
 */
remobid.common.ui.control.ControlBase.prototype.getBindFunction = function(
    type) {
  var returnFunction;

  switch (type) {

    case 'innerHTML':
      returnFunction = function(node, mapping, useHelper) {
        var value = mapping.getter.apply(this.getModel());
        if (useHelper && goog.isDef(mapping.getterHelper)) {
          value = mapping.getterHelper(value);
        }
        node.innerHTML = value;
      };
      break;
    default:
      returnFunction = function(node, mapping, useHelper) {
        var value = mapping.getter.apply(this.getModel());
        if (useHelper && goog.isDef(mapping.getterHelper)) {
          value = mapping.getterHelper(value);
        }
        goog.dom.setTextContent(node, value);
      };
      break;
  }

  return returnFunction;
};


/**
 * @typedef {{name: string, getter: Function, setter: Function,
 *   getterHelper, setterHelper, autoStore}}
 */
remobid.common.ui.control.ControlBase.Mapping;

/** @enum {string} */
remobid.common.ui.control.ControlBase.ErrorType = {
  UNKNOWN_MAPPING: 'trying to bind an unknown key'
};

/**
 * holds all attribute mappings for this resource type.
 * @type {Object.<remobid.common.ui.control.ControlBase.Mapping>}
 */
remobid.common.ui.control.ControlBase.mappings = {
  ID: {
    name: 'id',
    getter: remobid.common.model.ModelBase.prototype.getIdentifier,
    setter: remobid.common.model.ModelBase.prototype.setIdentifier
  },
  HREF: {
    name: 'href',
    getter: remobid.common.model.ModelBase.prototype.getRestUrl,
    setter: remobid.common.model.ModelBase.prototype.setRestUrl
  }
};
