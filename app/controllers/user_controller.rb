class UserController < ApplicationController
  def index
  
	userid = 1;
	unless params[:id].nil?
		userid = params[:id];
	end
  	@user = User.find(userid)
	@title = @user.email
	#@tunes = User.tunes
  end

  def login
  end

  def logout
	#session destroy
	#redirect to login
  end

  def add
  end

  def delete 
  end
end