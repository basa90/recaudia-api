/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/core/message/Message",
	"sap/ui/model/Binding",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Model",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_MetadataRequestor",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/test/TestUtils"
], function (jQuery, Message, Binding, BindingMode, Model, TypeString, ODataUtils, OperationMode,
		_ODataHelper, Context, _MetadataRequestor, _Requestor, ODataContextBinding,
		ODataListBinding, ODataMetaModel, ODataModel, ODataPropertyBinding, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	/*
	 * You can run various tests in this module against a real OData V4 service using the request
	 * property "realOData". See src/sap/ui/test/TestUtils.js for details.
	 */

	var sClassName = "sap.ui.model.odata.v4.ODataModel",
		mFixture = {
			"TEAMS('TEAM_01')/Name" : {source : "Name.json"},
			"TEAMS('UNKNOWN')" : {code : 404, source : "TEAMS('UNKNOWN').json"}
		},
		sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
		TestControl = sap.ui.core.Element.extend("test.sap.ui.model.odata.v4.ODataModel", {
			metadata : {
				properties : {
					text : "string"
				}
			}
		});

	/**
	 * Creates a V4 OData service for <code>TEA_BUSI</code>.
	 *
	 * @param {string} [sQuery] URI query parameters starting with '?'
	 * @param {object} [mParameters] additional model parameters
	 * @returns {sap.ui.model.odata.v4.oDataModel} the model
	 */
	function createModel(sQuery, mParameters) {
		mParameters = jQuery.extend({}, mParameters, {
			serviceUrl : getServiceUrl() + (sQuery || ""),
			synchronizationMode : "None"
		});
		return new ODataModel(mParameters);
	}

	/**
	 * Returns a URL within the service that (in case of <code>bRealOData</code>), is passed
	 * through a proxy.
	 *
	 * @param {string} [sPath]
	 *   relative path (with initial /) within service
	 * @returns {string}
	 *   a URL within the service
	 */
	function getServiceUrl(sPath) {
		return TestUtils.proxy(sServiceUrl + (sPath && sPath.slice(1) || ""));
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataModel", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			TestUtils.setupODataV4Server(this.oSandbox, mFixture, undefined, sServiceUrl);
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			this.oSandbox.mock(sap.ui.getCore().getConfiguration()).expects("getLanguageTag")
				.atLeast(0).returns("ab-CD");
		},

		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oMetadataRequestor = {},
			oMetaModel,
			oModel,
			mModelOptions = {};

		assert.throws(function () {
			return new ODataModel();
		}, new Error("Synchronization mode must be 'None'"));
		assert.throws(function () {
			return new ODataModel({synchronizationMode : "None"});
		}, new Error("Missing service root URL"));
		assert.throws(function () {
			return new ODataModel({serviceUrl : "/foo", synchronizationMode : "None"});
		}, new Error("Service root URL must end with '/'"));
		assert.throws(function () {
			return new ODataModel({synchronizationMode : "None", useBatch : true});
		}, new Error("Unsupported parameter: useBatch"));
		assert.throws(function () {
			return new ODataModel({operationMode : OperationMode.Auto, serviceUrl : "/foo/",
				synchronizationMode : "None"});
		}, new Error("Unsupported operation mode: Auto"), "Unsupported OperationMode");

		// code under test: operation mode Server must not throw an error
		oModel = createModel("", {operationMode : OperationMode.Server, serviceUrl : "/foo/",
			synchronizationMode : "None"});

		assert.strictEqual(oModel.sOperationMode, OperationMode.Server);
		oMetaModel = oModel.getMetaModel();

		this.mock(_ODataHelper).expects("buildQueryOptions")
			.withExactArgs(null, {}, null, true)
			.returns(mModelOptions);
		this.mock(_MetadataRequestor).expects("create")
			.withExactArgs({"Accept-Language" : "ab-CD"}, sinon.match.same(mModelOptions))
			.returns(oMetadataRequestor);

		// code under test
		oModel = createModel("", {annotationURI : ["my/annotations.xml"]});

		assert.strictEqual(oModel.sServiceUrl, getServiceUrl());
		assert.strictEqual(oModel.toString(), sClassName + ": " + getServiceUrl());
		assert.strictEqual(oModel.mUriParameters, mModelOptions);
		assert.strictEqual(oModel.getDefaultBindingMode(), BindingMode.TwoWay);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneTime), true);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.OneWay), true);
		assert.strictEqual(oModel.isBindingModeSupported(BindingMode.TwoWay), true);
		assert.deepEqual(oModel.aAllBindings, []);
		oMetaModel = oModel.getMetaModel();
		assert.ok(oMetaModel instanceof ODataMetaModel);
		assert.strictEqual(oMetaModel.oRequestor, oMetadataRequestor);
		assert.strictEqual(oMetaModel.sUrl, getServiceUrl() + "$metadata");
		assert.deepEqual(oMetaModel.aAnnotationUris, ["my/annotations.xml"]);
	});

	//*********************************************************************************************
	QUnit.test("with serviceUrl params", function (assert) {
		var oModel,
			mModelOptions = {};

		this.mock(_ODataHelper).expects("buildQueryOptions")
			.withExactArgs(null, {"sap-client" : "111"}, null, true)
			.returns(mModelOptions);

		// code under test
		oModel = createModel("?sap-client=111");

		assert.strictEqual(oModel.sServiceUrl, getServiceUrl());
		assert.strictEqual(oModel.mUriParameters, mModelOptions);
	});

	//*********************************************************************************************
	QUnit.test("Model construction with group ID", function (assert) {
		var oModel;

		oModel = createModel();
		assert.strictEqual(oModel.getGroupId(), "$auto");

		oModel = createModel("", {groupId : "$direct"});
		assert.strictEqual(oModel.getGroupId(), "$direct");

		oModel = createModel("", {groupId : "$auto"});
		assert.strictEqual(oModel.getGroupId(), "$auto");

		assert.throws(function () {
			oModel = createModel("", {groupId : "foo"});
		}, new Error("Group ID must be '$auto' or '$direct'"));
	});

	//*********************************************************************************************
	QUnit.test("Model construction with update group ID", function (assert) {
		var oModel;

		oModel = createModel();
		assert.strictEqual(oModel.getUpdateGroupId(), "$auto");

		oModel = createModel("", {groupId : "$direct"});
		assert.strictEqual(oModel.getUpdateGroupId(), "$direct");

		oModel = createModel("", {updateGroupId : "$direct"});
		assert.strictEqual(oModel.getUpdateGroupId(), "$direct");

		oModel = createModel("", {groupId : "$direct", updateGroupId : "applicationId"});
		assert.strictEqual(oModel.getUpdateGroupId(), "applicationId");

		assert.throws(function () {
			oModel = createModel("", {updateGroupId : "$foo"});
		}, new Error("Invalid update group ID: $foo"));
	});

	//*********************************************************************************************
	QUnit.test("Model creates _Requestor", function (assert) {
		var oModel,
			oRequestor = {};

		this.mock(_Requestor).expects("create")
			.withExactArgs(getServiceUrl(), {"Accept-Language" : "ab-CD"}, {"sap-client" : "123"})
			.returns(oRequestor);

		oModel = createModel("?sap-client=123");

		assert.ok(oModel instanceof Model);
		assert.strictEqual(oModel.oRequestor, oRequestor);
	});

	//*********************************************************************************************
	QUnit.skip("Property access from ManagedObject w/o context binding", function (assert) {
		var oModel = createModel(),
			oControl = new TestControl({models : oModel}),
			done = assert.async();

		oControl.bindProperty("text", {
			path : "/TEAMS('TEAM_01')/Name",
			type : new TypeString()
		});
		// bindProperty creates an ODataPropertyBinding and calls its initialize which results in
		// checkUpdate and a request. The value is updated asynchronously via a change event later
		oControl.getBinding("text").attachChange(function () {
			assert.strictEqual(oControl.getText(), "Business Suite", "property value");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.skip("Property access from ManagedObject w/ context binding", function (assert) {
		var oModel = createModel(),
			oControl = new TestControl({models : oModel}),
			done = assert.async();

		oControl.bindObject("/TEAMS('TEAM_01')");
		oControl.bindProperty("text", {
			path : "Name",
			type : new TypeString()
		});
		// bindProperty creates an ODataPropertyBinding and calls its initialize which results in
		// checkUpdate and a request. The value is updated asynchronously via a change event later
		oControl.getBinding("text").attachChange(function () {
			assert.strictEqual(oControl.getText(), "Business Suite", "property value");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaModel", function (assert) {
		var oMetaModel = createModel().getMetaModel();

		assert.ok(oMetaModel instanceof ODataMetaModel);
	});

	//*********************************************************************************************
	[undefined, "?foo=bar"].forEach(function (sQuery) {
		QUnit.skip("create", function (assert) {
			var oEmployeeData = {},
				oModel = createModel(sQuery),
				oPromise = {};

			this.mock(oModel.oRequestor).expects("request")
				//TODO remove usage of oModel._sQuery once cache is used for all CRUD operations
				.withExactArgs("POST", "EMPLOYEES" + oModel._sQuery, undefined, null,
					sinon.match.same(oEmployeeData)).returns(oPromise);

			assert.strictEqual(oModel.create("/EMPLOYEES", oEmployeeData), oPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestCanonicalPath", function (assert) {
		var oModel = createModel(),
			oEntityContext = Context.create(oModel, null, "/EMPLOYEES/42");

		this.mock(oEntityContext).expects("requestCanonicalPath").withExactArgs()
			.returns(Promise.resolve("/EMPLOYEES(ID='1')"));

		return oModel.requestCanonicalPath(oEntityContext).then(function (sCanonicalPath) {
			assert.strictEqual(sCanonicalPath, "/EMPLOYEES(ID='1')");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestCanonicalPath, context from different model", function (assert) {
		var oModel = createModel(),
			oModel2 = createModel(),
			oEntityContext = Context.create(oModel2, null, "/EMPLOYEES/42");

		this.mock(oEntityContext).expects("requestCanonicalPath").withExactArgs()
			.returns(Promise.resolve("/EMPLOYEES(ID='1')"));
		if (jQuery.sap.log.getLevel() > jQuery.sap.log.LogLevel.ERROR) { // not for minified code
			this.mock(jQuery.sap).expects("assert")
				.withExactArgs(false, "oEntityContext must belong to this model");
		}

		oModel.requestCanonicalPath(oEntityContext);
	});

	//*********************************************************************************************
	QUnit.test("refresh", function (assert) {
		var oCacheProxy = {
				promise : Promise.resolve({})
			},
			oError = new Error(),
			oHelperMock = this.mock(_ODataHelper),
			oModel = createModel(),
			oContext = Context.create(oModel, undefined, "/TEAMS('42')"),
			oListBinding = oModel.bindList("/TEAMS"),
			oListBinding2 = oModel.bindList("/TEAMS"),
			oRelativeContextBinding = oModel.bindContext("TEAM_2_MANAGER", undefined, {}),
			oPropertyBinding = oModel.bindProperty("Name");

		// cache proxy for oRelativeContextBinding
		this.mock(oContext).expects("fetchCanonicalPath").returns("~");
		this.mock(_ODataHelper).expects("createCacheProxy").returns(oCacheProxy);
		oRelativeContextBinding.setContext(oContext);

		oListBinding.attachChange(function () {});
		oPropertyBinding.attachChange(function () {});
		oRelativeContextBinding.attachChange(function () {});
		this.mock(oListBinding).expects("refresh").withExactArgs("myGroup");
		//check: only bindings with change event handler are refreshed
		this.mock(oListBinding2).expects("refresh").never();
		//check: no refresh on binding with relative path
		this.mock(oPropertyBinding).expects("refresh").never();
		oHelperMock.expects("checkGroupId").withExactArgs("myGroup");

		return oCacheProxy.promise.then(function () {
			// code under test
			oModel.refresh("myGroup");

			oHelperMock.expects("checkGroupId").withExactArgs("$Invalid").throws(oError);

			// code under test
			assert.throws(function () {
				oModel.refresh("$Invalid");
			}, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("oModel.aBindings modified during refresh", function (assert) {
		var iCallCount = 0,
			oModel = createModel(),
			oListBinding = oModel.bindList("/TEAMS"),
			oListBinding2 = oModel.bindList("/TEAMS");

		function change() {}

		function detach() {
			this.detachChange(change); // removes binding from oModel.aBindings
			iCallCount += 1;
		}

		oListBinding.attachChange(change); // adds binding to oModel.aBindings
		oListBinding2.attachChange(change);
		oListBinding.attachRefresh(detach);
		oListBinding2.attachRefresh(detach);

		oModel.refresh();

		assert.strictEqual(iCallCount, 2, "refresh called for both bindings");
	});

	//*********************************************************************************************
	QUnit.test("addedRequestToGroup with group ID '$direct'", function (assert) {
		var bDataRequested = false,
			oModel = createModel();

		this.mock(sap.ui.getCore()).expects("addPrerenderingTask").never();
		this.mock(oModel.oRequestor).expects("submitBatch").never();

		// code under test
		oModel.addedRequestToGroup("$direct");

		// code under test
		oModel.addedRequestToGroup("$direct", function () {
			bDataRequested = true;
		});

		assert.strictEqual(bDataRequested, true);
		assert.strictEqual("$direct" in oModel.mCallbacksByGroupId, false);
	});

	//*********************************************************************************************
	QUnit.test("addedRequestToGroup with group ID '$auto'", function (assert) {
		var oModel = createModel(),
			fnGroupSentCallback = function () {},
			fnGroupSentCallback2 = function () {},
			fnSubmitAuto = function () {};

		this.mock(oModel._submitBatch).expects("bind")
			.withExactArgs(sinon.match.same(oModel), "$auto")
			.returns(fnSubmitAuto);
		this.mock(sap.ui.getCore()).expects("addPrerenderingTask")
			.withExactArgs(fnSubmitAuto);

		// code under test
		oModel.addedRequestToGroup("$auto");

		assert.deepEqual(oModel.mCallbacksByGroupId["$auto"], []);

		// code under test
		oModel.addedRequestToGroup("$auto", fnGroupSentCallback);
		oModel.addedRequestToGroup("$auto", fnGroupSentCallback2);

		assert.deepEqual(oModel.mCallbacksByGroupId["$auto"],
			[fnGroupSentCallback, fnGroupSentCallback2]);
	});

	//*********************************************************************************************
	QUnit.test("addedRequestToGroup with application group ID", function (assert) {
		var oModel = createModel(),
			fnGroupSentCallback = {},
			fnGroupSentCallback2 = {};

		this.mock(sap.ui.getCore()).expects("addPrerenderingTask").never();

		// code under test
		oModel.addedRequestToGroup("groupId");

		assert.deepEqual(oModel.mCallbacksByGroupId["groupId"], []);

		// code under test
		oModel.addedRequestToGroup("groupId", fnGroupSentCallback);
		oModel.addedRequestToGroup("groupId", fnGroupSentCallback2);

		assert.deepEqual(oModel.mCallbacksByGroupId["groupId"],
			[fnGroupSentCallback, fnGroupSentCallback2]);
	});

	//*********************************************************************************************
	QUnit.test("_submitBatch: success", function (assert) {
		var oBatchResult = {},
			fnCallback1 = sinon.spy(),
			fnCallback2 = sinon.spy(),
			oModel = createModel();

		this.mock(oModel.oRequestor).expects("submitBatch").withExactArgs("groupId")
			.returns(Promise.resolve(oBatchResult));
		oModel.mCallbacksByGroupId["groupId"] = [fnCallback1, fnCallback2];

		// code under test
		return oModel._submitBatch("groupId").then(function (oResult) {
			assert.strictEqual(oResult, oBatchResult);
			assert.strictEqual(oModel.mCallbacksByGroupId["groupId"], undefined);
			assert.ok(fnCallback1.calledOnce);
			assert.ok(fnCallback2.calledOnce);
		});
	});

	//*********************************************************************************************
	QUnit.test("_submitBatch, failure", function (assert) {
		var oExpectedError = new Error("deliberate failure"),
			oModel = createModel();

		oModel.addedRequestToGroup("groupId");
		this.mock(oModel.oRequestor).expects("submitBatch")
			.withExactArgs("groupId")
			.returns(Promise.reject(oExpectedError));
		this.oLogMock.expects("error")
			.withExactArgs("$batch failed", oExpectedError.message, sClassName);

		// code under test
		return oModel._submitBatch("groupId").then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch", function (assert) {
		var oModel = createModel(),
			oReturn,
			oSubmitPromise = {};

		this.mock(_ODataHelper).expects("checkGroupId").withExactArgs("groupId", true);
		this.mock(oModel).expects("_submitBatch").withExactArgs("groupId")
			.returns(oSubmitPromise);

		// code under test
		oReturn = oModel.submitBatch("groupId");

		assert.strictEqual(oReturn, oSubmitPromise);
	});

	//*********************************************************************************************
	QUnit.test("submitBatch, invalid group ID", function (assert) {
		var oError = new Error(),
			oModel = createModel();

		this.mock(oModel).expects("_submitBatch").never();
		this.mock(_ODataHelper).expects("checkGroupId").withExactArgs("$auto", true)
			.throws(oError);

		assert.throws(function () {
			oModel.submitBatch("$auto");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("resetChanges with group ID", function (assert) {
		var oModel = createModel();

		this.mock(_ODataHelper).expects("checkGroupId").withExactArgs("groupId", true);
		this.mock(oModel.oRequestor).expects("cancelPatch").withExactArgs("groupId");

		// code under test
		oModel.resetChanges("groupId");
	});

	//*********************************************************************************************
	QUnit.test("resetChanges w/o group ID", function (assert) {
		var oModel = createModel("", {updateGroupId : "updateGroupId"});

		this.mock(_ODataHelper).expects("checkGroupId").withExactArgs("updateGroupId", true);
		this.mock(oModel.oRequestor).expects("cancelPatch").withExactArgs("updateGroupId");

		// code under test
		oModel.resetChanges();
	});

	//*********************************************************************************************
	QUnit.test("resetChanges, invalid group ID", function (assert) {
		var oError = new Error(),
			oModel = createModel();

		this.mock(_ODataHelper).expects("checkGroupId").withExactArgs("$auto", true)
			.throws(oError);
		this.mock(oModel.oRequestor).expects("cancelPatch").never();

		assert.throws(function () {
			oModel.resetChanges();
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oModel = createModel();

		assert.throws(function () { //TODO implement
			oModel.bindTree();
		}, new Error("Unsupported operation: v4.ODataModel#bindTree"));

		assert.throws(function () {
			oModel.createBindingContext();
		}, new Error("Unsupported operation: v4.ODataModel#createBindingContext"));

		assert.throws(function () {
			oModel.destroyBindingContext();
		}, new Error("Unsupported operation: v4.ODataModel#destroyBindingContext"));

		assert.throws(function () {
			oModel.getContext();
		}, new Error("Unsupported operation: v4.ODataModel#getContext"));

		assert.throws(function () {
			oModel.getObject();
		}, new Error("Unsupported operation: v4.ODataModel#getObject"));

		assert.throws(function () { //TODO implement
			oModel.getOriginalProperty();
		}, new Error("Unsupported operation: v4.ODataModel#getOriginalProperty"));

		assert.throws(function () {
			oModel.getProperty();
		}, new Error("Unsupported operation: v4.ODataModel#getProperty"));

		assert.throws(function () { //TODO implement
			oModel.isList();
		}, new Error("Unsupported operation: v4.ODataModel#isList"));

		assert.throws(function () {
			oModel.setLegacySyntax();
		}, new Error("Unsupported operation: v4.ODataModel#setLegacySyntax"));
	});

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var oModel = createModel();

		assert.throws(function () {
			oModel.attachParseError();
		}, new Error("Unsupported event 'parseError': v4.ODataModel#attachEvent"));

		assert.throws(function () {
			oModel.attachRequestCompleted();
		}, new Error("Unsupported event 'requestCompleted': v4.ODataModel#attachEvent"));

		assert.throws(function () {
			oModel.attachRequestFailed();
		}, new Error("Unsupported event 'requestFailed': v4.ODataModel#attachEvent"));

		assert.throws(function () {
			oModel.attachRequestSent();
		}, new Error("Unsupported event 'requestSent': v4.ODataModel#attachEvent"));
	});

	//*********************************************************************************************
	[{
		stack : "Failure\n    at _Helper.createError", // like Chrome
		message : "Failure\n    at _Helper.createError"
	}, {
		stack : undefined, // like IE
		message : "Failure"
	}, {
		stack : "_Helper.createError@_Helper.js", // like FF
		message : "Failure\n_Helper.createError@_Helper.js"
	}].forEach(function (oFixture) {
		QUnit.test("reportError", function (assert) {
			var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
				oError = {
					message : "Failure",
					stack : oFixture.stack
				},
				sLogMessage = "Failed to read path /Product('1')/Unknown",
				oMessageManager = sap.ui.getCore().getMessageManager(),
				oModel = createModel();

			this.oLogMock.expects("error").withExactArgs(sLogMessage, oFixture.message, sClassName)
				.twice();
			this.mock(oMessageManager).expects("addMessages")
				.once()// add each error only once to the MessageManager
				.withExactArgs(sinon.match(function (oMessage) {
					return oMessage instanceof Message
						&& oMessage.message === oError.message
						&& oMessage.processor === oModel
						&& oMessage.technical === true
						&& oMessage.type === "Error";
				}));

			// code under test
			oModel.reportError(sLogMessage, sClassName, oError);
			oModel.reportError(sLogMessage, sClassName, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oModel = createModel(),
			oModelPrototypeMock = this.mock(Model.prototype);

		oModelPrototypeMock.expects("destroy").on(oModel).withExactArgs(1, 2, 3).returns("foo");
		oModelPrototypeMock.expects("destroy").on(oModel.getMetaModel()).withExactArgs();

		//code under test
		assert.strictEqual(oModel.destroy(1, 2, 3), "foo");
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges", function (assert) {
		var oModel = createModel(),
			oResult = {};

		this.mock(oModel.oRequestor).expects("hasPendingChanges").withExactArgs().returns(oResult);

		//code under test
		assert.strictEqual(oModel.hasPendingChanges(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("getDependentBindings: binding", function (assert) {
		var oModel = createModel(),
			oParentBinding = {},
			oContext = Context.create(oModel, oParentBinding, "/absolute"),
			oBinding = new Binding(oModel, "relative", oContext);

		assert.deepEqual(oModel.getDependentBindings(oParentBinding), []);

		// to be called by V4 binding's c'tors
		oModel.bindingCreated(oBinding);
		oModel.bindingCreated(new Binding(oModel, "/somewhere/else", oContext));
		oModel.bindingCreated(
			new Binding(oModel, "unrelated", Context.create(oModel, {}, "/absolute")));
		oModel.bindingCreated(new Binding(oModel, "relative"));

		assert.deepEqual(oModel.getDependentBindings(oParentBinding), [oBinding]);

		// to be called by V4 binding's destroy() method
		oModel.bindingDestroyed(oBinding);

		assert.deepEqual(oModel.getDependentBindings(oParentBinding), []);

		assert.throws(function () {
			// missing bindingCreated() or duplicate call
			oModel.bindingDestroyed(oBinding);
		}, new Error("Unknown " + oBinding));
	});

	//*********************************************************************************************
	QUnit.test("getDependentBindings: context", function (assert) {
		var oModel = createModel(),
			oParentContext = Context.create(oModel, null, "/absolute"),
			oBinding = new Binding(oModel, "relative", oParentContext);

		assert.deepEqual(oModel.getDependentBindings(oParentContext), []);

		// to be called by V4 binding's c'tors
		oModel.bindingCreated(oBinding);

		assert.deepEqual(oModel.getDependentBindings(oParentContext), [oBinding]);

		// to be called by V4 binding's destroy() method
		oModel.bindingDestroyed(oBinding);

		assert.deepEqual(oModel.getDependentBindings(oParentContext), []);
	});
});
// TODO constructor: test that the service root URL is absolute?
// TODO read: support the mParameters context, urlParameters, filters, sorters, batchGroupId
// TODO read etc.: provide access to "abort" functionality

// oResponse.headers look like this:
//Content-Type:application/json; odata.metadata=minimal;charset=utf-8
//etag:W/"20150915102433.7994750"
//location:.../sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/EMPLOYEES('7')
//TODO can we make use of "location" header? relation to canonical URL?
// oData looks like this:
//{
//	"@odata.context" : "$metadata#EMPLOYEES",
//	"@odata.etag" : "W/\"20150915102433.7994750\"",
//}
//TODO can we make use of @odata.context in response data?
//TODO etag handling
//TODO use 'sap/ui/thirdparty/URI' for URL handling?

//TODO support "/#" syntax, e.g. "/EMPLOYEES(ID='1')/ENTRYDATE/#Type/QualifiedName"
//     do it for bindings, not as a JS API (getMetaModel().getMetaContext() etc. is already there)
