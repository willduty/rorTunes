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
  end


  def add
	@params = params[:user]
	@email = params[:user][:email]

  	params[:user].delete(:password2)
	
	@new_user = User.create(params[:user])
		
	if @new_user.valid?
	  	redirect_to '/thankyou'
  	else
  		flash[:error] = @new_user.errors[:email]
  		redirect_to :action=>:new
  		return
  	end
  end

  def delete 
  end
  
  
end

