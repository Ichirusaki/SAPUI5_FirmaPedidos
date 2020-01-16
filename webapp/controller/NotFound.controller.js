sap.ui.define([
		"tech/sothis/fcd/FirmarCertificado/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("tech.sothis.fcd.FirmarCertificado.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);