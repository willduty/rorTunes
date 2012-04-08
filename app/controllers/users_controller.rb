class UsersController < ApplicationController
  def index
  
	userId = session[:user_cookie];
	unless params[:id].nil?
		userId = params[:id];
	end
  	@user = User.find(userId)
	@title = @user.email
	#@tunes = User.tunes
  end

  def add
  end

  def delete 
  end
  
end
