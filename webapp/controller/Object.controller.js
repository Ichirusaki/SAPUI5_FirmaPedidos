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

	return BaseController.extend("tech.sothis.fcd.FirmarCertificado.controller.Object", {

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

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
		},
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var tableHeader,
				tPosiciones = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && tPosiciones.getBinding("items").isLengthFinal()) {
				tableHeader = this.getResourceBundle().getText("posicionesCount", [iTotalItems]);
			} else {
				tableHeader = this.getResourceBundle().getText("posiciones");
			}
			this.getModel("objectView").setProperty("/tituloTablaPosiciones", tableHeader);
		},

		onUpdateAdjuntosFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var tableHeader,
				lAdjuntos = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && lAdjuntos.getBinding("items").isLengthFinal()) {
				tableHeader = this.getResourceBundle().getText("adjuntosCount", [iTotalItems]);
			} else {
				tableHeader = this.getResourceBundle().getText("adjuntos");
			}
			this.getModel("objectView").setProperty("/tituloListaAdjuntos", tableHeader);
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
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("PedidoSet", {
					Ebeln: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
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
				intent: "#FirmaCertificado-display&/PedidoSet/" + sObjectId
			});

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		onEditarPress: function (oEvent) {
			this._showEditarPedido(oEvent.getSource());
		},

		_showEditarPedido: function (oItem) {
			var oPedido = oItem.getBindingContext().getObject();
			var sEbeln = oPedido.Ebeln;

			this.getRouter().navTo("editarPedido", {
				objectId: sEbeln
			});
		},

		onRefresh: function () {
			var oTable = this.byId("tPosiciones");
			oTable.getBinding("items").refresh();
			this.getView().getElementBinding().refresh();
		},

		onFirmarPress: function (oEvent) {
			var oModel = this.getModel();
			var oBindingContext = oEvent.getSource().getBindingContext();
			var sEbeln = oModel.getProperty(oBindingContext + "/Ebeln");
			var sStatus = oModel.getProperty(oBindingContext + "/Status");
			if (sStatus === "S") {
				sap.m.MessageToast.show(this.getResourceBundle().getText("pedidoYaFirmado"));
			} else {
				MessageBox.show(this.getResourceBundle().getText("firmarPedidoAsk"), {
					icon: sap.m.MessageBox.Icon.WARNING,
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function (sResult) {
						if (sResult === sap.m.MessageBox.Action.YES) {
							oModel.callFunction("/FirmarPedido", {
								method: "GET",
								urlParameters: {
									"Ebeln": sEbeln
								},
								success: function (oData) {
									sap.m.MessageToast.show(this.getResourceBundle().getText("pedidoFirmadoExito"));
								}.bind(this)
							});
						}
					}.bind(this)
				});
			}

		},

		onBackPress: function (oEvent) {
			this.onNavBack();
		},

		onAdjuntarPress: function (oEvent) {
			if (!this._dAdjuntar) {
				this._dAdjuntar = sap.ui.xmlfragment(this.getView().getId(), "tech.sothis.fcd.FirmarCertificado.view.fragment.Adjuntar", this);
				this.getView().addDependent(this._dAdjuntar);
				this._dAdjuntar.setModel(this.getModel());
			}

			this._dAdjuntar.open();

		},

		onCerrarDialogPress: function (oEvent) {
			var oFileUploader = this.getView().byId("fileUploader");
			oFileUploader.destroyHeaderParameters();
			oFileUploader.clear();
			oFileUploader.setValueState(sap.ui.core.ValueState.None);

			if (this._dAdjuntar) {
				this._dAdjuntar.close();
			}
		},

		onOkDialogPress: function (oEvent) {
			var oFileUploader = this.getView().byId("fileUploader");
			this._prepararCabeceras(oFileUploader);
			oFileUploader.upload();
		},

		_prepararCabeceras: function (oFileUploader) {
			//Reseteamos cabeceras para no enviar duplicadas
			oFileUploader.destroyHeaderParameters();

			// URL
			var sUploadUrl = this.getModel().sServiceUrl + "/PedidoSet('" + this.getView().getBindingContext().getObject().Ebeln +
				"')/ArchivoSet";
			oFileUploader.setUploadUrl(sUploadUrl);
			// TOKENS
			var oHeaderSlug = new sap.ui.unified.FileUploaderParameter({
				name: "slug",
				value: encodeURIComponent(oFileUploader.getValue())
			});
			oFileUploader.addHeaderParameter(oHeaderSlug);
			var oCSRFHeaderToken = new sap.ui.unified.FileUploaderParameter({
				name: "x-csrf-token",
				value: this.getModel().getSecurityToken()
			});
			oFileUploader.addHeaderParameter(oCSRFHeaderToken);
		},

		onFileUploadComplete: function (oEvent) {
			var iStatus = oEvent.getParameter("status");
			if (iStatus !== 200) {
				sap.m.MessageToast.show(this.getResourceBundle().getText("archivoNoSubido"));
			} else {
				sap.m.MessageToast.show(this.getResourceBundle().getText("archivoSubido"));
				var oList = this.byId("lAdjuntos");
				oList.getBinding("items").refresh();
			}

		},

		onFilenameLengthExceed: function (oEvent) {
			var oUploader = this.byId("fileUploader");
			oUploader.setValueState(sap.ui.core.ValueState.Error);
			oUploader.setValueStateText(this.getResourceBundle().getText("tamNombreExcedido"));
		},

		onFileSizeExceed: function (oEvent) {
			var oUploader = this.byId("fileUploader");
			oUploader.setValueState(sap.ui.core.ValueState.Error);
			oUploader.setValueStateText(this.getResourceBundle().getText("pesoExcedido"));
		},

		onTypeMissmatch: function (oEvent) {
			var oUploader = this.byId("fileUploader");
			oUploader.setValueState(sap.ui.core.ValueState.Error);
			oUploader.setValueStateText(this.getResourceBundle().getText("soloPDF"));
		},

		onFileAllowed: function (oEvent) {
			var oUploader = this.byId("fileUploader");
			oUploader.setValueState(sap.ui.core.ValueState.None);
		},

		onFileDeleted: function (oEvent) {

			var sAdjuntoPath = oEvent.getParameters("listItem").listItem.getBindingContext().getPath();
			var oList = this.byId("lAdjuntos");

			MessageBox.show(this.getResourceBundle().getText("borrarAdjuntoAsk"), {
				icon: sap.m.MessageBox.Icon.WARNING,
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: function (sResult) {
					if (sResult === sap.m.MessageBox.Action.YES) {
						this.getModel().remove(sAdjuntoPath, {
							success: function () {
								sap.m.MessageToast.show(this.getResourceBundle().getText("adjuntoBorrado"));
								oList.getBinding("items").refresh();
							}.bind(this)
						});
					}
				}.bind(this)
			});
		}
	});

});