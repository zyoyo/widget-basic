/*
	使用指南：
	HTML：	1、input表单后面需要加span标签，样式需要自己设计。
			2、input的class可以加number，cn，en，email，letter，date这些类型
			3、还支持required,min,max,pattern,minlength,maxlength这些属性
	js：    $(jEle).Validate(option)
			option（一个对象）格式：
			{
				required:"用户名不能为空"
				//前面的key是required,min,max,pattern,minlength,maxlength以及number，cn，en，email，letter，date
				//后面的是错误提示信息
			}
			若option为空，会有默认的提示信息。
	扩展：
	目前根据class支持的验证有：number，cn，en，email，letter，date；
	若新增，需要在oValidate里在一个属性和值
	例如："date" : ValidateDate   "date"对应class，ValidateDate是一个验证函数。
	建议：
	对于不常用的验证类型，加pattern属性即可。
*/
var oValidate = {
	"number" : ValidateNum,//数字类型
	"cn" : ValidateCn,//只支持中文
	"en" : ValidateEn,//不支持中文
	"email" : ValideEmail,//邮箱
	"letter" : ValideLetter,//只能是a-zA-Z的字母
	"date" : ValidateDate,//YYYY-MM-DD的时间类型
}

//判断是否是数字
function ValidateNum(sVal) {
	var sMsg = "";
	// var oReg = /^\d*$/
	var oReg = /^[-+]?\d*$/;
	if(!oReg.test(sVal)) {
		return "必须为数字。"
	}
	return sMsg;
}

//判断是否是中文
function isChinese(sVal) {
	var oReg = /^[\u0391-\uFFE5]+$/;
	return oReg.test(sVal);
}

function ValidateEn(sVal) {
	var sMsg = ""
	if(!isChinese(sVal)) {
		sMsg = "不支持中文字符。"
	}
	return sMsg;
}

function ValidateCn(sVal) {
	var sMsg = ""
	if(isChinese(sVal)) {
		sMsg = "只支持中文字符。"
	}
	return sMsg;
}

function ValideEmail(sVal) {
	var sMsg = "";
	var oReg=/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
	if(!oReg.test(sVal)) {
		sMsg = "邮箱格式不正确"
	}
}

function ValideLetter(sVal) {
	var sMsg = "";
	var oReg = /^[a-zA-Z]+$/;
	if(!oReg.test(sVal)) {
		sMsg = "只支持输入a-zA-Z的字母";
	}
	return sMsg;
}

function ValidateDate(sVal) {
	var sMsg = "";
	var oReg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;
	if(!oReg.test(sVal)) {
		sMsg = "日期格式YYYY-MM-DD";
	}
	return sMsg;
}

$.fn.Validate = function(oOption) {
	oOption = oOption || {};
	var sMsg = "";
	var oEle = $(this)
	function ValidateEle() {
		var sVal = oEle.val();
		if(oEle.hasClass("required") || oEle.attr("required")) {
			if(sVal== "") {
				sMsg = oOption["required"] || "不能为空。"
				return false;
			}
		}
		for(var k in oValidate) {
			if(oEle.hasClass(k)) {
				var sValidate = oValidate[k](sVal);
				if(sValidate) {
					sMsg = oOption[k] || sValidate || "格式不正确。";
					return false;
				}
			}
		}
		var sMin = oEle.attr("min");
		var sMax = oEle.attr("max");
		var sMinLength = oEle.attr("minlength");
		var sMaxLength = oEle.attr("maxlength");
		if(sMin && sVal < sMin) {
			sMsg = oOption["min"] || "数值不能小于" +sMin;
			return false;
		}
		if(sMax && sVal > sMax) {
			sMsg = oOption["max"] || "数值不能大于" +sMax;
			return false;
		}
		if(sMinLength && sVal < sMinLength) {
			sMsg = oOption["minlength"] || "字符长度不能小于"+sMinLength;
			return false;
		}
		if(sMaxLength && sMaxLength > sMaxLength) {
			sMsg = oOption["maxlength"] || "字符长度不能超过"+sMaxLength;
			return false;
		}
		var sReg = oEle.attr("pattern")
		if(sReg){
			var oReg = new RegExp(sReg);
			if(!oReg.test(sVal)) {
				sMsg = oOption["pattern"] || "格式不正确。"
				return false;
			}
		}
		return true;
	}
	oEle.on("input focusout",function(){
		if(!ValidateEle()) {
			oEle.siblings("span").addClass("error").html(sMsg);
		}
		else {
			oEle.siblings("span").removeClass("error").empty();
		}
	})	
}