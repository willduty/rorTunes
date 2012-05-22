
/**
 * EditableItem 0.0
 * 2011 Will Duty
 *
 * EditableItem is freely distributable under the terms of an MIT-style license.
 *
 */



var MODE_INPUT = 1; 
var MODE_TEXTAREA = 2;
var MODE_INCLUDE_ORIGINAL_TEXT = 4;


/*
elem: the html element which will become editable 
options: bitwise values
callback: callback on user concluding editing (or clicking outside)
callbackParam: pass-through val
placeHolder: text or html to place in event of blank value
*/
function EditableItem(elem, options, callback, callbackParam, placeHolder){	
	var _this = this;
	this.elem = elem;
	this.callback = callback; 
	this.callbackParam = callbackParam;
	this.editBox = null;
	this.textAreaRows = 15;
	this.placeHolder = placeHolder;
	this.isBlank = elem.innerHTML.length ? false : true;
	
	if(typeof this.placeHolder != 'undefined' && !elem.innerHTML.length){
		this.elem.innerHTML = this.placeHolder
	}		
			
	if(typeof(options) == 'undefined')
		this.mode = MODE_INPUT;
	else
		this.mode = options;
	
	if(this.mode & MODE_INPUT){
		this.editBox = document.createElement("input");
		this.editBox.setAttribute("type", "text");
	}
	
	if(this.mode & MODE_TEXTAREA){
		this.editBox = document.createElement("div");
		var ta = document.createElement("textarea");
		ta.style.width = "95%";
		ta.setAttribute('rows', this.textAreaRows)
		
		
		if(this.mode & MODE_INCLUDE_ORIGINAL_TEXT){
			// replace brs with newlines
			ta.value = elem.innerHTML.replace(/<br>/g, "\n");
		}
		var br = document.createElement("br");
		var btnSubmit = document.createElement("span");
		btnSubmit.innerHTML = "done";
		var btnCancel = document.createElement("span");
		btnCancel.innerHTML = "cancel";		
		btnSubmit.className = "toolBtn";
		btnCancel.className = "toolBtn";
		this.editBox.appendChild(ta);
		this.editBox.appendChild(br);
		this.editBox.appendChild(btnSubmit);
		this.editBox.appendChild(btnCancel);
		
		// on submit take whatever the user typed, put it in the 
		// original element and call close
		btnSubmit.onclick = function(){
			// replace line breaks with brs
			var newText = _this.editBox.firstChild.value.replace(/\n/g, "<br>");
			_this.elem.innerHTML = newText;
			_this.callback(elem, callbackParam);
			_this.close();
		}
		btnCancel.onclick = function(){
			_this.close();
		}
	}
	
	
	// make the element 'editable' by 
	// replacing with a text input element
	elem.onclick = function(e){
		e = e ? e : window.event;
		e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
		
		// some juggling to replace 'in place'
		var parent = CBParentElement(this);
		parent.insertBefore(_this.editBox, this)
		if(_this.mode & MODE_INCLUDE_ORIGINAL_TEXT){
			_this.editBox.value = this.innerHTML;
		}	
		_this.editBox.focus();
		parent.removeChild(this);
	}
	
	
	this.editBox.onclick = function(e){
		// todo other instances of EditableItem don't close because of this
		e ? e.stopPropagation() : (window.event.cancelBubble = true); 
	}
	
	
	// check for return key if regular input text field 
	// with no explicit submit button 
	this.editBox.onkeyup = function(e){
		e = e ? e : window.event;
		if(_this.mode & MODE_INPUT){
			if(e.keyCode == 13){
				var origVal = _this.elem.innerHTML;
				_this.elem.innerHTML = _this.editBox.value;
				// if callback returns false, restore the original text
				if(false == _this.callback(_this.elem, _this.callbackParam)){
					_this.elem.innerHTML = origVal;
				}
				_this.close();
				
				// todo check if modified
			}
		}	
	}
	

	// gets value of the editable field... which may not be
	// the actual html element's innerHTML if a placeholder is in use
	this.getValue = function(){
		if(this.isBlank)
			return '';
		else
			return this.elem.innerHTML;
	}
	
	// removes the edit box and puts the original (possibly updated)
	// element back in place
	this.close = function(event){
		var parent = CBParentElement(this.editBox);
		if(parent){
			parent.insertBefore(this.elem, this.editBox)
			if(this.editBox.value == ''){
				this.isBlank = true;
			}
			this.editBox.value = "";
			parent.removeChild(this.editBox);	
		}
	}
	
	// close on outside click
	CBAddEventListener(document.body, "click", function(){_this.close();}, false);
}


