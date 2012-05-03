


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




function validateTuneTitle(str){
	str = str.replace(/^\s+|\s+$/g,"");
	if(str.length == 0)
		return null;

	if(str.length > 255)
		return null;
		
	// check for invalid chars	
	regex = /[^A-Za-z0-9\-\'\"\?\!\&\s\(\)\._]/g
	if(regex.exec(str) != null)
		return null;
			
	return str;
}




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
	return pad;
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
	
	CBAddEventListener(window, "click", function(){
		try{_this.className = elem.getAttribute("restoreClass");}
		catch(e){_this.className = "item";}
		}, true);
		
	CBAddEventListener(window, "contextmenu", function(){
		try{_this.className = elem.getAttribute("restoreClass");}
		catch(e){_this.className = "item";}
		}, true);
}
	

function createTitleDiv(title, id, tag){
	var elem = document.createElement(tag ? tag : "div");
	elem.className = "info pointer copper";
	elem.innerHTML = title;
	elem.value = id;
	return elem;
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



function getTunesByType(type){
	var arr = new Array();
	for(var i in tunesArr){
		if(tunesArr[i].typeId == type){
			arr.push(tunesArr[i]);
		}
	}
	return arr;
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
			if(typeof(addTuneContextMenu) != 'undefined')
				addTuneContextMenu(elem, itemObj);
			break;
			
		case ITEM_TYPE_SET:
			
			// set up the element text and value
			elem.innerHTML += itemObj.getSetAsString();
			
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
	//	alert(itemObj.itemId+","+ itemObj.itemType)
			elem = createItemElement(favoritedItem, itemObj.itemType, null, true);
			elem.setAttribute("itemId", itemObj.id);
			elem.setAttribute("favoritedItemId", itemObj.itemId);
			
		}catch(e){alert(e)}	
			break;
			
		case ITEM_TYPE_NOTE:
			break;	
	}
	return elem;
}


function deleteResource(id){
	if(confirm("Are you sure? This cannot be undone..."))	
		doRorLink('/resources/delete/' + id, 'delete', {name:"id", value:id});
}

function deleteTune(tuneId){
	if(!confirm("Are you sure? \n\n\""+tunesArr[tuneId].title+
		"\" will be deleted. This cannot be undone.")){
		return;
	}
		
	doRorLink('/tunes/delete/'+tuneId, 'delete')
}





function doRorLink(url, method){
	var rl = new RorLinkWRedirect();
	RorLinkWRedirect.prototype.doRorLink.apply(this, Array.prototype.slice.call(arguments))
}


// inherits from RorLink, adds a redirect based on name of page  
function RorLinkWRedirect(){
}

RorLinkWRedirect.prototype = new RorLink;
RorLinkWRedirect.prototype.constructor = RorLinkWRedirect;

RorLinkWRedirect.prototype.doRorLink = function(url, method /* , args */){

	// check for redirect
	// add redirect to this page as argument if not specified
	var b = false, arr = Array.prototype.slice.call(arguments);
	for(var i=2; i<arguments.length; i++){
		if(arguments[i].name == 'redirect')
			b = true;
	}
	
	if(!b)
		arr.push({name:'redirect', value:'/'+getCurrentPage()})
	
	
	// add redirect,  call super
	RorLink.prototype.doRorLink.apply(this, arr);
}



function addTuneContextMenu(elem, tuneObj){
	
	elem.oncontextmenu = function(event){

		try{
		var ctxMenu = new ContextMenu();

		ctxMenu.addItem("Tune Page...", function(){goToTunePage(tuneObj.id)}, tuneObj.id);
		ctxMenu.addSeparator();
		
		// todo (optional) keys and types
		if(typeof(addToNewSet) != 'undefined')
			ctxMenu.addItem("Add to New Set...", addToNewSet, tuneObj.id + "");
		
		// if this is a group, show "remove from group" menu option
		if(elem.getAttribute('groupId') != null){
			for(var i in groupsArr) 
				if (groupsArr[i].id == elem.attributes['groupId'].value){
					ctxMenu.addItem("Remove from Group", 
						removeItemFromGroup,
						{itemId:tuneObj.id , itemType:ITEM_TYPE_TUNE, groupId:groupsArr[i].id});
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



// sort funcs for objects by-property. convention: sortBy + [object property]
// 	omit "get". eg. sorting an obj by its getLabel() would be sortByLabel

function sortByResourceType(a, b){
	return (a.resourceType > b.resourceType) ? 1 : -1;
}

function sortBySetAsString(a, b){
	return (a.getSetAsString(false) > b.getSetAsString(false)) ? 1 : -1;
}

function sortByEntryDate(a, b){
	return (a.entryDate > b.entryDate) ? 1 : -1;
}

function sortByEntryDateAsc(a, b){
	return (a.entryDate < b.entryDate) ? 1 : -1;
}

function sortByTitle(a, b){
	return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : -1;
}

function sortByPriority(a, b){
	return (a.priority > b.priority) ? 1 : -1;
}


// to get sorted arrays of associative arrays which can't
// themselves be sorted without mismatching the keys
function getSortedArrayCopy(arr, sortFunc){
	var copyArr = new Array();
	for(var i in arr)
		copyArr.push(arr[i]);
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
	contentArea.css('height', Math.floor(Y * .95) + 'px');
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
		
		var label = (groupsArr[groupId].status & STATUS_BIT_ARCHIVED) ? "Unarchive Group" : "Archive Group";
		ctxMenu.addItem(label, flagUnflag, 
				{itemId:groupId, itemType:ITEM_TYPE_GROUP, bit:STATUS_BIT_ARCHIVED});
		
		ctxMenu.addItem("Unflag All", unflagGroupItems, {groupId:groupId, itemType:ITEM_TYPE_SET});
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
		
		ctxMenu.addItem("Remove All " + typeLabel + " From Group", 
				removeFromGroupByType, {itemType: this.getAttribute("containsItemType"),
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
	if(count > 3)
		if(!confirm("This will remove "+count+" "+getTypeLabel(obj.itemType).toLowerCase() +" from this group. proceed?"))
			return
	
	doRorLink("group_items/delete/" + obj.groupId + '/' + itemableTypeFromItemType(obj.itemType),
			'delete');
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
			selection list with option values => tune ids
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
		case HTMLSelectElement:
			var arr = [];
			for(var i in setElem.options){
				arr.push(setElem[i].value);
			}
			tuneIds = arr.join(",");
			break;
		default:
			alert("unparseable obj type: "+setElem.constructor)
			return;
	}
	
	
	
	}catch(e){alert(e.message)}
	
	
	// save the set
	if(obj.groupId){
		doRorLink('/tune_sets/add', 'post', {name:'tune_set[tuneIds]', value:tuneIds}, 
							{name:'group_id', value:obj.groupId});
	}else{
		doRorLink('/tune_sets/add', 'post', {name:'tune_set[tuneIds]', value:tuneIds});
	}
		
}




function groupSetsReorderCallback(ro){
	
	doRorLink('group_items/update', 
		'put', 
		{name:'reorder_ids', value:ro.getCurrentOrder()});

}


function renameGroup(groupId){
	var currName;
	for(var i in groupsArr) 
		if (groupsArr[i].id == groupId) 
			currName = groupsArr[i].title;
	
	var newName = prompt("Enter new name for group: \""+currName+"\"", currName);
	if(newName == null)
		return;
		
	doRorLink('groups/update/' + groupId, 
			'put', 
			{name:'group[title]', value:newName}, 
			{name:'group[id]', value:groupId});
		
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


function favoriteItem(itemObj){

	doRorLink('favorites/add',
		'post',
		{name:'favorite[itemable_id]', value:itemObj.id},
		{name:'favorite[itemable_type]', value:itemableTypeFromItemType(itemObj.itemType)})
}

function removeFavorite(favObjId){
	var favObj = favoritesArr[favObjId];
	doRorLink('/favorites/delete/' + favObjId, 'delete');
	
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
	doRorLink('groups/delete/'+groupId,
		'delete'
	);
}


function unflagGroupItems(obj){
	
	var arr = new Array();
	var groupItems = groupsArr[obj.groupId].itemsArr;
	for(var i in groupItems){
		if(groupItems[i].type == obj.itemType)
			arr.push(groupItems[i].id)
	}
	var str = arr.join(",");
	
	doRorLink('/groups/unflag_items/'+obj.groupId+'/'+itemableTypeFromItemType(obj.itemType), 
		'put', 
		{name:"setIds", value:str}
		);
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
				removeItemFromGroup, 
				{itemId:objResource.id , itemType:ITEM_TYPE_RESOURCE, groupId:groupId});
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
	location = "/tunes/" + id;
}

function editResourceTitle(resObj){
	var newTitle = prompt("Edit Resource Title", resObj.title);
	if(newTitle){
		doRorLink('/resources/update/' + resObj.id, 'put', 
			{name:'resource[id]', value:resObj.id}, 
			{name:'resource[title]', value:newTitle}
		)
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



function newGroup(){
	var title = document.getElementById("newGroupNameBox").value;
	if(!(title = validateTitleStr(title))){
		alert("invalid title");
		return false;
	}
	
	doRorLink('groups/add', 'post', {name:'group[title]', value:title});
	
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
//	selectItem(srcElem);
	
	// creat the context menu
	var ctxMenu = new ContextMenu();
	// add context menu items and submenus
	
	// most used options
	
	ctxMenu.addItem("Show Set Sheetmusic", showSetSheetmusic, {setId:setId, event:event});
	ctxMenu.addSeparator();
	
	ctxMenu.addItem("Flag/Unflag Set", flagUnflag, {itemId:setId, itemType:ITEM_TYPE_SET, bit:STATUS_BIT_FLAGGED});
	ctxMenu.addItem("Edit Set", showSetEditDlg, setId);
	ctxMenu.addSeparator();
	
	
	// submenu: tune pages
	try{
	var tunes = ctxMenu.addSubMenu("Tune Pages");
	var tuneIds = setsArr[setId].tunesArr;
	for(var i in tuneIds){
		tunes.addItem(tunesArr[tuneIds[i]].title, 
						goToTunePage, 
						tuneIds[i]);
	}
	ctxMenu.addSeparator();
	}catch(e){}
	
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
	
	if(groupId = srcElem.getAttribute("groupId"))
	{
		var move = ctxMenu.addSubMenu("Move to Group");
		for(var i in groupsArr){
			if(groupsArr[i].id != groupId) // don't show group it's already in
				move.addItem(groupsArr[i].title, 
							addItemToGroup, 
							{itemId: setId, itemType: ITEM_TYPE_SET, 
								groupId:groupsArr[i].id, 
								removeFromGroupId: groupId});
			else
				move.addItem(groupsArr[i].title); // inactive
		}
		move.addSeparator();
		move.addItem('Move To New Group...', addItemToGroup, 
							{itemId: setId, itemType: ITEM_TYPE_SET,
							removeFromGroupId: groupId});
		
		
		ctxMenu.addItem("Remove From Group", 
				removeItemFromGroup, 
				{itemId:setId , itemType:ITEM_TYPE_SET, groupId:groupId});
	
	}
	
	ctxMenu.addItem("Favorite Item", favoriteItem, setsArr[setId]);
			
	ctxMenu.addSeparator();	
	ctxMenu.addItem("Delete", deleteSet, setId);
	ctxMenu.show(event);
	return false;
}


//callbacks for context menu


// obj {itemId:setId, itemType:ITEM_TYPE_GROUP, bit:STATUS_BIT_ARCHIVED});
function flagUnflag(obj){
	
	var controller = itemableTypeFromItemType(obj.itemType, true)
	doRorLink(controller+'/toggle_status/' + obj.itemId + '/' + obj.bit,
		'put',
		{name:'status_bit', value:1});

}


function itemableTypeFromItemType(itemType, asPathName){
	
	var str = '';
	switch(parseInt(itemType)){
		case ITEM_TYPE_TUNE:  str = 'Tune'; break;
		case ITEM_TYPE_SET:  str =  'TuneSet';break;
		case ITEM_TYPE_RESOURCE:  str =  'Resource';break;
		case ITEM_TYPE_GROUP:  str =  'Group';break;
		case ITEM_TYPE_FAVORITE:  str =  'Favorite';break;
		default: return false;
	}
	if(asPathName){
		for(var i=1; i<str.length; i++)
			if(isUpperCase(str.charAt(i))){ 
				var a = str.substring(0, i)
				var b = str.substring(i+1, str.length)
				str = a + "_" + str.charAt(i) + b;
				
				i++
			}
		str = str.toLowerCase() + 's';
		
	}	
	return str
	
    	function isUpperCase(c){
		return (c >= 'A') && (c <= 'Z');
	}

}


// obj: {itemId, itemType, groupId, newGroupName}
function addItemToGroup(obj){

	var itemId = obj.itemId; // id of the item (tune, set, etc)
	var itemType = obj.itemType;
	var groupId = parseInt(obj.groupId); // id of group we're adding the set to (if 0 means it's a group to be created
	
	var removeFromGroupId = parseInt(obj.removeFromGroupId); // means we're moving a set (if not 0)
	
	// add to existing group
	if(!isNaN(groupId) && isNaN(removeFromGroupId)){
	
		doRorLink('group_items/add', 
			'post', 
			{name:'group_item[itemable_id]', value:itemId}, 
			{name:'group_item[itemable_type]', value:itemableTypeFromItemType(itemType)},
			{name:'group_item[group_id]', value:groupId}
			);
	}
	
	
	// add to new group
	if(isNaN(groupId) && isNaN(removeFromGroupId)){
		var newGroupName = prompt("New Group Name...");
		if(newGroupName == null)
			return false;
			
		doRorLink("group_items/add", 
				'post',
				{name:'group_item[itemable_id]', value:itemId}, 
				{name:'group_item[itemable_type]', value:itemableTypeFromItemType(itemType)},
				{name:'group[title]', value:newGroupName}
				);
	}
	
	// move to existing group
	if(!isNaN(groupId) && !isNaN(removeFromGroupId)){
		
		doRorLink("group_items/update", 
			'put',
			{name:'group_item[itemable_id]', value:itemId}, 
			{name:'group_item[itemable_type]', value:itemableTypeFromItemType(itemType)},
			{name:'group_item[group_id]', value:removeFromGroupId},
			{name:'to_group_id', value:groupId}
			);
	}
	
	// move to new group
	if(isNaN(groupId) && !isNaN(removeFromGroupId)){
		var newGroupName = prompt("New Group Name...");
		if(newGroupName == null)
			return false;
		
		doRorLink("group_items/update", 
			'put',
			{name:'group_item[itemable_id]', value:itemId}, 
			{name:'group_item[itemable_type]', value:itemableTypeFromItemType(itemType)},
			{name:'group_item[group_id]', value:removeFromGroupId},
			{name:'new_group_title', value:newGroupName}
			);
		
	}
}

//obj {itemId: , itemType:, groupId:}
function removeItemFromGroup(obj){
	doRorLink('group_items/delete/'+obj.groupId, 'delete', 
			{name:'group_item[group_id]', value:obj.groupId}, 
			{name:'group_item[itemable_id]', value:obj.itemId},
			{name:'group_item[itemable_type]', value:itemableTypeFromItemType(obj.itemType)}
			);
			
}


function setEditCallback(obj){

	doRorLink('tune_sets/update/'+ obj.setId, 
			'put', 
			{name:'tune_set[tuneIds]', value:obj.getCurrentOrder()}
			);
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
	if(confirm("Are you sure you want to delete set "+id+"? This cannot be undone."))	
	
	doRorLink('/tune_sets/delete/'+id, 'delete');
}





/* 
	makes a group element
 	expandable page element with 
 	subsections for different item types
*/

function makeGroupElement(group){

	// create the title div for each group 
	// which will be the header for an expandable section
	var groupTitleDiv = createTitleDiv(group.title, group.id, "span");
	groupTitleDiv.setAttribute("showOrganizeOption", "");
	groupTitleDiv.setAttribute("status", group.status);
	if(group.status & STATUS_BIT_ARCHIVED)
		groupTitleDiv.innerHTML += " <span style='color:772200;'>[archived]</span>";
	var es = new expandableSection(groupTitleDiv, group.id, ES_STATE_COLLAPSED);
	
	es.setBodyClass('bubbleSection');
				
	
	var types = new Array(ITEM_TYPE_TUNE, ITEM_TYPE_SET, ITEM_TYPE_RESOURCE);
			
	for(var j in types){
		var items;
		if(items = group.getItemsByType(types[j])){
			switch(types[j]){
				case ITEM_TYPE_TUNE: items.sort(sortByTitle); break;
				case ITEM_TYPE_SET: items.sort(sortBySetAsString); break;
				case ITEM_TYPE_RESOURCE: items.sort(sortByTitle); break;
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
				
				if(count >= 9){
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
						this.className = (cn != this.className) ? cn : 
							this.className.replace(/itemselected/, 'item');		
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


