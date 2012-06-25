	
function RorLink(){
}


RorLink.prototype = {
	doRorLink : function(url, method){
		var form;
		try{
			form = RorLink.prototype.getRorLinkForm.apply(this, Array.prototype.slice.call(arguments))
		} catch(e){
			throw 'failed to create form. error msg: ' + e;
			return null;
		}

		// go
		$(form).appendTo(document.body).submit();	
	},

	getRorLinkForm : function (url, method){
	
		// the code should create a js variable AUTH_TOKEN at the server
		// else the csrf_token tag is searched for but this may not be consistent 
		// for future ror versions
		var auth_token = (typeof AUTH_TOKEN != 'undefined') ? AUTH_TOKEN : 
			$('[name=csrf-token]').attr('content');
		if(typeof auth_token == 'undefined' || !auth_token){
			throw 'Could not get auth token.';
			return null;
		}
			 
		try{
		// create form with "indicated" method 
		var form = $("<form method=post action='"+url+"'><input type=hidden name=_method value='"+method+"' />"+
			"<input type=hidden name=authenticity_token value='"+auth_token+ "' /></form>")
	
		// additional data fields
		for(var i=2; i<arguments.length; i++){
			var val = arguments[i].value.toString().replace(/\"/g, "&quot;");
			form.append("<input type=hidden name='"+arguments[i].name+"' value=\""+val+"\"></input>")
		}
		}catch(e){
			throw 'bad ror form json: ' + e;
		}

		return form.get(0);
	}
}



