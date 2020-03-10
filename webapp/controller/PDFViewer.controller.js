sap.ui.define([
	"tech/sothis/fcd/FirmarCertificado/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"tech/sothis/fcd/FirmarCertificado/model/formatter"
], function (
	BaseController,
	JSONModel,
	History,
	formatter
) {
	"use strict";

	return BaseController.extend("tech.sothis.fcd.FirmarCertificado.controller.PDFViewer", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute("pdfViewer").attachPatternMatched(this._onPDFMatched, this);
		},

		_onPDFMatched: function (oEvent) {
			var sArcdocid = oEvent.getParameter("arguments").Arcdocid;
			var sArchivid = oEvent.getParameter("arguments").Archivid;
			var sArobject = oEvent.getParameter("arguments").Arobject;
			var sEbeln = oEvent.getParameter("arguments").Ebeln;
			var sSapObject = oEvent.getParameter("arguments").SapObject;

			this.getModel().metadataLoaded().then(() => {
				var sObjectPath = this.getModel().createKey("ArchivoSet", {
					Arcdocid: sArcdocid,
					Archivid: sArchivid,
					Arobject: sArobject,
					Ebeln: sEbeln,
					SapObject: sSapObject
				});
				this._bindPDFViewer("/" + sObjectPath + "/$value");
			});
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindPDFViewer: function (sObjectPath) {
			this.byId("oPdfViewer").setSource(this.getModel().sServiceUrl + sObjectPath);
		}
	});

});