
function WidgetManager(){

	this.arr = [];
	
	
	this.newWidget = function(elem, widget){
		this.arr.push({elem:elem, widget:widget});
	}
	
	this.widgetFromElem = function(elem, widgetType){
		for(var i in this.arr)
			if(this.arr[i].elem == elem && this.arr[i].widget instanceof widgetType){
				return this.arr[i].widget;
			}
		return false;
	}
	
}


/*
widget			elem
autosuggest		the page text elem
list			page container elem
grid			page container elem
contextmenu		clicked elem 		NA?
editableitem		page elem div or span
floatingcontainer	
flselectpad		clicked page elem
onoff			page elem
reorder			NA?
setdev			NA?

*/
