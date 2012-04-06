


var bullet = "&#8226;";


// common functions for tunesPHP





// called by any page performing a write to the db
// sets up url to go to actions.php page. 
// "action" the action name 
// "retPage" the page to return to (usually the current one)
// subsequent params must be in pairs and be key/value pairs

// any page using this function must implement getReturnPageParams()
//  which returns an array of strings of form "key=value"
// 	or an empty array if there are no return params
//  which will be appended to the retPage after action page is done

function doAction(action){
	var paramsArr = new Array();
	
	// action
	var pair = "action=" + action;
	paramsArr.push(pair);
	
	// return page params
	try{
		var arr = getReturnPageParams();
	}
	catch(e){
		alert("ErrMsg: "+ e.message)
		return;
	}
	
	var retPage = (typeof(gRetPage) != 'undefined' ? gRetPage : getCurrentPage());
	paramsArr.push("retPage=" + escape(retPage + "?" + arr.join("&")));
	
	// arguments
	for(i=1; ; i++){
		if(i>=arguments.length)
			break;
		var key = arguments[i];
		var value = arguments[i+1];
		paramsArr.push(key +"="+ value);
		i++;
	}
	var loc = "/tune/add?" + paramsArr.join("&");

	alert(loc);
	//location = loc;
}


// gets the filename (no path) of the current page
function getCurrentPage(){
	var loc = location.toString().split("?")[0];
	if(loc.lastIndexOf("/") == loc.length - 1)
		loc = loc.substring(0, loc.lastIndexOf("/"));
	return loc.substring(loc.lastIndexOf("/") + 1);
}


// get a value by name from the query string in the url
// returns: the value as string or
// an empty string
// or null if the key is not found
function getRequestParam(paramName){
	var queryString = location.search.substring(1);
	var params = queryString.split("&");
	for(i in params){
		if(params[i].split("=")[0] == paramName){
			return params[i].split("=")[1];
		}
	}
	return null;
}


function getAllRequestParams(){
	var queryString = location.search.substring(1);
	var params = queryString.split("&");
	var arr = new Array();
	for(var i in params){
		arr.push(params[i]);
	}
	
	return arr;
}



function typeIdFromName(name){
	if(typeof(name) == 'undefined')
		return null;
	for(var i in typesArr){
		if(name.toLowerCase() == typesArr[i].title.toLowerCase())
			return typesArr[i].id;
	}
	return null;
}

function keyIdFromName(name){
	if(typeof(name) == 'undefined')
		return null;
	for(var i in keysArr){
		if(name.toLowerCase() == keysArr[i].title.toLowerCase())
			return keysArr[i].id;
	}
	return null;
}





function getPageSettings(){
	alert(getCurrentPage())
}


function validateTuneTitle(str){
	str = str.replace(/^\s+|\s+$/g,"");
	if(str.length == 0)
		return null;

	if(str.length > 255)
		return null;
	// todo, check for invalid chars
		
	return str;
}




// TOOL LAYOUT FUNCTIONS

// tool html setup
// for each tool button/tool combination:
// tool button elements must have attributes: 
//		name=toolButton 
//		tool=[id of tool element] 
// element containing tool (div, table, etc) must have attributes: 
//		id=[whatever] 
//		clearOnCancel  (if desired)
//		name=toolContainer 
//		style="display:none;"
// cancel button must have 
//		name=toolCancel


// todo rename these "toolControls" so as to distinguish from onOffButtons



function setUpToolSwitches(){
	$('[name=toolButton]').each(function(){
		$(this).get(0).onselectstart = function(){return false;}
		$(this).click(function(){return switchToolArea($(this).get(0));})
		$(document).find('#'+$(this).attr('tool')+' [name=toolCancel]').click(function(){
			closeTool($(this).parents('[name=toolContainer]').get(0));
		})
	})
	hideAllTools();
}

function switchToolArea(btn){
		
	var onBtnClass = "toolBtnOn";
	var offBtnClass = "toolBtnOff";
	// todo if btn is already on, hide the tool and return

	var toolElem = document.getElementById(btn.getAttribute("tool"));
	
	if(btn.className == onBtnClass){
		toolElem.style.display = "none";
		btn.className = offBtnClass;
		return;
	}

	var toolButtons = document.getElementsByName("toolButton");
	for(i=0; i<toolButtons.length; i++){
		toolButtons[i].className = (toolButtons[i] == btn) ? onBtnClass : offBtnClass;
	}
	
	hideAllTools();

	// full page tool
	if(btn.getAttribute("fullPageTool") != null){
		expandToolAnim(toolElem);
	}
	toolElem.style.display = "";
	return false;
}

var gAnimStep = 7;
function expandToolAnim(toolElem, fillToElem, posTool, step){

	if(typeof(fillToElem) == 'undefined')
		fillToElem = document.getElementById("maintable");
	
	var posFillTo = new objPos(fillToElem);
	
	// first time thru func set values for animation
	if(typeof(step) == 'undefined'){
		step = 1;
		posTool = new objPos(CBParentElement(toolElem));
		
		$(toolElem).css({position:"absolute", display:'', 
			left:posTool.left, top:posTool.top, 
			width: CBParentElement(toolElem).offsetWidth, 
			height: CBParentElement(toolElem).offsetHeight})
		
	}
	
	// do animation step
	$(toolElem).css({
		opacity: step/gAnimStep,
		width: posTool.width + Math.round((posFillTo.width - posTool.width) * step/gAnimStep),
		height: posTool.height + Math.round((posFillTo.height - posTool.height) * step/gAnimStep),
		left: posTool.left - Math.round((posTool.left - posFillTo.left) * step/gAnimStep),
		top: posTool.top - Math.round((posTool.top - posFillTo.top) * step/gAnimStep)})
	
	// if step is 1 we're done, else do again
	if(step == gAnimStep)
		return;
	step++;
	
	// continue through animation until step == 1
	setTimeout(function(){expandToolAnim(toolElem, fillToElem, posTool, step)}, 20);
	
}


function switchOnToolByButton(id){
	var btn = (typeof(id) == 'string') ? document.getElementById(id) : id;
	if(document.getElementById(btn.getAttribute("tool")).style.display == "none")
		switchToolArea(btn);
}

function switchOffToolByButton(id){
	var btn = (typeof(id) == 'string') ? document.getElementById(id) : id;
	if(document.getElementById(btn.getAttribute("tool")).style.display == "")
		switchToolArea(btn);
}


function closeTool(toolId){
	var tool = (typeof(toolId) == 'string') ? 
		document.getElementById(toolId) : toolId;
	
	funcElementsByAttribute("clearOnCancel", tool, 
		function(elem){
			elem.innerHTML = "";
			elem.value = "";
			if(elem.tagName == "select"){
				elem.options.length = 0;
			}
			// todo clear onoff button
		});
	
	
	funcElementsByAttribute("removeOnCancel", tool, 
		function(elem){document.removeChild(elem);});
	
	funcElementsByAttribute("hideOnCancel", tool, 
		function(elem){elem.style.display = "none";});
			
	funcElementsByAttribute("tool", document.body, switchOffToolByButton);
	
	tool.style.position = "relative";
	tool.style.display = "none";
	
}


function hideAllTools(){
	// todo clear out eraseable child elements	
	var toolContainers = new Array();
	CBGetElementsByName("toolContainer", null, toolContainers);
	
	for(i=0; i<toolContainers.length; i++){
		toolContainers[i].style.display = "none";		
	}
	
	
}

// END TOOL LAYOUT FUNCTIONS






// FLOATING SELECT PAD FUNCTIONS


function setUpPadSwitches(){
	$('[padSwitch]').click(function(e){
		showPad($(this).attr('padSwitch'), $(this).get(0) , eval($(this).attr('padCallback')), e);
	})
}


// factory type function to show floating pad of various types, key, tunetype, etc
function showPad(padtype, targetElem, callback, event){

	// send the targetElem through as callback param
	var pad = new floatingSelectPad(callback, targetElem); 

	switch(padtype)
	{
		case "key":
			pad.cols = 6;
			for(i in keysArr)
				pad.addItem(keysArr[i].title, keysArr[i].id, keysArr[i].isCommon ? false : true);
			break;			
			
		case "type":
			pad.cols = 4;
			for(i in typesArr)
				pad.addItem(typesArr[i].title, typesArr[i].id, false);
			
			break;

		case "parts":
			pad.cols = 4;
			for(i=1; i<13; i++)
				pad.addItem("&nbsp;"+i+"&nbsp;", i, false);
			break;
			
		case "firstLetter":
			for(i=65; i<91; i++)
				pad.addItem("&nbsp;" + String.fromCharCode(i) + "&nbsp;", 
					String.fromCharCode(i), false);
			break;
		
		case "group":	
			pad.cols = 2;
			for(i in groupsArr)
				if(groupsArr[i].containsType(ITEM_TYPE_TUNE)){
					pad.addItem(groupsArr[i].title, groupsArr[i].id, false);
				}
			break;
			
		case "isActive":
				var STATUS_ACTIVE = 1;
				var STATUS_INACTIVE = 2;
				pad.addItem("Active", STATUS_ACTIVE, false);
				pad.addItem("To Learn", STATUS_INACTIVE, false);
			break;
			
		case "activity":
				pad.addItem('i know', STATUS_ACTIVE, false);
				pad.addItem('to learn', STATUS_INACTIVE, false);
				pad.addItem('both', STATUS_ACTIVE|STATUS_INACTIVE, false);
			break;
	}
	pad.show(event);
}


// called for floating selection pad item clicked. 
// sets selected text in the origin elem or elem specified in attr 'padTarget'
// places the value from clicked pad item in hidden field specified in 'padHiddenTarget'

function padItemSelected(originElem, padItemValue, padItemText){
	// put the selected text in the target
	var target = originElem.getAttribute("padTarget");
	target = target ? $('#' + target).get(0) : originElem;
	target.innerHTML = padItemText;
	target.value = padItemValue; 
	// put selected value in a hidden field if specified 
	$('#' + originElem.getAttribute("padHiddenTarget")).val(padItemValue);
	return true;
}



// END FLOATING SELECT PAD FUNCTIONS


	

// AutoSuggest Callback 


// callback from objAutoSuggest when the user types in the box. returns array of tune suggestions
function autoSuggestCallback(str, type){
	
	if(typeof(type) == 'undefined')
		type = ITEM_TYPE_TUNE;
		
	var populateFromArr, prop = "title";
	switch(type){
		case ITEM_TYPE_TUNE:
			populateFromArr = tunesArr;
			break;
		case ITEM_TYPE_SET:
			populateFromArr = setsArr;
			prop = "getSetAsString()";
			break;
		case ITEM_TYPE_RESOURCE:
			populateFromArr = resourcesArr;
			break;
	}
	var listArr = new Array();
	str = str.replace(/^\s\s*/, ''); // ltrim
	if(str.length)			
		for(var i in populateFromArr){
			var title = eval("populateFromArr[i]." + prop);
			
			if(title.substr(0, str.length).toLowerCase() == str){
				
				listArr[populateFromArr[i].id] = title;
			}
		}
				
	return listArr;
}



// highlights background of div on click or contextmenu
function selectItem(elem){
	elem.setAttribute("restoreClass", elem.className);
	elem.className = "itemselected";
	
	
	CBStopEventPropagation(window.event);
	// and unselect on any click
	var _this = elem; 
	
	// window.addEventListener("click", function(){
	CBAddEventListener(window, "click", function(){
		try{_this.className = elem.getAttribute("restoreClass");}
		catch(e){_this.className = "item";}
		}, true);
		
	// window.addEventListener("contextmenu", function(){
	CBAddEventListener(window, "contextmenu", function(){
		try{_this.className = elem.getAttribute("restoreClass");}
		catch(e){_this.className = "item";}
		}, true);
}
	

function createTitleDiv(title, id, tag){
	var groupTitleDiv = document.createElement(tag ? tag : "div");
	groupTitleDiv.className = "info pointer black";
	groupTitleDiv.innerHTML = title;
	groupTitleDiv.value = id;
	return groupTitleDiv;
}


function getTypeLabel(type){
	switch(parseInt(type)){
		case ITEM_TYPE_TUNE: return "Tunes";
		case ITEM_TYPE_SET: return "Sets";
		case ITEM_TYPE_RESOURCE: return "Resources";
		case ITEM_TYPE_GROUPS: return "Groups";
	}
	return "";
}



function itemsInMultiCol(items, type, groupId){

	var count = items.length;
	var k = 0, c = 0, col = 0; widest = 0;
	var colArrs = new Array();
	
	while(k < items.length){
		var div = createItemElement(items[k], type, groupId, false);
		var width = getDimensionsBeforeShowing(div).w;
		if(!colArrs[col])
			colArrs[col] = new Array();
		colArrs[col].push(div);
		
		// if(width > widest){
			// widest = width;
			// colArrs[col]["widest"] = widest;
		// }
		c++;
		if(c >= Math.ceil(count/3)){
			c = 0;
			col++;
			// widest = 0;
		}
		k++;
	}
	var table = document.createElement("table");
	table.className = "unpaddedtable";
	var tbody = document.createElement("tbody");
	var tr = document.createElement("tr");
	table.appendChild(tbody);
	tbody.appendChild(tr);
	for(var r in colArrs){
		var td = document.createElement("td");
		td.setAttribute("valign", "top");
		td.className = "ltgrayTableBorder";
		tr.appendChild(td);
		for(var s in colArrs[r]){
			if(s!="widest")
				td.appendChild(colArrs[r][s]);
		}
	}
	return table;
}




// ITEM ELEMENT FUNCTIONS 

function getItemByIdAndType(itemId, itemType){
	switch(itemType){
		case ITEM_TYPE_TUNE:
			return tunesArr[itemId];
			
		case ITEM_TYPE_SET:
			return setsArr[itemId];
			
		case ITEM_TYPE_GROUP:
			return groupsArr[itemId];
			
		case ITEM_TYPE_RESOURCE:
			return resourcesArr[itemId];
	}
}


// create the display element of any page item such as
// a tune, set, resource etc
function createItemElement(itemObj, itemType, groupId, useLabel, tag){

	// create the html elem and set css style usually "item pointer"
	var elem = document.createElement(tag ? tag : "div");
	elem.className = "item pointer"; 

	// most importantly set attributes "itemId" and "itemType" in the element tag
	elem.setAttribute("itemId", itemObj.id);
	elem.setAttribute("itemType", itemType);
	elem.value = itemObj.id; // todo needed?
	if(groupId)
		elem.setAttribute("groupId", groupId); 
	elem.innerHTML = (useLabel ? (itemObj.getLabel(true, true)) : "");

	switch(itemType){
	
		case ITEM_TYPE_TUNE:
			elem.innerHTML += itemObj.title;
			if(typeof(addTuneElemCtxMenu) != 'undefined')
				addTuneElemCtxMenu(elem, itemObj);
			break;
			
		case ITEM_TYPE_SET:
			// set up the element text and value
			elem.innerHTML += itemObj.getSetAsString() + 
				(itemObj.flagged ? "<b style='color:red'> * </b>" : "");
			
			// if functions are available attach handlers
			if(typeof(makeSetContextMenu) != 'undefined')
				elem.oncontextmenu = function(e){return makeSetContextMenu(e);}
				
			if(typeof(showSetEditDlg) != 'undefined')
				elem.ondblclick = function(e){showSetEditDlg(itemObj.id, e); }
			
			// other handlers
			elem.onclick = function(){selectItem(this);}
			CBDisableSelect(elem);
			break;
			
		case ITEM_TYPE_GROUP:
			elem.innerHTML +=  itemObj.title; // todo 
			// elem = makeGroupElement(itemObj).getSection()
			break;	
			
		case ITEM_TYPE_RESOURCE:		
			// set up resource item element
			var src = (itemObj.localFile) ?
				itemObj.localFile : itemObj.url;
			elem.setAttribute("frameSrc", src);

			try{
				// tuneId might be zero if not related to a tune
				if(itemObj.resourceType == RESOURCE_SHEETMUSIC)
					elem.innerHTML += tunesArr[itemObj.tuneId].title;
					
			}catch(e){			
				elem.innerHTML += "[uncategorized]";
			}
			
			elem.innerHTML += itemObj.title;
			if(typeof(addResourceContextMenu) != 'undefined')
				addResourceContextMenu(elem, itemObj);
			
			CBAddEventListener(elem, "contextmenu", function(){selectItem(this);}, false)
			
			
			elem.onclick = function(){
				selectItem(this);
			}
			
			// onclick handler for resource item
			elem.ondblclick = function(event){
				showResource(itemObj);
			}
			break;	

		case ITEM_TYPE_FAVORITE:
	try{
			var favoritedItem = getItemByIdAndType(itemObj.itemId, itemObj.itemType);
			
			switch(itemObj.itemType){
				case ITEM_TYPE_GROUP:
					elem = makeGroupElement(favoritedItem).getSection();
					break;
				case ITEM_TYPE_RESOURCE:
					elem = createItemElement(favoritedItem, itemObj.itemType, null, true);
					elem.onclick = function(){showResource(favoritedItem)};
					break;
				case ITEM_TYPE_TUNE:
					elem = createItemElement(favoritedItem, itemObj.itemType, null, true);
					elem.onclick = function(){goToTunePage(favoritedItem.id)};
					break;	
				default:
					elem.innerHTML = favoritedItem.getLabel(true, true) + favoritedItem.title;
			}
			elem.setAttribute("itemId", itemObj.id);
			elem.setAttribute("favoritedItemId", itemObj.itemId);
	}catch(e){alert(e.message)}
			
			break;
			
		case ITEM_TYPE_NOTE:
			break;	
	}
	return elem;
}


function deleteResource(itemId){
	if(confirm("Are you sure? This cannot be undone."))	
		doAction("deleteResource", 
				"itemId", itemId);
}

function deleteTune(tuneId){
	if(!confirm("Are you sure? \n\n\""+tunesArr[tuneId].title+
		"\" will be deleted. This cannot be undone.")){
		return;
	}
	
	$('<form method=post action=delete/'+tuneId+'><input type=hidden name=_method value=\'delete\'></form>').appendTo(document.body).submit();
	
	
	return;
	doAction("deleteTune",  
			"tuneId", tuneId)
}
	

function addTuneElemCtxMenu(elem, tuneObj){
	// add custom context menu
	elem.oncontextmenu = function(event){

		try{
		var ctxMenu = new ContextMenu();

		ctxMenu.addItem("Tune Page...", function(){goToTunePage(tuneObj.id)}, tuneObj.id);
		ctxMenu.addSeparator();
		
		// todo (optional) keys and types
		if(typeof(addToNewSetCallback) != 'undefined')
			ctxMenu.addItem("Add to New Set...", addToNewSetCallback, tuneObj.id + "");
		
		// if this is a group, show "remove from group" menu option
		if(elem.getAttribute('groupId') != null){
			for(var i in groupsArr) 
				if (groupsArr[i].id == elem.attributes['groupId'].value){
					ctxMenu.addItem("Remove from Group", 
						removeFromGroupCallback, tuneObj.id +","+ITEM_TYPE_TUNE+","+groupsArr[i].id);
					break;
				}
		}
		else{
			var groups = ctxMenu.addSubMenu("Add To Group");
			for(var j in groupsArr){
				if(groupsArr[j].hasItem(tuneObj.id, ITEM_TYPE_TUNE))
					groups.addItem(groupsArr[j].title);
				else
					groups.addItem(groupsArr[j].title, addItemToGroup,
						{itemId:tuneObj.id, itemType: ITEM_TYPE_TUNE, groupId: groupsArr[j].id});
			}
			groups.addSeparator();
			groups.addItem("Add To New Group...", addItemToGroup, {itemId:tuneObj.id, itemType: ITEM_TYPE_TUNE});
		}
		
		ctxMenu.addItem("Favorite Item", favoriteItem, tuneObj);
		
		ctxMenu.addSeparator();
		ctxMenu.addItem("Delete", deleteTune, tuneObj.id);	
		ctxMenu.show(event);
		}catch(e){alert(e)}
		return false;
	}	

}




// sort properties
// for sorting an array of objects with a property (obj.title, obj.priority)	
var SORT_TYPE_ALPHA = 1;
var SORT_TYPE_PRIORITY = 2;
var SORT_TYPE_RESOURCETYPE = 3;
var SORT_TYPE_SETS_ALPHA = 4;
var SORT_TYPE_ENTRY_DATE = 5;
var SORT_TYPE_ENTRY_DATE_ASC = 6;


function sortByResourceType(a, b){
	return (a.resourceType > b.resourceType) ? 1 : -1;
}

function sortBySetAsString(a, b){
	//alert(a.getSetAsString(false) +","+ b.getSetAsString(false))
	return (a.getSetAsString(false) > b.getSetAsString(false)) ? 1 : -1;
}

function sortByEntryDate(a, b){
	return (a.entryDate > b.entryDate) ? 1 : -1;
}

function sortByEntryDateAsc(a, b){
	return (a.entryDate < b.entryDate) ? 1 : -1;
}


// to get sorted arrays of associative arrays which can't
// themselves be sorted without mismatchig the keys
function getSortedArrayCopy(arr, sortBy){
	var copyArr = new Array();
	for(var i in arr)
		copyArr.push(arr[i]);
	
	var sortFunc = null;
	switch(sortBy){
		case SORT_TYPE_ALPHA: sortFunc = alphaSort; break;
		case SORT_TYPE_PRIORITY: sortFunc = prioritySort; break;
		case SORT_TYPE_RESOURCETYPE: sortFunc = sortByResourceType; break;
		case SORT_TYPE_SETS_ALPHA: sortFunc = sortBySetAsString; break;
		case SORT_TYPE_ENTRY_DATE: sortFunc = sortByEntryDate; break;
		case SORT_TYPE_ENTRY_DATE_ASC: sortFunc = sortByEntryDateAsc; break;
	}
	copyArr.sort(sortFunc);
	return copyArr;
}


// util funcs
function setsWithTune(tuneId){
	try{
		var arr = new Array();
		
		for(var j in setsArr){
			if(setsArr[j].hasTune(tuneId)){
				arr.push(setsArr[j]);
			}
		}
		return arr;
	}
	catch(e){alert(e)}
}



// most pages will have a main "content area" showing various
// items. Simple util func to clear items as needed.
function clearContentArea(listElemId){
	if(!listElemId)
		listElemId = "contentarea";
	var msl = document.getElementById(listElemId);
	while(msl.childNodes.length > 0) msl.removeChild(msl.firstChild);
}

function sizeContentArea(contentArea){
	contentArea = contentArea ? $(contentArea) : $('#maintable');
	var Y = getWindowInnerHeight();
	//alert(Math.floor(Y * .95) + 'px')
	contentArea.css('height', Math.floor(Y * .95) + 'px');
	//alert(document.getElementById('maintable').style.height)
	//contentArea.css('height', Math.floor(Y * .82) + 'px');
}


function saveNewSetsCallback(){
	alert(setsTemp)
}

function showOrganizeTunesDialog(groupId){
	var arr = tunesFromGroupByType(groupsArr[groupId]);
	if(!arr.length){
		alert("there are no tunes in this set");
		return;
	}
	
	var fl = new FloatingContainer(saveNewSetsCallback, null, setsTemp);
	var setsDisplay = document.createElement("div");
	var setsTemp = tunesIntoSets(arr)
	fillSetDisplay(setsDisplay, setsTemp);
	
	var bottomBar = document.createElement("div");
	bottomBar.style.backgroundColor = "335555";
	var rescrambleBtn = document.createElement("span");
	rescrambleBtn.innerHTML = "re-scramble";
	rescrambleBtn.className = "toolBtn";
	
	rescrambleBtn.onclick = function(){
		// refill display with new random sets
		var setsTemp = tunesIntoSets(arr);
		fillSetDisplay(setsDisplay, setsTemp);
		setsDisplay.appendChild(bottomBar);
	}
	
	var thisGroupBtn = document.createElement("span");
	thisGroupBtn.innerHTML = "save to group \"" + groupsArr[groupId].title + "\"";
	thisGroupBtn.className = "toolBtn";
	thisGroupBtn.onclick = function(){
		var arrTemp = new Array();
		for(var i in setsTemp){
			arrTemp.push(setsTemp[i].getTuneIdsAsString());
		}
		var tuneIds = escape(arrTemp.join("&"));
		doAction("saveNewSets", 
				"tuneIds", tuneIds,
				"groupId", groupId);
	}
	
	var newGroupBtn = document.createElement("span");
	newGroupBtn.innerHTML = "save as new group";
	newGroupBtn.className = "toolBtn";
	newGroupBtn.onclick = function(){
		alert(setsTemp.length)
	}
	
	bottomBar.appendChild(rescrambleBtn);
	bottomBar.appendChild(thisGroupBtn);
	bottomBar.appendChild(newGroupBtn);
	
	setsDisplay.appendChild(bottomBar);
	
	
	fl.addContentElement(setsDisplay);
	fl.setTitle("New Sets");
	fl.show(event, 150, 100);

	
	// local utility func
	function fillSetDisplay(setsDisplay, setsTemp){
		while(setsDisplay.childNodes.length)
			setsDisplay.removeChild(setsDisplay.firstChild);
			
		for(var i in setsTemp){
			var div = document.createElement("div");
			div.className = "item";
			div.innerHTML = setsTemp[i].getSetAsString();
			setsDisplay.appendChild(div);
		}
	}	
}


// takes an assoc arr of tuneTypeId=>tunesArray
function tunesIntoSets(tunesArr){
	var setsDisplayStr = "";
	var setsTemp = new Array();
	for(var i in tunesArr){
		var tunesOfTypeI = shuffleArray(tunesArr[i]);
		for(var j=0; j<tunesOfTypeI.length; j++){
			var newSet = new Array();
			for(var k=0; k<3; k++, j++){
				newSet.push(tunesOfTypeI[j].id);
				if(j >= tunesOfTypeI.length - 1)
					break;
			}
			var set = new objSet(0, newSet, "", false, STATUS_ACTIVE);
			setsTemp.push(set);	
		}
	}
	return setsTemp;
}




// GROUP CONTEXT MENU AND CALLBACKS

function addGroupContextMenu(elem){
	elem.oncontextmenu = function(event){
		var ctxMenu = new ContextMenu();
		
		var groupId = this.getAttribute('itemId');
		ctxMenu.addItem("Add Item...", addTuneToGroupCallback, groupId);
		
		if(elem.hasAttribute("showOrganizeOption")){
			ctxMenu.addItem("Organize Tunes Into Sets...", showOrganizeTunesDialog, groupId);
		}
		
		ctxMenu.addSeparator();
		
		ctxMenu.addItem("Rename Group...", renameGroup, groupId);
		ctxMenu.addItem("Copy Group...", copyGroup, groupId);
		if(elem.getAttribute("status") & STATUS_INACTIVE)
			ctxMenu.addItem("Unarchive Group", unArchiveGroup, groupId);
		else
			ctxMenu.addItem("Archive Group", archiveGroup, groupId);
		ctxMenu.addItem("Unflag All", unflagGroupItems, groupId);
		ctxMenu.addItem("Favorite Item", favoriteItem, groupsArr[groupId]);
		ctxMenu.addSeparator();
		
		ctxMenu.addItem("Email Group...", ctxEmailGroup, groupId);
		ctxMenu.addSeparator();
		
		ctxMenu.addItem("Remove This Group", removeGroup, groupId);
		ctxMenu.show(event);
		return false;
	}
}

function addGroupSubHdrContextMenu(elem){
	elem.oncontextmenu = function(event){
		var ctxMenu = new ContextMenu();
		
		var type = parseInt(elem.getAttribute("containsItemType"));
		var typeLabel = getTypeLabel(type);
		
		if(type == ITEM_TYPE_TUNE){
			ctxMenu.addItem("Make selected tunes into set", groupTunesIntoSet, this.nextSibling);
			var _this = this;
			ctxMenu.addItem("Develop sets from these tunes...", function(tunesDiv){
				function setDevCallback(setsArr, groupId){
					doAction("saveNewSets", 
						"tuneIds", setsArr.join(escape("&")),
						"groupId", groupId);
				}
				var developer = new setDeveloper(setDevCallback, _this.getAttribute("groupId"));
				$(tunesDiv).find('div[itemId][itemType='+ITEM_TYPE_TUNE+']').each(function(){
					developer.addTune(tunesArr[$(this).attr("itemId")])
					})
				developer.show();
			}, CBParentElement(this));
			
		}
		
		
		
		if(type == ITEM_TYPE_SET){
			ctxMenu.addItem("Add all tunes in sets to group", alert, null);
		}
		
		ctxMenu.addItem("Remove All " + typeLabel + " From Group", removeFromGroupByType, {itemType: this.getAttribute("containsItemType"), 
																							groupId: this.getAttribute("groupId")});
		ctxMenu.addSeparator();
		ctxMenu.addItem("Cancel", null, null);
		ctxMenu.show(event);
		return false;
	}
}

function removeFromGroupByType(obj){
	var count = groupsArr[obj.groupId].getItemsByType(obj.itemType).length;
	// if more than a few items prompt user
	if(count > 5)
		if(!confirm("This will remove "+count+" "+getTypeLabel(obj.itemType).toLowerCase() +" from this group. proceed?"))
			return
	
	doAction("removeItemsFromGroupByType",
			"itemType", obj.itemType,
			"groupId", obj.groupId);
}

function groupTunesIntoSet(containerElem){
	var arr = [], arrSelected = [];
	CBGetElementsByAttr('itemType', ITEM_TYPE_TUNE, containerElem, arr);
	for(var i in arr)
		if(arr[i].className.indexOf('itemselected') != -1)
			arrSelected.push(arr[i]);

	if(arrSelected.length == 0){
		alert('no tunes selected')
		return;
	}
	saveNewSet({setElem: arrSelected, groupId: arrSelected[0].getAttribute('groupId')});
}



/*
	get ids of assembled set and send to action page to db insert
	
	obj: object with
		groupId : id of a group if set is to be saved to a group. else 0
		setElem : an object representing a set. can be,
			a string of tune ids: 6,8,43
			array of tune ids,
			array of tune item elements
			object of type objList
*/

function saveNewSet(obj){
	try{
	
	var setElem =  obj.setElem;
	var tuneIds = '';
	
	// figure out what type of obj setElem is and convert to a string of tuneIds
	switch(setElem.constructor){
		case String:
			tuneIds = setElem;
			break;
		case objList:
			var ids = setElem.getItemIds();
			setElem.clearList();
			tuneIds = ids.join(",");
			break;
		case Array:
			if(typeof(setElem[0]) == 'string')
				tuneIds = setElem.join(",");
			else{
				try{
					var arr = [];
					for(var i in setElem){
						arr.push(setElem[i].getAttribute('itemId'));
					}
					tuneIds = arr.join(",");
				}catch(e){alert('error in saveNewSet: ' + e.message); return;}	
			}
			break;
		default:
			alert("unparseable obj type: "+setElem.constructor)
			return;
	}
	
	}catch(e){alert(e.message)}
	
	
	// save the set
	if(obj.groupId == 0)
		doAction("saveNewSet", 
				"tuneIds", tuneIds);
	else
		doAction("saveNewSet",  
				"tuneIds", tuneIds, 
				"groupId", obj.groupId);
}








function ctxReorderGroupByType(id, event){
	// create a reorder widget and add each set
	alert("todo");
	return false;
}

function groupSetsReorderCallback(ro){
	doAction("updateGroupItemsPriority", 
			"setIds", ro.getCurrentOrder());
}


function renameGroup(groupId){
	var currName;
	for(var i in groupsArr) 
		if (groupsArr[i].id == groupId) 
			currName = groupsArr[i].title;
	
	var newName = prompt("Enter new name for group: \""+currName+"\"", currName);
	if(newName == null)
		return;
		
	doAction("renameGroup",  
			"groupId", groupId, 
			"groupName", newName);
}



function copyGroup(id){

	var newGroupTitle = prompt("Enter new group name for group: \""+groupsArr[id].title+"\"");
	if(newGroupTitle == null)
		return;
		
	doAction("copyGroup", 
			"groupId", id,
			"newGroupTitle", newGroupTitle,
			"statusBit", STATUS_ACTIVE);	
}


function archiveGroup(id){
	doAction("updateGroupStatus", 
			"groupId", id,
			"statusBit", STATUS_INACTIVE);	
}

function unArchiveGroup(id){
	doAction("updateGroupStatus", 
			"groupId", id,
			"statusBit", STATUS_ACTIVE);	
}

function favoriteItem(itemObj){
	doAction("favoriteItem",
			"itemId", itemObj.id,
			"itemType", itemObj.itemType);
}

function removeFavorite(favObjId){
	var favObj = favoritesArr[favObjId];
	doAction("deleteFavorite",
			"favoriteId", favObj.id);
}


function ctxEmailGroup(groupId){
	var str = "";
	for(var i in groupsArr[groupId].itemsArr){
		for(var j in setsArr){
			if(setsArr[j].id == groupsArr[groupId].itemsArr[i].id &&
				groupsArr[groupId].itemsArr[i].type == ITEM_TYPE_SET){
					str += setsArr[j].setAsString + "\r\n";	
			}	
		}
	}
	str = groupsArr[groupId].title + ":\r\n\r\n" + str + "\r\n";
	emailText(str); // see common.js
}


function removeGroup(groupId){
if(confirm("Are you sure? This cannot be undone."))	
	doAction("deleteGroup", 
			"groupId", groupId);
}


function unflagGroupItems(groupId){
	
	var arr = new Array();
	var groupItems = groupsArr[groupId].itemsArr;
	for(var i in groupItems){
		if(groupItems[i].type == ITEM_TYPE_SET)
			arr.push(groupItems[i].id)
	}
	var str = arr.join(",");
	doAction("unflagGroup", 
			"setIds", str);
}




// END GROUP CONTEXT MENU AND CALLBACKS



// RESOURCE CONTEXT MENU AND CALLBACKS

function addResourceContextMenu(elem, objResource){

	// add context menu to resource (including sheetmusic images)
	elem.setAttribute("itemId", objResource.id);
	elem.oncontextmenu = function(event){
	try{
		var resourceId = this.getAttribute("itemId");
		var ctxMenu = new ContextMenu();
		
		// if resource is associated with tunes show submenu options to go to those tune pages
		if(objResource.associatedItemsArr.length)
		{
			var relatedSubMenu = ctxMenu.addSubMenu("Related Items for this Resource");
			var tuneId = null;

			for(n in objResource.associatedItemsArr){
				var itemId = objResource.associatedItemsArr[n].id;

				try{
					if(gTune.id == itemId)
						relatedSubMenu.addItem(tunesArr[itemId].title);
					else
						relatedSubMenu.addItem(tunesArr[itemId].title, 
							goToTunePage, 
							itemId);
				}
				catch(e){
					try{
						relatedSubMenu.addItem(tunesArr[itemId].title, 
							goToTunePage, 
							itemId);
					}catch(e){}
				}	
			}	
		}
		
		var groupMenu = ctxMenu.addSubMenu("Add To Group");
		for(var i in groupsArr){
			var group = groupsArr[i]
			groupMenu.addItem(group.title, addItemToGroup, {itemId:objResource.id, itemType: ITEM_TYPE_RESOURCE, groupId: group.id});
		}
		ctxMenu.addSeparator();
		
		
		
		ctxMenu.addItem("Edit Resource Title", editResourceTitle, objResource);
		
		// resource may be associated with more than one tune. show pop up to select an additional associated tune
		// if(objResource.resourceType != RESOURCE_SHEETMUSIC)
			ctxMenu.addItem("Assign Resource...", callbackAssignResource, objResource.id);
		
		if(typeof(ctxDisassociateCallback) != 'undefined')
			ctxMenu.addItem("Remove Resource from this Tune", ctxDisassociateCallback, objResource.id);
		
		if(groupId = elem.getAttribute("groupId")){
			ctxMenu.addItem("Remove From Group", 
				removeFromGroupCallback, 
				objResource.id +","+ITEM_TYPE_RESOURCE+","+groupId);
		}
		ctxMenu.addSeparator();
		
		ctxMenu.addItem("Favorite Item", favoriteItem, objResource);
		
		// email the link to the resource
		ctxMenu.addItem("Email this Resource...", ctxEmailSheetmusicCallback, objResource.id);
		ctxMenu.addSeparator();
		
		// option to delete the resource entirely
		ctxMenu.addItem("Delete this Resource", deleteResource, objResource.id);
		ctxMenu.show(event);
		
		}catch(e){alert(e.message)}
	
		return false;
	}
}


function showResource(res){

	// if there's already a frame remove it
	for(var i in this.childNodes){
		if(this.childNodes[i].nodeType == Node.ELEMENT_NODE){
			if(this.childNodes[i].tagName == "IFRAME"){
				this.removeChild(this.childNodes[i]);
				return false;
			}
		}
	}
	// create an iframe to show the resource item if clicked
	var iframe = document.createElement("IFRAME");
	var fl = new FloatingContainer(null, null, null);
	fl.setCancelButtonText("close");	
	fl.addContentElement(iframe);
	var title = res.title;
	if(title.length == 0)
		title = res.url;
	fl.setTitle(title);
	
	
	switch(res.resourceType){
	
		case RESOURCE_SHEETMUSIC:				
			var img = document.createElement("img");
			var isMoz = navigator.userAgent.indexOf('Mozilla') != -1 
			if(!isMoz)
				img.onload = showTheSheetmusic; // show after img load, otherwise frame can't be sized

			img.src = res.localFile; // sheetmusic will always be local on the server
			var frameBodyMargin = 10; // a little room
			if(iframe.contentDocument){
				iframe.contentDocument.body.style.backgroundColor = "white";
				iframe.contentWindow.document.body.style.margin = frameBodyMargin;
				iframe.contentWindow.document.body.appendChild(img);
			}
			else{
				iframe.src = img.src; // ie
			}
			
			if(isMoz)
				fl.show(window.event);

			function showTheSheetmusic(){
				iframe.style.width = img.width + frameBodyMargin * 2;
				if(img.width > CBParentElement(iframe).offsetWidth){
					iframe.style.width = CBParentElement(iframe).offsetWidth + frameBodyMargin * 2;
				}
				iframe.style.height = img.height + frameBodyMargin * 2;
				fl.show(window.event);
			}



			break;
			
		case RESOURCE_LINK_COMHALTAS_FLV:
			iframe.style.width = "440";
			iframe.style.height = "375";
			iframe.src = "comhaltasFlv.html?url=" + escape(res.url); 
			fl.show(window.event);
			break;
		
		default:
			iframe.style.width = "95%";
			iframe.style.height = "300";
			iframe.src = res.url;
			res.resizeElemForResource(iframe);
			fl.show(window.event);
		}
	
	return false;

}

function goToTunePage(id){
	location = "/tune/" + id;
}

function editResourceTitle(resObj){
	var newTitle = prompt("Edit Resource Title", resObj.title);
	if(newTitle){
		doAction("updateResource",
			"resourceId", resObj.id,
			"title", escape(newTitle));
	}
}


function callbackAssignResource(resourceId){
	showSelectTuneDlg(assignResource, resourceId);
}

function addTuneToGroupCallback(groupId){
	showSelectTuneDlg(addToGroup_SetParams, groupId);
}

function addToGroup_SetParams(groupId, itemId){
	var itemType = ITEM_TYPE_TUNE;
	addItemToGroup({itemId:itemId, itemType:itemType, groupId:groupId});
}


function showSelectTuneDlg(callback, callbackParam){

	var div = document.createElement("div");
	var fc = new FloatingContainer(flCallback, null, callbackParam);
	
	var hdr = document.createElement("div");
	hdr.className = "infohdr black";
	hdr.innerHTML = "Select tune<br>";
	var inputBox = document.createElement("input");
	
	div.appendChild(hdr);
	div.appendChild(inputBox);
	div.appendChild(document.createElement("br"));
	div.appendChild(document.createElement("br"));
	fc.addContentElement(div);
	fc.show(window.event);
	
	var auto = new objAutoSuggest(inputBox, autoSuggestCallback, suggestionClickedCallback);
	
	function flCallback(itemId){
		var selectedItemId = inputBox.getAttribute("tuneId")
		callback(callbackParam, selectedItemId);
	}
	
}


function assignResource(resourceId, newTuneId){
	doAction("addExistingResourceToNewItem",
			"tuneId", newTuneId,
			"resourceId", resourceId);
}

function suggestionClickedCallback(str, id, updateTargetElem){
	// put the tune data on the elem to be used when the user clicks the container submit button
	updateTargetElem.value = str;
	updateTargetElem.setAttribute("tuneId", id);
}


function ctxEmailSheetmusicCallback(resourceId){
	var str = "";
	str = resourcesArr[resourceId].url + "\r\n\r\n" + str + "\r\n";
	emailText(str); // see common.js
}


// END RESOURCE CONTEXT MENU AND CALLBACKS





function createNewGroup(){
	
	var newGroupName = prompt("New Group Name...");
	if(newGroupName == null)
		return false;
	doAction("addItemToGroup", 
			"newGroupName", newGroupName);
}


function trim(str){
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function validateTitleStr(str, itemType){
	str = trim(str);
	if(!str.length)
		return false;
	
	return str;
}


// create context menu for set item
function makeSetContextMenu(event){
	
	event = event ? event : window.event;
	
	var srcElem = CBEventSrcElement(event);
	if(!$(srcElem).attr('itemId'))
		srcElem = $(srcElem).parents('[itemId]').get(0)
		
	var setId = srcElem.getAttribute("itemId");
	
	// same as if being clicked on
	selectItem(srcElem);

	// creat the context menu
	var ctxMenu = new ContextMenu();
	// add context menu items and submenus
	
	// most used options
	
	ctxMenu.addItem("Show Set Sheetmusic", showSetSheetmusic, {setId:setId, event:event});
	ctxMenu.addSeparator();
	
	ctxMenu.addItem("Flag/Unflag Set", ctxFlagCallback, setId);
	ctxMenu.addItem("Edit Set", showSetEditDlg, setId);
	ctxMenu.addSeparator();
	
	// submenu: tune pages
	var tunes = ctxMenu.addSubMenu("Tune Pages");
	var tuneIds = setsArr[setId].tunesArr;
	for(var i in tuneIds){
		tunes.addItem(tunesArr[tuneIds[i]].title, 
						goToTunePage, 
						tuneIds[i]);
	}
	ctxMenu.addSeparator();
	
	// add to group submenu
	var groups = ctxMenu.addSubMenu("Add to Group");
	for(var i in groupsArr){
		if(groupsArr[i].hasItem(setId, ITEM_TYPE_SET))
			groups.addItem(groupsArr[i].title);
		else
			groups.addItem(groupsArr[i].title, 
						addItemToGroup, 
						{itemId: setId, itemType: ITEM_TYPE_SET, groupId:groupsArr[i].id});
						
	}
	groups.addSeparator();
	groups.addItem("Add to New Group...", 
					addItemToGroup, 
					{itemId: setId, itemType: ITEM_TYPE_SET});

	// if set is being show in a group add some extra menu options...
	if(srcElem.getAttribute("groupId"))
	{
		if(groupId = CBEventSrcElement(event).getAttribute('groupId')){
			var move = ctxMenu.addSubMenu("Move to Group");
			//var currGroupId = attr.value;
			for(var i in groupsArr){
				if(groupsArr[i].id != groupId) // don't show group it's already in
					move.addItem(groupsArr[i].title, 
								addItemToGroup, 
								{itemId: setId, itemType: ITEM_TYPE_SET, groupId:groupsArr[i].id, removeFromGroupId: groupId});
				else
					move.addItem(groupsArr[i].title); // inactive
			}
			
			ctxMenu.addItem("Remove From Group", 
							removeFromGroupCallback, 
							setId +","+ITEM_TYPE_SET+","+groupId);
		}
	}
	
	ctxMenu.addItem("Favorite Item", favoriteItem, setsArr[setId]);
			
	ctxMenu.addSeparator();	
	ctxMenu.addItem("Delete", deleteSet, setId);
	ctxMenu.show(event);
	return false;
}


//callbacks for context menu
function ctxFlagCallback(setId){
	doAction("flagSet",  
			"setId", setId);
}



function addItemToGroup(obj){

	var itemId = obj.itemId; // id of the item (tune, set, etc)
	var itemType = obj.itemType;
	var groupId = parseInt(obj.groupId); // id of group we're adding the set to (if 0 means it's a group to be created
	var removeFromGroupId = parseInt(obj.removeFromGroupId); // means we're moving a set (if not 0)
	
	// add to existing group
	if(!isNaN(groupId) && isNaN(removeFromGroupId)){
		doAction("addItemToGroup",  
				"itemId", itemId, 
				"itemType", itemType,
				"groupId", groupId);
	}
	
	
	// add to new group
	if(isNaN(groupId) && isNaN(removeFromGroupId)){
		var newGroupName = prompt("New Group Name...");
		if(newGroupName == null)
			return false;
		
		doAction("addItemToNewGroup",  
				"itemId", itemId, 
				"itemType", itemType,
				"newGroupName", newGroupName);
	}
	
	// move to existing group
	if(!isNaN(groupId) && !isNaN(removeFromGroupId)){
		doAction("moveItemToGroup",  
				"itemId", itemId, 
				"itemType", itemType,
				"addtoGroupId", groupId, 
				"removeFromGroupId", removeFromGroupId);
	}
	
	// move to new group
	if(isNaN(groupId) && !isNaN(removeFromGroupId)){
		var newGroupName = prompt("New Group Name...");
		if(newGroupName == null)
			return false;
		
		doAction("moveItemToNewGroup",  
				"itemId", itemId, 
				"itemType", itemType,
				"newGroupName", newGroupName);
	}
}


function removeFromGroupCallback(paramStr){
	var arr = paramStr.split(",");
	var itemId = arr[0];
	var itemType = arr[1];
	var groupId = arr[2]
	doAction("removeItemFromGroup",  
			"itemId", itemId, 
			"itemType", itemType,
			"groupId", groupId);
}


function setEditCallback(obj){
	doAction("updateSet",  
			"setId", obj.setId, 
			"tuneIds", obj.getCurrentOrder());
}

function showSetEditDlg(id, event){
	try{
		var ro = new objReorder();
		var fl = new FloatingContainer(setEditCallback, null, ro);
		
		for(var i in setsArr[id].tunesArr){
			ro.addItem(tunesArr[setsArr[id].tunesArr[i]].title, setsArr[id].tunesArr[i]);
		}
		ro.addAddItemButton();
		ro.assemble();
		ro.allowRemove = true;
		objReorder.prototype.setId;
		ro.setId = id;
		
		fl.setTitle("Edit Set");
		fl.addContentElement(ro.getBox());
		fl.show(event, 200, 100, FC_AUTO_POSITION_MOUSE);
	}catch(e){alert(e.message)}
	return false;
}


function deleteSet(id){
	if(confirm("Are you sure? This cannot be undone."))	
		doAction("deleteSet", 
					"setId", id);
}






function makeGroupElement(group){

	// create the title div for each group 
	// which will be the header for an expandable section
	var groupTitleDiv = createTitleDiv(group.title, group.id, "span");
	groupTitleDiv.setAttribute("showOrganizeOption", "");
	groupTitleDiv.setAttribute("status", group.status);
	if(group.status & STATUS_INACTIVE)
		groupTitleDiv.innerHTML += " <span style='color:772200;'>[archived]</span>";
	var es = new expandableSection(groupTitleDiv, group.id, ES_STATE_COLLAPSED);
	
	es.setBodyClass('bubbleSection');
				
	
	var types = new Array(ITEM_TYPE_TUNE, ITEM_TYPE_SET, ITEM_TYPE_RESOURCE);
			
	for(var j in types){
		var items;
		if(items = group.getItemsByType(types[j])){
			switch(types[j]){
				case ITEM_TYPE_TUNE: items.sort(alphaSort); break;
				case ITEM_TYPE_SET: items.sort(sortBySetAsString); break;
				case ITEM_TYPE_RESOURCE: items.sort(alphaSort); break;
			}
			
			var typeLabel = document.createElement("div");
			typeLabel.innerHTML = getTypeLabel(types[j]) + " ("+items.length +")";
			typeLabel.className = "info gray pointer";
			typeLabel.setAttribute("containsItemType", types[j]);
			typeLabel.setAttribute("groupId", group.id);
			addGroupSubHdrContextMenu(typeLabel);
			
			if(items.length)
				es.addElem(typeLabel);
					
			
			// for tunes put them in columns to save space
			if(types[j] == ITEM_TYPE_TUNE){
				var count = items.length;
				
				if(count > 10){
					// calculate how many columns can be made for tunes display
					var sectionWidth = es.getSection().offsetWidth;
					var table = itemsInMultiCol(items, types[j], group.id);
					es.addElem(table);
					es.addBreak();
				}
				else{
					for(var k in items){
						var div = createItemElement(items[k], types[j], group.id, false);
						var width = getDimensionsBeforeShowing(div);
						es.addElem(div);
					}
					es.addBreak();
				}
				
				var arrTest = [];
				CBGetElementsByAttr('itemType', '1', es.getElem(), arrTest);
				for(var i in arrTest){
					arrTest[i].onclick = function(){
						// toggle item element 'selection' when clicked
						var cn = this.className.replace(/(?:^|\s)(item)(?=\s|$)/, 'itemselected');
						this.className = (cn != this.className) ? cn : this.className.replace(/itemselected/, 'item');		
					}
				}
			}
			
			// for other item types just list
			else{
				for(var k in items){
					try{
						var div = createItemElement(items[k], types[j], group.id, false);
						es.addElem(div);
					}catch(e){alert("error creating element. " + items.length)}
				}
				es.addBreak();
			}
		}
	}
	return es;
}



function removePlaceholder(container){
	$(container).find('[name=placeholder]').each(function(){$(this).remove();})
}



function showSetSheetmusic(obj){
	
	setId = obj.setId
	event = obj.event
	
	var div = document.createElement("div");
	var arrImgs = [];
	var loaded=0;

	// find the set object
	var set = setsArr[setId];
	
	// go through each tune in set and find img if exists
	for(var idx in set.tunesArr){
		var tuneId = set.tunesArr[idx];
		var title = document.createElement("div");
		title.className = "infoHdr";
		title.innerHTML = tunesArr[tuneId].title;
		div.appendChild(title);
		
		// find img
		var res = tuneHasImg(tuneId);
		if(res){
			var img = new Image();
			img.style.margin = 5;
			div.appendChild(img);
			div.appendChild(document.createElement("br"));
			div.appendChild(document.createElement("br"));
			
			// set onload handler for image to callback (but don't set img src attr until 
			// done with this img-finding loop: img attr begins load and total count must be known before any loading).
			img.onload = loadCount;
			arrImgs.push({img:img, res:res});
		}
		else{
			var placeHolder = document.createElement("div");
			placeHolder.className = "info";
			placeHolder.innerHTML = "[no sheetmusic]<br><br>";
			div.appendChild(placeHolder);
		}
	}
	
	// if images exist for any tune, set src attribute which will start load
	if(arrImgs.length)
		for(var i in arrImgs){
			arrImgs[i].img.src = arrImgs[i].res.localFile;
		}
	else
		alert('no sheetmusic for tunes in this set');

	function tuneHasImg(tuneId){
		for(var j in resourcesArr){
			var res = resourcesArr[j];
			if(res.belongsTo(tuneId) && res.resourceType == RESOURCE_SHEETMUSIC){
				return res;
			}
		}
		return null;
	}
	
	// callback for images onload event. when all images available have loaded, show the pop up window
	// which will then size correctly
	function loadCount(){
		loaded++;
		if(loaded >= arrImgs.length){
			var fl = new FloatingContainer(null, null, div);
			fl.addContentElement(div);
			fl.setTitle("<span style='color:lightgray'>Sheetmusic: </span>" + set.getSetAsString());
			fl.setCancelButtonText('close');
			fl.show(event, 150, 100, FC_CLOSE_ON_OUTSIDE_CLICK | FC_AUTO_POSITION_CENTER | FC_CLOSE_ON_ESC);
		}
	}
}



function colorCodeTune(elem, tune){		
	if(typeof(tune) != 'undefined')
		elem.style.color = getColorCode(tune.typeId)
	else
		elem.style.color = getColorCode(tunesArr[elem.getAttribute('itemId')].typeId);
}


function getColorCode(tuneType){
	return typesArr[tuneType].color;
}

	
// email functions

// for the email functionality to work html document must have the emailBox.php included in the html
// at some point, most suitably at the end of the body element

function emailText(bodyText){
	
	// get the (already existing email div email) from the body 
	var div = document.getElementById("emailBox");
	
	var a = new FloatingContainer(emailTextCallback, emailCancelCallback, div);
	
	//get the sets in the group as text and put in textarea
	var bodyBox = div.getElementsByTagName("TEXTAREA")[0];
	bodyBox.value = bodyText;	
	
	// remove the email box from body and put in floating container
	document.body.removeChild(div);
	div.style.display = "";
	a.addContentElement(div);
	a.show(window.event);
}


function putBackEmailDiv(div){
	// put email box back in doc for (re)use later
	div.style.display = "none";
	CBParentElement(div).removeChild(div);
	document.body.appendChild(div);
	
}

function emailCancelCallback(div){
	putBackEmailDiv(div);
}

function emailTextCallback(div){	

	putBackEmailDiv(div);
	// get the email stuff the user entered
	var addr = div.getElementsByTagName("INPUT")[0].value; // todo make these ids
	var subj = div.getElementsByTagName("INPUT")[1].value;
	var body = div.getElementsByTagName("TEXTAREA")[0].value;
	var http = new XMLHttpRequest();
	http.onreadystatechange = function(){
		if(http.readyState == 4 && http.status == 200){
			alert("this.responseText: " + http.responseText);
		}
	}
	
	var loc = "ajax.php?action=email&addr="+escape(addr)+"&subj="+escape(subj)+"&body="+escape(body);
	
	http.open("GET", loc, true);
	http.send();
}


