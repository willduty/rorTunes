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

  def logout
	#session destroy
	#redirect to login
  end

end