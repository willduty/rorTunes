/*

DESCRIPTION:
creates an on/off button out of any element(s) on a page. typically a span or div is appropriate. 
Buttons can be grouped in to exclusive one-button-on only groupings similar to radio buttons.


USAGE:
element must have following attributes
onOff="off" name=onOffButton 

example html element to be a button:
<span onOff="off" name=onOffButton id=filterShowInactive><span>include to-do</span></span>

When page loads iterate through items with name=onOffButton in document and create object for each

	var buttons = document.getElementsByName("onOffButton");
	for(i in buttons){
		var button = new onOffButton(buttons[i], "someclass", "someclass");
		
		//add callback if callback is desired
		var button = new onOffButton(someElement, "someclass", "someclass");
		button.callback = myCallbackFunc;
	}
	
To create a group of buttons in which only one can be on, pass an array off the set of onOffButtons. 
The others will be turned off automatically

html example of a button group:

<span onOff="off" name=onOffButton id=viewSetsByGroup btnGroup=view callback=showSetsByGroup><span>sets by group</span></span>
<span onOff="off" name=onOffButton id=viewSets btnGroup=view callback=showAllSets><span>all sets</span></span>
<span onOff="off" name=onOffButton id=viewGroups btnGroup=view callback=showAllGroups><span>groups</span></span>

*/


function ButtonManager(){

}



// get all buttons: elems on page with name="onOffButton" 
ButtonManager.prototype.getAllPageButtons = function(){
	if (navigator.appVersion.indexOf("MSIE") != -1){
		buttons = new Array();
		CBGetElementsByName("onOffButton", null, buttons);
	}
	else
		buttons = document.getElementsByName("onOffButton");
		
	return buttons;
}



// utility function. sets up all the buttons on a page
// arrOnBtns: array of ids of buttons on the page which 
// should be on (which may differ from the ones in the 
// actual html when restoring page state)

ButtonManager.prototype.setUpButtons = function(arrOnBtns){
	// get the button elements (having name=onOffButton)
	var buttons = this.getAllPageButtons();

	
	// the on/off states of buttons should be specified in the html
	// but if arrOnBtns is provided reset html attributes
	if(arrOnBtns){
		for(var i in arrOnBtns){
			var btn = document.getElementById(arrOnBtns[i]);
			
			// if button is part of a group first set the whole group to "off"
			var group = btn.getAttribute("btnGroup");
			if(group){
				for(var j=0; j<buttons.length; j++){
					if(buttons[j].getAttribute("btnGroup") == group){
						buttons[j].setAttribute("onOff", "off"); 
					}
				}
			}
			// set the specified button to "on"
			btn.setAttribute("onOff", "on");
		}
	}
	
	var arrGroups = new Array();	
	for(i=0; i<buttons.length; i++){
		
		// create the button obj
		var btn = new onOffButton(buttons[i], "onOffBtnOn", "onOffBtnOff");
		
		// organize all grouped buttons into assoc array arrGroups where 
		// the key is a button group name and the value is the array of button objects	
		if(buttons[i].attributes['btnGroup']){
			var groupName = buttons[i].getAttribute('btnGroup');
			if(arrGroups[groupName] == null){
				arrGroups[groupName] = new Array();
			}
			arrGroups[groupName].push(btn);
		}
	}
		
	// go through each button group array in arrGroups and set them up as interdependent
	var arrGroupedBtns = new Array();
	var callback = null;
	for(i in arrGroups){
		var arrGroupedBtns = arrGroups[i];
		for(i=0; i<arrGroupedBtns.length; i++){
			arrGroupedBtns[i].addInterdependentButtonArray(arrGroupedBtns); // todo is this right for single buttons?
			if(arrGroupedBtns[i].isOn())
				callback = arrGroupedBtns[i].callback;
		}
		
		// TODO GET RID OF THIS
		if(callback){
			callback();
		}
	}
	
}



ButtonManager.prototype.getSelectedButtonFromGroup = function(groupName){
	var buttons = new Array();
	CBGetElementsByName("onOffButton", document.body, buttons);
	for(var i in buttons){
		if(buttons[i].getAttribute("btnGroup") == groupName && buttons[i].getAttribute("onOff") == "on")
			return buttons[i].id; 
	}
}




function onOffButton(elem, onClass, offClass){ // todo get rid of class params and put in style sheet

	var _this = this;
	this.elem = elem;
	this.onClass = onClass;
	this.offClass = offClass;
	
	elem.className = (elem.getAttribute("onOff") == "on") ? onClass : offClass;
	elem.style.cursor = "pointer";
	CBDisableSelect(elem);
	
	this.interdependentArr = new Array();
	
	// set up callback. callback has to really exist or js will throw 
	this.callback = null;
	var callbackName = this.elem.getAttribute('callback');
	try{
		if(callbackName)
			this.callback = eval(callbackName);
	}
	catch(e){
		alert(e)
	}
	
	this.isOn = function(){
		return this.elem.getAttribute("onOff") == "on" 
	}
	
	elem.onclick = function(event){_this.switchState(event);}
	this.switchState = function(event){
		
		// get the clicked button's state
		var onOff = this.elem.getAttribute("onOff");
		
		// if it's on and is part of a group do nothing
		if(onOff == "on" && this.interdependentArr.length)
			return;
		
		// otherwise, switch to opposite button state
		onOff = (onOff == "off") ? "on" : "off";
		this.elem.setAttribute("onOff", onOff);
		this.elem.className = (onOff == "on") ? onClass  : offClass;
		
		// if it's a group button and just switched on, turn off other on button
		if(this.interdependentArr.length && onOff == "on"){
			for(i=0; i<this.interdependentArr.length; i++){		
				if(this.interdependentArr[i] != this){
					this.interdependentArr[i].switchOff();
				}
			}
		}
		
		// callback function if there is one
		if(this.callback)
			this.callback(this.elem, event);
	}
	
	// private func used internally only
	this.switchOff = function(){
		this.elem.setAttribute("onOff", "off");
		this.elem.className = this.offClass;
	}
	
	// when creating a group add array of all buttons
	this.addInterdependentButtonArray = function(arr){
		this.interdependentArr = arr;
	}
}

