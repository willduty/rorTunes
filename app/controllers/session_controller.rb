class SessionController < ApplicationController

  layout '_no_navbar', :only => :login

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
  	@user = User.authenticate(params[:session][:email], params[:session][:password])
  	if @user.nil?
  		flash[:error] = 'bogus or errant login'
  	else
  		@user_group = UserGroup.find_by_id(@user.user_group_id)
  		if @user_group.title == 'user_unconfirmed' 
	  		flash[:error] = 'You have created an account but not confirmed it. 
	  			Check for an email from users@mytunespage.com and see the reply instructions.'
	  	else
	  		#set up session
	  		@user.lastLogin = Date.today 
	  		@user.save
	  		session[:user_cookie] = @user.id
	  		redirect_to '/home'
	  		return
	  	end
  	end
  	redirect_to :action=>'login'
  	
  end


  def logout
	# destroy session and redirect to login
	session[:user_cookie] = nil
	redirect_to '/'
  end

end
