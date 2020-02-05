sap.ui.define([
	] , function () {
		"use strict";

		return {

			/**
			 * Rounds the number unit value to 2 digits
			 * @public
			 * @param {string} sValue the number string to be rounded
			 * @returns {string} sValue with 2 digits rounded
			 */
			numberUnit : function (sValue) {
				return sValue ? parseFloat(sValue).toFixed(2) : "";
			},
			
			tooltipIcono : function (sValue) {
				var sEstado = this.getResourceBundle().getText("noFirmado");
				
				switch(sValue) {
					case "P":
						sEstado = this.getResourceBundle().getText("firmaEnProceso");
    					break;
    				case "E":
						sEstado = this.getResourceBundle().getText("errorFirma");
    					break;
    				case "S":
						sEstado = this.getResourceBundle().getText("firmado");
    					break;
				}
				
				return sEstado;
			},
			
			colorIcono : function (sValue) {
				var sColor = "";
				
				switch(sValue) {
					case "P":
						sColor = "#FF6600";
    					break;
    				case "E":
						sColor = "#BB0000";
    					break;
    				case "S":
						sColor = "#009900";
    					break;
				}
				
				return sColor;
			},
			
			statusColor : function (sValue) {
				var sStatus = "None";
				
				switch(sValue) {
					case "P":
						sStatus = "Warning";
    					break;
    				case "E":
						sStatus = "Error";
    					break;
    				case "S":
						sStatus = "Success";
    					break;
				}
				
				return sStatus;
			},
			
			pesoArchivo : function (iPeso) {
				var medidas = ["B", "KB", "MB"];
				var medidaIndex = 0;
				var iNewPeso = iPeso;
				while(iNewPeso > 1024) {
					iNewPeso = iNewPeso / 1024;
					medidaIndex = medidaIndex + 1;
				}
				return iNewPeso.toFixed(2) + " " + medidas[medidaIndex];
			}
		};

	}
);