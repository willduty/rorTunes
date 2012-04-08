class SessionController < ApplicationController
  def index
	userid = 1;
	unless params[:id].nil?
		userid = params[:id];
	end
  	@user = User.find(userid)
	@title = @user.email	
  end

  def login
  end
  
  def create
  	@user = User.find_by_password(params[:session][:password])
  	if @user.nil?
  		# set flash here
  		flash[:error] = 'bogus or errant login'
  		redirect_to :action=>'login'
  	else
  		#set up session here
  		self.userId = @user.id
  		redirect_to '/home'
  	end
  end

  def logout
	#session destroy here
	
	#redirect to login
	redirect_to '/'
  end

end
