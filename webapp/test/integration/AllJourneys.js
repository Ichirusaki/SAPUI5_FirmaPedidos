/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"tech/sothis/fcd/FirmarCertificado/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"tech/sothis/fcd/FirmarCertificado/test/integration/pages/Worklist",
	"tech/sothis/fcd/FirmarCertificado/test/integration/pages/Object",
	"tech/sothis/fcd/FirmarCertificado/test/integration/pages/NotFound",
	"tech/sothis/fcd/FirmarCertificado/test/integration/pages/Browser",
	"tech/sothis/fcd/FirmarCertificado/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "tech.sothis.fcd.FirmarCertificado.view."
	});

	sap.ui.require([
		"tech/sothis/fcd/FirmarCertificado/test/integration/WorklistJourney",
		"tech/sothis/fcd/FirmarCertificado/test/integration/ObjectJourney",
		"tech/sothis/fcd/FirmarCertificado/test/integration/NavigationJourney",
		"tech/sothis/fcd/FirmarCertificado/test/integration/NotFoundJourney",
		"tech/sothis/fcd/FirmarCertificado/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});