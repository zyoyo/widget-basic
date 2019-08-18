/*
	使用指南
	初始化表格：dataTable.init(options);
	var options = 
		{
			el:"#dataTable",//外层元素
			multiselect:true,//是否支持多选
			pageNum:10,//分页数，若该值为0，则不分页
			columns:[//有几列
				{name:"name",title:"名称"}, //name的值,需要和data中每一条数据的key相对应,title表头名列名称
				{name:"city",title:"城市"},
				{name:"postcode",title:"邮编",width:200}//width：可自己设置宽度
			],
			operation:[//操作列，可以对每一行进行操作
				{name:"edit",title:"编辑",action:editUser},//action：点击事件
				{name:"remove",title:"删除",action:removeUser},
				{name:"download",title:"下载",action:downLoad,format:downloadFormat}//format：操作列的格式
			],
			data:[]//tbody数据
		}
		通常数据都是后加载的，可以通过下面的方式进行展示表格数据
	dataTable.setData(aData);//加载数据
*/
;(function(){

	var dataTable = {
		init: function(options) {
			this.parentNode = $(options.el);
			this.fTable = new createTable(options);
			
			this.fTable.init(this.parentNode);
			
		},
		parentNode: null,
		fTable: null,
		setData: function(aData) {

			this.fTable.setData(aData);
			if(options.pageNum) {
				this.fTable.createPage();
			}
		},
		getSelectData: function() {
			var aData = []
			$.each(this.fTable.jTbody.find("input:checked"),function(i,oEle){
				aData.push($(oEle).closest("tr").data("user"));
			});
			return aData;
		},
		destory: function() {
			this.parentNode.empty();
		}
	}
	//生成表格
	function createTable(options) {
		this.jTable = jQuery('<table class="table table-striped"></table>');
		this.jThead = jQuery('<thead></thead>');
		this.jTbody = jQuery('<tbody></tbody>');
		this.options = options;
		this.parentNode = $(options.el);
		this.checkedNum = 0;
		this.total = 0;
		this.pageNum = options.pageNum || 0;
		this.currentPage = 1;
		this.data = options.data || [];
		this.init = function(jParent) {	
			this.createThead();
			if(this.data.length) {
				this.createTbody(this.data);
			}
			this.jTable.append(this.jThead);
			this.jTable.append(this.jTbody);
			
			jParent.append(this.jTable);
		}
		this.setData = function(aData) {
			this.data = aData;
			this.total = aData.length;
			this.createTbody(aData);
		}
		//显示的数据
		this.filterData = function(){
			return this.data.slice(this.getStartItem(),this.getEndItem());
		}
		this.refresh = function() {
			this.jThead.find("input").prop("checked",false);
			this.createTbody(this.data);
		}
		//一共有几页
		this.getPages = function() {
			return Math.ceil(this.total/this.pageNum);
		}
		//当前页显示的数据，开始的数据是第几条
		this.getStartItem = function() {
			return (this.currentPage-1)*this.pageNum;
		}
		//当前页面显示的数据，结束的数据是第几条
		this.getEndItem = function() {
			return (this.currentPage == this.getPages()) ? this.total:this.currentPage*this.pageNum;
		}
		
	}

	//创建thead
	createTable.prototype.createThead = function(){
		var jTr = jQuery('<tr></tr>');
			var aCol = this.options.columns;
			if(this.options.multiselect) {
				var jTh = jQuery('<th width="80px"></th>')
				jTh.append(this.appendCheckbox(true));
				jTh.append("全选");
				jTr.append(jTh);
			}
			
			for(var i = 0; i < aCol.length; i++) {
				var oCol = aCol[i];
				var jTh = jQuery('<th>'+ oCol.title +'</th>');
				if(oCol.width) {
					jTh.attr("width",oCol.width+"px");
				}
				jTr.append(jTh);
			}
			if(this.options.operation) {
				jTr.append(jQuery('<th>操作</th>'));
			}
			this.jThead.append(jTr);
	}
	//创建tbody
	createTable.prototype.createTbody = function (aData) {

		if(this.pageNum) {
			aData = this.filterData(aData);
		}
		this.jTbody.empty();
		var bMulti = this.options.multiselect;

		for(var i = 0; i < aData.length; i++) {
			var jTr = jQuery('<tr></tr>');
			if(bMulti) {
				var jTd = jQuery('<td></td>');
				jTd.append(this.appendCheckbox());
				jTr.append(jTd);
			}
			jTr.data("user",aData[i]);
			for(var j = 0; j < options.columns.length; j++) {
				var sKey = options.columns[j].name;
				var jTd = jQuery('<td>'+ aData[i][sKey]+'</td>');
				jTr.append(jTd);
			}
			if(options.operation) {
				this.appendOperation(jTr);
			}
			this.jTbody.append(jTr);
		}			
	}

	//input checkbox 
	createTable.prototype.appendCheckbox = function (bMultiAll) {
		var fCallBack = bMultiAll ? this.checkAll : this.checkSingle;
		var jInput = jQuery('<input type="checkbox">');
		
		var that = this;
		jInput.on("click",function(event){
			fCallBack(that,$(this));
			return;
		});
		return jInput;
	}
	//thead的全选事件
	createTable.prototype.checkAll = function (that) {
		debugger;
		var bChecked = that.jThead.find("input").prop("checked");
		
		that.jTable.find("input").prop("checked",bChecked);
		that.checkedNum = (bChecked) ? that.filterData().length : 0;
		that.createPageCheckedInfo();
	}
	//tbody的多选框点击事件
	createTable.prototype.checkSingle = function (that,ele) {
		var jInput = that.jThead.find("input");
		var bChecked = (that.jTbody.find("input:checked").length == that.jTbody.find("input").length)
		jInput.prop("checked",bChecked);
		
		if(ele.prop("checked")) {
			that.checkedNum = (that.total == that.checkedNum) ?that.total : ++that.checkedNum;
		}
		else {
			that.checkedNum = (that.total <=0) ? 0 : --that.checkedNum;
		}
		that.createPageCheckedInfo();
	}
	//操作列
	createTable.prototype.appendOperation = function (jTr){
		var jTd = jQuery('<td></td>');
		for(var k = 0; k< this.options.operation.length; k++) {
			var oOperate = this.options.operation[k];
			
			this.addIcon(oOperate,jTr,jTd);
		}
		jTr.append(jTd);
	}
	//操作列的图标
	createTable.prototype.addIcon = function (oOperate,jTr,jTd){
		var jIcon;
		if(oOperate.format) {
			jIcon = jQuery(oOperate.format());
		}
		else {
			jIcon = jQuery("<span class='glyphicon'></span>");
			var sClassName =  "";
			switch (oOperate.name) {
				case "edit" :
					sClassName = "glyphicon-edit";
					break;
				case "remove" :
					sClassName =  "glyphicon-remove";
					break;
				default:
					break;
			}
			jIcon.addClass(sClassName);
		}
		jIcon.attr("title",oOperate.title||"");
		if(oOperate.action) {
			jIcon.on("click",function(){
				oOperate.action(jTr.data('user'));
				return false;
			});
		}
		jTd.append(jIcon);
	}
	//分页
	createTable.prototype.createPage= function(flag) {
		var jToolbar = jQuery('<div class="footer-toolbar"></div>');

		var jChangeSize = jQuery('<div class="change-size"></div>');
		var jSelect = jQuery('<select></select>');
		for(var i = 10; i <= 100; i=i+10) {
			jSelect.append('<option>'+i+'</option>');
		}
		jSelect.val(this.pageNum||10);
		var that = this;
		jSelect.on("change",function(){
			that.pageNum = $(this).val();
			that.refresh();
			that.createPageInfo(jToolbar);
			that.createPageNatoin(jToolbar);
		})
		jChangeSize.append(jSelect);

		jToolbar.append(jChangeSize);

		this.createPageCheckedInfo(jToolbar);
		this.createPageInfo(jToolbar);
		this.createPageNatoin(jToolbar);
		this.parentNode.append(jToolbar);
	}
	createTable.prototype.createPageCheckedInfo = function(jToolbar) {		
		
		var jCheckedInfo = $('.checked-info');
		if($('.checked-info').length) {
			jCheckedInfo = $('.checked-info');
		}
		else {
			jCheckedInfo = jQuery('<div class="toolbar-info checked-info"></div>');
			jToolbar.append(jCheckedInfo);
		}
		jCheckedInfo.html('已选'+this.checkedNum+'条');

	}
	createTable.prototype.createPageInfo = function(jToolbar) {

		var jPageInfo;
		if($('.page-info').length){
			jPageInfo = $('.page-info');
		}
		else {
			jPageInfo = jQuery('<div class="toolbar-info page-info"></div>');
			jToolbar.append(jPageInfo);
		}
		jPageInfo.html('此页显示 '+(this.getStartItem()+1)+'-'+this.getEndItem()+'<span class="page-info-totals"> 共'+this.total+'条</span>');		
	}
	createTable.prototype.createPageNatoin =function(jToolbar) {
		$('nav.page').remove();
		var jPageNation = jQuery('<nav aria-label="Page navigation" class="page"></nav>');
		var jPageUl = jQuery('<ul class="pagination"></ul>')
		var jPrevLi = jQuery('<li><a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>');
		var jNextLi = jQuery('<li><a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>');

		jPageUl.append(jPrevLi);
		for(var j = 1 ;j <= this.getPages(); j++) {
			var jLi = jQuery('<li><a href="#">'+j+'</a></li>');
			if(j == this.currentPage) {
				jLi.addClass("active");
			}
			var that = this;
			(function(j){
				jLi.on("click",function(){
					that.currentPage = j;
					changePage(j,$(this));
					return false;
				})
			})(j);
			jPageUl.append(jLi);
		}

		function activeLi(jEle) {
			jEle.addClass("active").siblings("li").removeClass("active");
		}
		function disabledLi() {
			if(that.currentPage == 1) {
				jPrevLi.addClass("disabled");
			}
			else {
				jPrevLi.removeClass("disabled")
			}
			
			if(that.currentPage == that.getPages()) {
				jNextLi.addClass("disabled")
			}
			else {
				jNextLi.removeClass("disabled");
			}
		}
		jPrevLi.on("click",function(){
			if($(this).hasClass("disabled")){
				return false;
			}
			changePage(--that.currentPage,$("li:eq("+that.currentPage+")"));
			return false;
		});
		jNextLi.on("click",function(){
			if($(this).hasClass("disabled")){
				return false;
			}
			changePage(++that.currentPage,$("li:eq("+that.currentPage+")"));
			return false;
		})
		function changePage(index,jEle) {
			that.currentPage = index;
			activeLi(jEle);
			disabledLi();
			that.refresh();
			that.createPageInfo();
		}
		disabledLi();
		jPageUl.append(jNextLi);
		jPageNation.append(jPageUl);
		jToolbar.append(jPageNation);
	}
	window.dataTable = dataTable;
})(window);