sap.ui.define([
	"tech/sothis/fcd/FirmarCertificado/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"tech/sothis/fcd/FirmarCertificado/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("tech.sothis.fcd.FirmarCertificado.controller.SmartTable", {

		formatter: formatter,
		
		onInit: function () {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("smartTable");
				// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			
			// Model used to manipulate control states
			oViewModel = new JSONModel({
				smartTableTitle: this.getResourceBundle().getText("smartTable"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("smartTable")),
				shareOnJamTitle: this.getResourceBundle().getText("smartTableTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "smartTableView");
		
			var oFilterBar = this.getView().byId("smartFilterBar");
				this._oFilterBar = oFilterBar;

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},
		
		onBackPress: function (oEvent) {
			this.onNavBack();
		},
		
		onBeforeRebindTable: function (oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			var oFirmaCheck = this._oFilterBar.getControlByKey("Status");
			var sChecked = oFirmaCheck.getSelected();
			var newFilter = new Filter("Status", FilterOperator.EQ, sChecked ? "S" : "N" );
			mBindingParams.filters.push(newFilter);
		}
	});
});