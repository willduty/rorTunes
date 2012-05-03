	
function RorLink(){			
}


RorLink.prototype = {
	doRorLink : function(url, method){
		var form = RorLink.prototype.getRorLinkForm.apply(this, Array.prototype.slice.call(arguments))
		// go
		$(form).appendTo(document.body).submit();
	
	},

	getRorLinkForm : function (url, method){
		try{
		// create form with "indicated" method 
		var form = $("<form method=post action='"+url+"'><input type=hidden name=_method value='"+method+"' />"+
			"<input type=hidden name=authenticity_token value='"+$('[name=csrf-token]').attr('content') + "' /></form>")
	
		// additional data fields
		for(var i=2; i<arguments.length; i++){
			var val = arguments[i].value.toString().replace(/\"/g, "&quot;");
			form.append("<input type=hidden name='"+arguments[i].name+"' value=\""+val+"\"></input>")
		}
		}catch(e){alert('bad ror form json: '+e)}

		return form.get(0);
	}
}



