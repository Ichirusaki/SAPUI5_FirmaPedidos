function initModel() {
	var sUrl = "/SGW_BASELINE/sap/opu/odata/SAP/ZUI5_FIRMACERT_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}