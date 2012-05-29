

// sets a page element named "count" to the count of 
// items in the items array, usually: page-name + "Arr"
// or the arr param if sent
function setCount(arr){
	try{
		if(typeof arr == 'undefined')
			arr = gObjArrs[getCurrentPage()];
		var ctr = 0;
		for(var i in arr) 
			ctr++;
		$('#count').html(ctr)
	}catch(e){}	
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




function setCookie(name, value, days)
{
	var expDate = new Date();
	expDate.setDate(expDate.getDate() + days);
	var val = escape(value) + (typeof days == 'undefined' ? "" : "; expires="+expDate.toUTCString());
	document.cookie = name + "=" + val;
}


function getCookie(name)
{
	var i,x,y,cookies=document.cookie.split(";");
	for (i=0;i<cookies.length;i++)
	{
		x = cookies[i].substr(0,cookies[i].indexOf("="));
		y = cookies[i].substr(cookies[i].indexOf("=")+1);
		x = x.replace(/^\s+|\s+$/g,"");
		if (x==name)
			return unescape(y);	
	}
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








// FLOATING SELECT PAD FUNCTIONS


function setUpPadSwitches(){
	
	$('[padSwitch]').click(function(e){
		// not great way to do this: pad callbacks must be global.
		// but better than eval... TODO
		showPad($(this).attr('padSwitch'), $(this).get(0), window[$(this).attr('padCallback')], e);
	})
}


// factory type function to show floating pad of various types, key, tunetype, etc
function showPad(padtype, targetElem, callback, event){

	// send the targetElem through as callback param
	var pad = new FloatingSelectPad(callback, targetElem); 

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
				pad.addItem('learnt', STATUS_ACTIVE, false);
				pad.addItem('to learn', STATUS_INACTIVE, false);
				pad.addItem('all', STATUS_ACTIVE|STATUS_INACTIVE, false);
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


// callback from AutoSuggest when the user types in the box. returns array of tune suggestions
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
			prop = "getSetAsHTML()";
			break;
		case ITEM_TYPE_RESOURCE:
			populateFromArr = resourcesArr;
			break;
	}
	var listArr = new Array();
	str = str.replace(/^\s\s*/, ''); // ltrim
	if(str.length)			
		for(var i in populateFromArr){
			var title = populateFromArr[i][prop];
			
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




function tuneContextMenu(elem, tuneObj, event){
	
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
				if(groupsArr[j].isNotArchived())
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


function addTuneContextMenu(elem, tuneObj){
	
	elem.oncontextmenu = function(event){
		tuneContextMenu(elem, tuneObj, event);
		return false;
	}	

}




// GROUP CONTEXT MENU AND CALLBACKS

function addGroupContextMenu(elem){
	elem.oncontextmenu = function(event){
		var ctxMenu = new ContextMenu();
		
		var groupId = this.getAttribute('itemId');
		var archived = groupsArr[groupId].status & STATUS_BIT_ARCHIVED;
		
		if(!archived){
			ctxMenu.addItem("Add Tune...", addTuneToGroupCallback, groupId);
		
			if(elem.hasAttribute("showOrganizeOption")){
				ctxMenu.addItem("Organize Tunes Into Sets...", showOrganizeTunesDialog, groupId);
			}
		
			ctxMenu.addSeparator();
		
			ctxMenu.addItem("Rename Group...", renameGroup, groupId);
			
			
			ctxMenu.addItem("Unflag All", unflagGroupItems, {groupId:groupId, itemType:ITEM_TYPE_SET});
			ctxMenu.addItem("Favorite Item", favoriteItem, groupsArr[groupId]);
		}
		
		var label = (groupsArr[groupId].status & STATUS_BIT_ARCHIVED) ? "Unarchive Group" : "Archive Group";
			ctxMenu.addItem(label, flagUnflag, 
					{itemId:groupId, itemType:ITEM_TYPE_GROUP, bit:STATUS_BIT_ARCHIVED});
		
		
		ctxMenu.addItem("Copy Group...", copyGroup, groupId);
		
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
		
			var groupId = this.getAttribute('groupId');
			var group = groupsArr[groupId];
			ctxMenu.addItem("Add Tune...", addTuneToGroupCallback, groupId);
		
			ctxMenu.addItem("Make selected tunes into set", groupTunesIntoSet, this.nextSibling);
			var _this = this;
			
			function setDevCallback(setsArr, groupId){
			
				var arr = ['/tune_sets/add_new_sets_to_group', 'post']
				for(var i in setsArr)	
					arr.push({name:"set[][tuneIds]", value:setsArr[i]})
				
				arr.push({name:"group[id]", value:groupId})
				doRorLink.apply(this, arr )
				
			}
			
			// launch SetDeveloper tool
			ctxMenu.addItem("Develop sets from these tunes...", function(group){
				var developer = new SetDeveloper(setDevCallback, groupId, group);
				developer.addTunes(group.getItemsByType(ITEM_TYPE_TUNE))
				developer.show();
			}, group);
			
			ctxMenu.addItem("Develop sets from tunes not in sets...", function(group){
				var developer = new SetDeveloper(setDevCallback, groupId, group);
				developer.addTunes(group.getTunesNotInSets())
				developer.show();
			}, group);
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






// obj {ids:[], groupId, itemType}
function addMultipleToGroup(obj){
	var itemsArr = $.map(obj.ids, function(id, idx){return {itemId:id, itemType:obj.itemType}})
	var param = {items:itemsArr, groupId:obj.groupId}
	addItemToGroup(param)
	//{items:[{itemId, itemType, groupId}+], newGroupName}
}


function gridSelectionsCallback(rows, event, itemType){

	var ids = $.map(rows, function(rows, idx){return rows.getAttribute('id')});
	var c = new ContextMenu();
	var groupsMenu = c.addSubMenu('Add All to Group');
	for(var i in groupsArr)
		groupsMenu.addItem(groupsArr[i].title, addMultipleToGroup, {ids:ids, groupId:groupsArr[i].id, itemType:itemType});
		groupsMenu.addSeparator()
		groupsMenu.addItem('Add to New Group...', addMultipleToGroup, {ids:ids})
	
	if(typeof addToNewSet != 'undefined')
		c.addItem('Add All to New Set', addToNewSet, ids);
	
	c.addSeparator();
	
	var deleteFunc = null;
	switch(itemType){
		case ITEM_TYPE_TUNE: deleteFunc = deleteTune; break;
		case ITEM_TYPE_RESOURCE: deleteFunc = deleteResource; break;
		case ITEM_TYPE_SET: deleteFunc = deleteSet; break;

	}
	if(deleteFunc)
		c.addItem('Delete All', deleteFunc, ids);
	
	c.show(event);
}	












// sorting

// sort funcs for objects by-property. convention: sortBy + [object property]
// 	omit "get". eg. sorting an obj by its getLabel() would be sortByLabel

function sortByResourceType(a, b){
	return (a.resourceType > b.resourceType) ? 1 : -1;
}

function sortBySetAsString(a, b){
	return (a.getSetAsHTML(false) > b.getSetAsHTML(false)) ? 1 : -1;
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
	var copyArr = arr.slice();
	copyArr.sort(sortFunc);
	return copyArr;
}



function deleteResource(id){
	
	// multiple deletes. via ajax to avoid server overload
	if(id instanceof Array){	
		var titles = $.map(id, function(id, idx){return '  '+resourcesArr[id].title})
		if(!confirm('WARNING! \r\n\r\nYou are about to delete multiple resources.\r\n' + titles.join('\r\n') + 
			'\r\n\r\n This cannot be undone. Proceed?' )){
			return;	
		}
	
		var ctr = 0;
		
		function ajaxDelete(ids){
			if(!ids.length){
				alert('Done. '+ ctr + ' items deleted');
				location = location; // todo, remove from grid instead of reload
				return;
			}
				
			id = ids.pop();
			var rl = new RorLink();
			var url = '/resources/' + id;
			var form = rl.getRorLinkForm(url, 'delete', {name:"id", value:id});
			
			$.post(url, $(form).serialize(), function(resp){
				if(resp.success == true)
					ctr++;
				ajaxDelete(ids);
			});
		}
		
		
		ajaxDelete(id);		
		
	}
	else
	if(confirm("Are you sure? This cannot be undone..."))	
		doRorLink('/resources/' + id, 'delete', {name:"id", value:id});
}


function deleteTune(tuneId){
	if(tuneId instanceof Array){	
		var titles = $.map(tuneId, function(id, idx){return '  '+tunesArr[id].title})
		if(!confirm('WARNING! \r\n\r\nYou are about to delete multiple tunes.\r\n' + titles.join('\r\n') + 
			'\r\n\r\n This cannot be undone. Proceed?' )){
			return;	
		}
		tuneId = tuneId.join(',')
	}
	else if(!confirm("Are you sure? \n\n\""+tunesArr[tuneId].title+
		"\" will be deleted. This cannot be undone.")){
		return;
	}
	
	doRorLink('/tunes/'+tuneId, 'delete')
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
		arr.push({name:'redirect', value:location.pathname})
	
	// add redirect,  call super
	RorLink.prototype.doRorLink.apply(this, arr);
}









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
			object of type List
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
		case List:
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
		doRorLink('/tune_sets/', 'post', {name:'tune_set[tuneIds]', value:tuneIds}, 
							{name:'group_id', value:obj.groupId});
	}else{
		doRorLink('/tune_sets/', 'post', {name:'tune_set[tuneIds]', value:tuneIds});
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
	
	var title = prompt("Enter new name for group: \""+currName+"\"", currName);
	if(title == null)
		return;
	
	if(!(title = validateTitleStr(title))){
		alert('invalid title')
		return;
	}
	doRorLink('groups/' + groupId, 
			'put', 
			{name:'group[title]', value:title}, 
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

	doRorLink('/favorites',
		'post',
		{name:'favorite[itemable_id]', value:itemObj.id},
		{name:'favorite[itemable_type]', value:itemableTypeFromItemType(itemObj.itemType)})
}

function removeFavorite(favObjId){
	var favObj = favoritesArr[favObjId];
	doRorLink('/favorites/' + favObjId, 'delete');
	
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
	doRorLink('groups/'+groupId,
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


function resourceContextMenu(elem, objResource, event){

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
			if(group.isNotArchived()){
				groupMenu.addItem(group.title, addItemToGroup, 
						{itemId:objResource.id, itemType: ITEM_TYPE_RESOURCE, groupId: group.id});
			}
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



function addResourceContextMenu(elem, objResource){
	elem.oncontextmenu = function(event){
		resourceContextMenu(elem, objResource, event);
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
	var iframe = document.createElement("iframe");
	iframe.setAttribute('frameborder','0');
	var fl = new FloatingContainer(null, null, null);
	fl.setCancelButtonText("close");	
	var title = res.title;
	if(title.length == 0)
		title = res.url;
	fl.setTitle(title);
	
	switch(res.resourceType){
	
		case RESOURCE_SHEETMUSIC:				
			
			var img = document.createElement("img");
			
			function showTheSheetmusic(){
				fl.addContentElement(img);
				fl.show(window.event);
			}

			img.onload = showTheSheetmusic; // show after img load to size

			img.src = res.localFile; // sheetmusic will always be local on the server
			var frameBodyMargin = 10; // a little room
			

			break;
			
		case RESOURCE_LINK_COMHALTAS_FLV:
			iframe.style.width = "426px";
			iframe.style.height = "349px";
			iframe.src = "/resources/show_comhaltas_video?url=" + escape(res.url);
			fl.addContentElement(iframe);
			//res.resizeElemForResource(iframe);
			fl.show(window.event);
			break;
		
		case RESOURCE_LINK_YOUTUBE:
			var iframe = $('<iframe width="420" height="315" src="'+res.url+'" frameborder="0" allowfullscreen></iframe>')
			fl.addContentElement(iframe.get(0));
			res.resizeElemForResource(iframe.get(0));
			fl.show(window.event);	
			break;
		
		default:
			//alert(res.url)
			var iframe = $('<iframe width="420" height="200" src="'+res.url+'" frameborder="0" allowfullscreen></iframe>')
			fl.addContentElement(iframe.get(0));
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
		doRorLink('/resources/' + resObj.id, 'put', 
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
	
	var auto = new AutoSuggest(inputBox, autoSuggestCallback, suggestionClickedCallback);
	
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
	
	doRorLink('/groups', 'post', {name:'group[title]', value:title});
	
}




function trim(str){
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function validateTitleStr(str, itemType){
	try{
		str = trim(str);
	}catch(e){str = '';}
	if(!str.length)
		return false;
	
	return str;
}




// create context menu for set item
function tuneSetContextMenu(event){

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
	ctxMenu.addItem("Edit Set", setEditDlg, setId);
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
		if(groupsArr[i].isNotArchived())
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


// obj: {itemId, itemType, groupId, removeFromGroupId}
// obj: {items:[{itemId, itemType}+], groupId, removeFromGroupId}

function addItemToGroup(obj){

	var groupId = parseInt(obj.groupId);
	var removeFromGroupId = parseInt(obj.removeFromGroupId); // means we're moving a set (if not 0)
	
	if(obj.items){
		var jsonArr = []
		for(var i in obj.items){
			var item = obj.items[i];
			var temp = [];
			temp.push(json_format_pair('group_id', groupId));
			temp.push(json_format_pair('itemable_id', item.itemId));
			temp.push(json_format_pair('itemable_type', itemableTypeFromItemType(item.itemType)));
			jsonArr.push("{"+temp.join(',')+"}")
		}
		
		var argGroupItems = "["+jsonArr.join(',')+"]";
		
	}
	else{
		var argId = {name:'group_item[itemable_id]', value:obj.itemId}; 
		var argType ={name:'group_item[itemable_type]', value:itemableTypeFromItemType(obj.itemType)};
		var argGroupId = {name:'group_item[group_id]', value:groupId};
		var argRmGroupId = {name:'group_item[group_id]', value:removeFromGroupId};
	}
	
	var args = [];
	
	// add to existing group
	if(!isNaN(groupId) && isNaN(removeFromGroupId)){
		if(obj.items)	
			args = ['group_items/add', 'post', {name:'group_items', value:argGroupItems}];
		else
			args = ['group_items/add', 'post', argId, argType, argGroupId];
	}
	
	// add to new group
	if(isNaN(groupId) && isNaN(removeFromGroupId)){
		var newGroupName = prompt("New Group Name...");
		if(newGroupName == null)
			return false;
		if(obj.items)	
			args = ["group_items/add", 'post', {name:'group_items', value:argGroupItems}, {name:'group[title]', value:newGroupName}];
		else	
			args = ["group_items/add", 'post', argId, argType, {name:'group[title]', value:newGroupName}];
	}
	
	// move to existing group
	if(!isNaN(groupId) && !isNaN(removeFromGroupId)){
		
		if(obj.items){}
		else
			args = ["group_items/update", 'put', argId, argType, argRmGroupId, {name:'to_group_id', value:groupId}];
	}
	
	// move to new group
	if(isNaN(groupId) && !isNaN(removeFromGroupId)){
		var newGroupName = prompt("New Group Name...");
		if(newGroupName == null)
			return false;
		
		if(obj.items){}
		else
			args = ["group_items/update", 'put', argId, argType, argRmGroupId, {name:'new_group_title', value:newGroupName}];
		
	}
	
	doRorLink.apply(this, args);
	
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

	doRorLink('tune_sets/'+ obj.setId, 
			'put', 
			{name:'tune_set[tuneIds]', value:obj.getCurrentOrder()}
			);
}

function setEditDlg(id, event){
	try{
		var ro = new Reorder();
		var fl = new FloatingContainer(setEditCallback, null, ro);
		
		for(var i in setsArr[id].tunesArr){
			ro.addItem(tunesArr[setsArr[id].tunesArr[i]].title, setsArr[id].tunesArr[i]);
		}
		ro.addAddItemButton();
		ro.assemble();
		ro.allowRemove = true;
		Reorder.prototype.setId;
		ro.setId = id;
		
		fl.setTitle("Edit Set");
		fl.addContentElement(ro.getBox());
		fl.show(event, 200, 100, FC_AUTO_POSITION_MOUSE);
	}catch(e){alert(e.message)}
	return false;
}


function deleteSet(id){

	if(id instanceof Array){	
		var titles = $.map(id, function(id, idx){return '  ' + setsArr[id].getSetAsString()})
		if(!confirm('WARNING! \r\n\r\nYou are about to delete multiple sets:\r\n\r\n' + titles.join('\r\n') + 
			'\r\n\r\n This cannot be undone. Proceed?' )){
			return;	
		}
		
	}
	else{ 
		id = [id];
		if(!confirm("Are you sure you want to delete set \r\n\r\n" + 
			setsArr[id].getSetAsString() + "? \r\n\r\nThis cannot be undone."))	
		return;
	}
	doRorLink('/tune_sets/'+id.join(','), 'delete');
		
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
		title.className = "info black";
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
			fl.setTitle("<span style='color:lightgray'>Sheetmusic: </span>" + set.getSetAsHTML());
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


