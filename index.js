/*
	使用指南：
	HTML：	1、input表单后面需要加span标签，样式需要自己设计。
			2、input的class可以加number，cn，en，email，letter，date这些类型
			3、还支持required,min,max,pattern,minlength,maxlength这些属性
	js：    在需要验证的时候调用：$(jEle).Validate(options)
			options（一个对象）格式：
			rules:{
				required:"用户名不能为空"
				//前面的key是required,min,max,pattern,minlength,maxlength以及number，cn，en，email，letter，date
				//后面的是错误提示信息
			}
			若options为空，会有默认的提示信息。
	扩展：
	目前根据class支持的验证有：number，cn，en，email，letter，date；
	若新增，需要在oValidate里在一个属性和值
	例如："date" : ValidateDate   "date"对应class，ValidateDate是一个验证函数。
	oMessages需要新增该类型的默认提示信息。
	建议：
	对于不常用的验证类型，加pattern属性即可。
*/
;(function($){
	var oValidate = {
		"number" : ValidateNum,//数字类型
		"cn" : ValidateCn,//只支持中文
		"en" : ValidateEn,//不支持中文
		"email" : ValideEmail,//邮箱
		"letter" : ValideLetter,//只能是a-zA-Z的字母
		"date" : ValidateDate,//YYYY-MM-DD的时间类型
	}
	var oMessages = {
		"required" : "不能为空。",
		"min"	: "数值不能小于",
		"max"	: "数值不能大于",
		"pattern"	: "格式不正确。",
		"minlength"	: "字符长度不能小于",
		"maxlength"	: "字符长度不能超过",
		"number"	: "必须为数字。",
		"cn"		: "只支持中文字符。",
		"en"		: "不支持中文字符",
		"letter"	: "只支持输入a-zA-Z的字母",
		"email"	: "邮箱格式不正确",
		"date"	: "日期格式YYYY-MM-DD",
		"default"	: "格式不正确。"
	}

	//判断是否是数字
	function ValidateNum(sVal) {
		// var oReg = /^\d*$/
		var oReg = /^[-+]?\d*$/;
		if(!oReg.test(sVal)) {
			return "number";
		}
		return false;
	}

	//判断是否是中文
	function isChinese(sVal) {
		var oReg = /^[\u0391-\uFFE5]+$/;
		return oReg.test(sVal);
	}

	function ValidateEn(sVal) {
		if(!isChinese(sVal)) {
			return "en"
		}
		return false;
	}

	function ValidateCn(sVal) {
		if(isChinese(sVal)) {
			return "cn"
		}
		return false;
	}

	function ValideEmail(sVal) {
		var oReg=/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
		if(!oReg.test(sVal)) {
			return "email"
		}
		return false;
	}

	function ValideLetter(sVal) {
		var oReg = /^[a-zA-Z]+$/;
		if(!oReg.test(sVal)) {
			return "letter"
		}
		return false;
	}

	function ValidateDate(sVal) {
		var oReg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;
		if(!oReg.test(sVal)) {
			return "date"
		}
		return false;
	}

	$.fn.Validate = function(options) {
		options = options || {}
		var oRule = options.rules || {};
		var sMsg = "";
		var oEle = $(this)
		function ValidateEle() {
			var sVal = oEle.val();
			if(sVal == "") {
				if(oEle.hasClass("required") || oEle.attr("required")) {
					sMsg = oRule["required"] || oMessages["required"];
					return false;
				}
				else {
					return true;
				}
			}
			for(var k in oValidate) {
				if(oEle.hasClass(k)) {
					var sRule = oValidate[k](sVal);
					if(sRule) {
						sMsg = oRule[sRule] || oMessages[sRule] || oMessages["default"];
						return false;
					}
				}
			}
			var sMin = oEle.attr("min");
			var sMax = oEle.attr("max");
			var sMinLength = oEle.attr("minlength");
			var sMaxLength = oEle.attr("maxlength");
			if(sMin && sVal < sMin) {
				sMsg = oRule["min"] || oMessages["min"] +sMin;
				return false;
			}
			if(sMax && sVal > sMax) {
				sMsg = oRule["max"] || oMessages["max"] +sMax;
				return false;
			}
			if(sMinLength && sVal < sMinLength) {
				sMsg = oRule["minlength"] || oMessages["minlength"]+sMinLength;
				return false;
			}
			if(sMaxLength && sMaxLength > sMaxLength) {
				sMsg = oRule["maxlength"] || oMessages["maxlength"]+sMaxLength;
				return false;
			}
			var sReg = oEle.attr("pattern")
			if(sReg){
				var oReg = new RegExp(sReg);
				if(!oReg.test(sVal)) {
					sMsg = oRule["pattern"] || oMessages["pattern"];
					return false;
				}
			}
			return true;
		}

		// oEle.on("input focusout",function(){
			if(!ValidateEle()) {
				oEle.siblings("span").addClass("error").html(sMsg);
				return false;
			}
			else {
				oEle.siblings("span").removeClass("error").empty();
				return true;
			}
		// })	
	}
})(jQuery);
