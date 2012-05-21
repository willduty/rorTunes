
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
				
			if(typeof(setEditDlg) != 'undefined')
				elem.ondblclick = function(e){setEditDlg(itemObj.id, e); }
			
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
		groupTitleDiv.innerHTML += " <span style='color:#772200;'>[archived]</span>";
	var es = new ExpandableSection(groupTitleDiv, group.id, ES_STATE_COLLAPSED);
	
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
			
			if(!(group.status & STATUS_BIT_ARCHIVED))
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









