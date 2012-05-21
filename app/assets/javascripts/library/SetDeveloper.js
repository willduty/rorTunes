
function SetDeveloper(submitCallback, callbackParam){
	
	var _this = this;
	this.submitCallback = submitCallback; 
	this.callbackParam = callbackParam;
	
	// main structure divs
	this.box = document.createElement('div')
	this.tunesBox = document.createElement('div');
	this.setsBox = document.createElement('div');
	this.buttonsBox = document.createElement('div');
	
	// main box
	this.box.className = 'setDeveloper';
	this.box.onselectstart = function(){return false;}
	this.box.style.position = "absolute";
	this.box.style.MozUserSelect="none"; // firefox
	
	// sets box
	this.setsBox.style.height = '200px';
	this.setsBox.style.background = "#eee";
	
	// button bar
	this.cancelBtn = document.createElement('button');
	$(this.cancelBtn).addClass('toolBtn').html('close').click(function(){
		if($(_this.setsBox).find('[name=setDiv]').length != 0 && !confirm('All work will be lost. Close? '))
				return;
		_this.close();
	});
	this.buttonsBox.appendChild(this.cancelBtn)
	
	this.getSetIds = function(div){
		var arr = [];
		// todo use map instead
		div.find('[itemId]').each(function(){arr.push($(this).attr('itemId'));});
		return arr.join(',');
	}
	
	this.submitBtn = document.createElement('button');
	$(this.submitBtn).addClass('toolBtn').html('save sets').click(function(){
		var arr = [];
		$(_this.setsBox).find('[name=setDiv]').each(function(){
			arr.push(_this.getSetIds($(this)))
		})
		_this.submitCallback(arr, _this.callbackParam);
		_this.close();
	});
	this.buttonsBox.appendChild(this.submitBtn)
	
	
	
	// assemble main structure
	this.box.appendChild(this.tunesBox);
	this.box.appendChild(this.setsBox);
	this.box.appendChild(this.buttonsBox);
	document.body.appendChild(this.box);
	this.box.style.top = '100px';
	this.box.style.left = '100px';
	
	// tunes obj array
	this.tunesArr = [];
	
	this.addTune = function(obj){
		this.tunesArr.push(obj);
	}
	
	this.addTunes = function(arr){
		for(var i in arr)
			this.tunesArr.push(arr[i]);
	}
	
	this.tempSpacer = $('<span name=tempSpacer style="border:1px solid gray;"> - -&nbsp;</span>')
	
	this.show = function(){
		var _this = this;
		
		for(var i in this.tunesArr){
			var tune = this.tunesArr[i];
			var elem = document.createElement('span');
			$(this.tunesBox).append(elem).append(this.newSpacer())
			
			try{
				colorCodeTune(elem, tune);
			}catch(e){alert(e.message);alert(tune)}
			
			$(elem).html(tune.title)
				.attr('itemId', tune.id)
				.addClass('setDeveloperTune')
				.mousedown(function(){
					// drag and drop
					var tuneDiv = $(this);
					var originParent = $(this).parent();
					
					function moveTune(e){
						var boolIsInSet = false;
						$("[name=setDiv]").each(function(){
							if(mouseIsInElem(e, $(this).get(0), {top:0,right:10,bottom:0,left:10})){
								$(this).find('[itemId]').each(function(){
									
									if(mouseIsInInsertRange(e, $(this).get(0), 'right', 10)){
										_this.tempSpacer.insertAfter($(this));
										boolIsInSet = true;
										return false;
									}		
								})
							}
						})
						if(!boolIsInSet)
							$('[name=tempSpacer]').remove();
					}
					
					function dropTune(e){
						$(document.body).unbind('mousemove', moveTune);
						$(document.body).unbind('mouseup', dropTune);
						
						if(e.target == _this.setsBox){
							_this.createSetDiv(tuneDiv);
						}
						if(e.target == _this.tunesBox){
							$(_this.tunesBox).append(tuneDiv);
						}
						if($(e.target).attr('name') == 'setDiv' || $(e.target).attr('name') == 'tempSpacer'){
							var set = $(e.target);
							if(set.attr('name') != 'setDiv')
								set = set.parents('[name=setDiv]')
							_this.appendTuneToSet(tuneDiv.get(0), set.get(0), e)
						}
						if(originParent.attr('name') == 'setDiv'){ 
							_this.formatSet(originParent);
						}
						
						// adjust sets box height if getting crowded
						var height = 0;
						$(_this.setsBox).find('[name=setDiv]').each(function(){height += $(this).get(0).offsetHeight})
						if(height + 17 > _this.setsBox.offsetHeight)
							_this.setsBox.style.height = parseInt(_this.setsBox.style.height) + 17;
					}
					$(document.body).bind('mousemove', moveTune);
					$(document.body).bind('mouseup', dropTune);
				})
			
		}
	}
	
	this.appendTuneToSet = function(tune, set, event){
		if($(set).find('[name=tempSpacer]').length)
			$(set).find('[name=tempSpacer]').first().replaceWith(tune);
		else
			set.appendChild(tune);
			
		this.formatSet($(set));
	}
	
	
	this.formatSet = function(set){
		// ensure proper separators
		set.find('[name=separator]').remove().end()
			.find('[itemId]').each(function(){
				$('<span name=separator>/</span>').insertBefore(set.find('[itemId]').next('[itemId]'));
			})
	
		// if no tunes in set, just remove set div
		if(set.find('[itemId]').length == 0)
			set.remove();
	}
	
	
	this.createSetDiv = function(tuneDiv){
		var setDiv = document.createElement('div');
		$(setDiv).addClass('setDeveloperSet')
			.attr('name', 'setDiv')
			.append(tuneDiv.detach())
			.mousemove(function(){

			})
		this.setsBox.appendChild(setDiv);

	}
	
	this.newSpacer = function(){
		var span = document.createElement('span');
		span.innerHTML = '&nbsp;';
		return span;
	}
	
	
	this.close = function(){
		CBParentElement(this.box).removeChild(this.box)
		delete this;
	}
	
}
