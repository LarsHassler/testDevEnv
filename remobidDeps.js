// This file was autogenerated by ../deps/closure-library/closure/bin/build/depswriter.py.
// Please do not edit.
goog.addDependency('../../../../deps/soy/soyutils_usegoog.js', ['soy', 'soy.StringBuilder', 'soy.esc', 'soydata', 'soydata.SanitizedHtml', 'soydata.SanitizedHtmlAttribute', 'soydata.SanitizedJs', 'soydata.SanitizedJsStrChars', 'soydata.SanitizedUri', 'soydata.VERY_UNSAFE'], ['goog.asserts', 'goog.dom.DomHelper', 'goog.format', 'goog.i18n.BidiFormatter', 'goog.i18n.bidi', 'goog.soy', 'goog.soy.data.SanitizedContentKind', 'goog.string', 'goog.string.StringBuffer']);
goog.addDependency('../../../../devEnv/testRunner.js', ['remobid.devEnv.TestRunner'], ['goog.array']);
goog.addDependency('../../../../src/common/cache/localcache.js', ['remobid.common.cache.LocalCache'], ['remobid.common.storage.LocalStorage']);
goog.addDependency('../../../../src/common/error/baseError.js', ['remobid.common.error.BaseError'], ['goog.debug.Error']);
goog.addDependency('../../../../src/common/model/base.js', ['remobid.common.model.Base', 'remobid.common.model.base.EventType'], ['goog.events.EventTarget']);
goog.addDependency('../../../../src/common/model/collection.js', ['remobid.common.model.Collection', 'remobid.common.model.collection.ErrorType', 'remobid.common.model.collection.Event', 'remobid.common.model.collection.EventType'], ['goog.asserts', 'goog.events.Event', 'remobid.common.error.BaseError', 'remobid.common.model.Base']);
goog.addDependency('../../../../src/common/model/modelBase.js', ['remobid.common.model.ModelBase', 'remobid.common.model.modelBase.ErrorType', 'remobid.common.model.modelBase.Event', 'remobid.common.model.modelBase.EventType', 'remobid.common.model.modelBase.Mapping'], ['goog.Timer', 'goog.events.Event', 'remobid.common.model.Base', 'remobid.common.model.Registry']);
goog.addDependency('../../../../src/common/model/registry.js', ['remobid.common.model.Registry', 'remobid.common.model.Registry.ErrorType'], ['goog.Disposable', 'goog.object']);
goog.addDependency('../../../../src/common/net/mySqlConnection.js', ['remobid.common.net.MySqlConnection', 'remobid.common.net.mySqlConnection.Data'], ['goog.Disposable', 'goog.array', 'remobid.common.error.BaseError', 'remobid.common.storage.StorageErrorType']);
goog.addDependency('../../../../src/common/net/restmanager.js', ['remobid.common.net.RestManager'], ['goog.crypt.base64', 'goog.json', 'goog.net.XhrManager']);
goog.addDependency('../../../../src/common/storage/constant_enum.js', ['remobid.common.storage.Constant'], []);
goog.addDependency('../../../../src/common/storage/localstorage.js', ['remobid.common.storage.LocalStorage', 'remobid.common.storage.LocalStorage.DataType'], ['goog.array', 'goog.json', 'goog.object', 'remobid.common.storage.StorageBase', 'remobid.common.storage.StorageErrorType']);
goog.addDependency('../../../../src/common/storage/mysql.js', ['remobid.common.storage.MySql'], ['goog.Disposable', 'goog.array', 'goog.object', 'remobid.common.net.MySqlConnection', 'remobid.common.storage.Constant', 'remobid.common.storage.StorageInterface']);
goog.addDependency('../../../../src/common/storage/rest.js', ['remobid.common.storage.Rest'], ['remobid.common.net.RestManager', 'remobid.common.storage.StorageBase', 'remobid.common.storage.StorageErrorType', 'remobid.common.storage.storageBase.Options']);
goog.addDependency('../../../../src/common/storage/storageBase.js', ['remobid.common.storage.StorageBase', 'remobid.common.storage.storageBase.Options'], ['goog.Disposable']);
goog.addDependency('../../../../src/common/storage/storageErrorType_enum.js', ['remobid.common.storage.StorageErrorType'], []);
goog.addDependency('../../../../src/common/storage/storage_interface.js', ['remobid.common.storage.StorageInterface'], []);
goog.addDependency('../../../../src/common/ui/control/ControlBase.js', ['remobid.common.ui.control.ControlBase', 'remobid.common.ui.control.controlBase.Mapping', 'remobid.common.ui.control.controlBase.Mappings'], ['goog.dom', 'goog.dom.dataset', 'goog.ui.Control', 'remobid.common.model.modelBase.EventType', 'remobid.common.ui.control.ControlBaseRenderer']);
goog.addDependency('../../../../src/common/ui/control/ControlBaseRenderer.js', ['remobid.common.ui.control.ControlBaseRenderer', 'remobid.common.ui.control.controlBaseRenderer.ErrorType', 'remobid.common.ui.control.controlBaseRenderer.bindMethods'], ['goog.soy', 'goog.ui.ControlRenderer', 'remobid.common.ui.control.controlBase.Mapping', 'remobid.templates.test']);
goog.addDependency('../../../../src/lots/model/lot.js', ['remobid.lots.model.Lot'], ['remobid.common.model.ModelBase', 'remobid.common.model.Registry']);
goog.addDependency('../../../../src/lots/ui/lotlistitem.js', ['remobid.lots.ui.LotListItem'], ['remobid.common.ui.control.ControlBase']);
goog.addDependency('../../../../templates/_compiled/testTemplate.soy.js', ['remobid.templates.test'], ['soy', 'soydata']);
goog.addDependency('../../../../test/mock/Utilities.js', ['remobid.test.mock.Utilities'], []);
goog.addDependency('../../../../test/mock/browser/localstorage.js', ['remobid.test.mock.browser.LocalStorage'], ['goog.object']);
