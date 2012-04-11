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


  def new
  	@new_user = User.new
  	@new_user.email = 'bogus@bogus.com'
  end


  def add
	@params = params[:user]
  end

  def delete 
  end
  
end
