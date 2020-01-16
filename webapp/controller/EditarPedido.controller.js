/*global location*/
sap.ui.define([
	"tech/sothis/fcd/FirmarCertificado/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"tech/sothis/fcd/FirmarCertificado/model/formatter",
	"sap/m/MessageBox"
], function (
	BaseController,
	JSONModel,
	History,
	formatter,
	MessageBox
) {
	"use strict";

	return BaseController.extend("tech.sothis.fcd.FirmarCertificado.controller.EditarPedido", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});

			this.getRouter().getRoute("editarPedido").attachPatternMatched(this._onEditarPedidoMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "editarPedidoView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
		},
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var tableHeader,
				tPosicionesEditar = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && tPosicionesEditar.getBinding("items").isLengthFinal()) {
				tableHeader = this.getResourceBundle().getText("posicionesCount", [iTotalItems]);
			} else {
				tableHeader = this.getResourceBundle().getText("posiciones");
			}
			this.getModel("editarPedidoView").setProperty("/tituloTablaPosiciones", tableHeader);

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("objectView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onEditarPedidoMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = "/PedidoSet('" + sObjectId + "')";
				this._bindView(sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("editarPedidoView");
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("editarPedidoView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.Ebeln,
				sObjectName = oObject.Ebeln;

			oViewModel.setProperty("/busy", false);
			// Add the object page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("objectTitle") + " - " + sObjectName,
				icon: "sap-icon://enter-more",
				intent: "#FirmaCertificado-display&/PedidoSet/" + sObjectId + "/Editar"
			});

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));

		},

		onGuardarPress: function (oEvent) {

			var oModel = this.getModel();
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oPedido = oModel.getProperty(oBindingContext + "/");
			var oPosicionesBinding = this.byId("tPosicionesEditar").getBinding("items");
			var oPosicionesContexts = oPosicionesBinding.getContexts();
			var i;
			var aPosiciones = [];
			for (i = 0; i < oPosicionesBinding.getLength(); i++) {
				var sPosicionPath = oPosicionesContexts[i].getPath();
				var oPosicion = oModel.getProperty(sPosicionPath + "/");
				aPosiciones.push(oPosicion);
			}
			oPedido.PosicionSet = aPosiciones;

			MessageBox.show(this.getResourceBundle().getText("modificarPedidoAsk"), {
				icon: sap.m.MessageBox.Icon.WARNING,
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: function (sResult) {
					if (sResult === sap.m.MessageBox.Action.YES) {
						oModel.create("/PedidoSet", oPedido, {
							success: function (oData) {
								sap.m.MessageToast.show(this.getResourceBundle().getText("pedidoModificadoExito"));
							}.bind(this)
						});
						this.onNavBack();
					}
				}.bind(this)
			});

		},

		onCancelarPress: function (oEvent) {
			var aPaths = [this.getView().getBindingContext().getPath()];
			var oPosicionesBinding = this.byId("tPosicionesEditar").getBinding("items");
			var oPosicionesContexts = oPosicionesBinding.getContexts();
			var i;
			for (i = 0; i < oPosicionesBinding.getLength(); i++) {
				var sPosicionPath = oPosicionesContexts[i].getPath();
				aPaths.push(sPosicionPath);
			}
			this.getModel().resetChanges(aPaths);
			this.onNavBack();
		},

		onInputChange: function (oEvent) {
			var iNewParameter = oEvent.getParameters().value;
			var oModel = this.getModel();
			var oBindingContext = oEvent.getSource().getBindingContext();
			
			var sOtherProperty;
			var bIsMenge = oEvent.getSource().getId().includes("Menge");
			if(bIsMenge){
				sOtherProperty = oBindingContext + "/Netpr";
			} else {
				sOtherProperty = oBindingContext + "/Menge";
			}
			
			var sNetwrProperty = oBindingContext + "/Netwr";
			var sEbelnProperty = oBindingContext + "/Ebeln";
			var iNetwr = oModel.getProperty(sOtherProperty) * iNewParameter;

			var sPedidoNetwrProperty = "/PedidoSet('" + oModel.getProperty(sEbelnProperty) + "')/Netwr";
			var iParentNetwr = oModel.getProperty(sPedidoNetwrProperty) - oModel.getProperty(sNetwrProperty) + iNetwr;

			oModel.setProperty(sNetwrProperty, "" + iNetwr);
			oModel.setProperty(sPedidoNetwrProperty, "" + iParentNetwr);
		}

	});

});