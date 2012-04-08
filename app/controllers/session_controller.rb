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
  	@user = User.authenticate(params[:session][:username], params[:session][:password])
  	if @user.nil?
  		# set flash here
  		flash[:error] = 'bogus or errant login'
  		redirect_to :action=>'login'
  	else
  		#set up session here
  		session[:user_cookie] = @user.id
  		redirect_to '/home'
  	end
  end


  def logout
	# destroy session and redirect to login
	session[:user_cookie] = nil
	redirect_to '/'
  end

end
