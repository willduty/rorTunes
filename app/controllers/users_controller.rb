class UsersController < ApplicationController

  layout '_no_navbar', :only => :new
  
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
		UserMailer.confirm_email(@new_user).deliver
	  	redirect_to '/thankyou'
  	else
  		flash[:error] = @new_user.errors[:email]
  		redirect_to :action=>:new
  		return
  	end
  end

  def change_password
  	user = User.find_by_id(session[:user_cookie])
  	if(params[:old_password] != user.password)
  		flash[:error] = 'The current password you entered is invalid'
  		redirect_to params[:redirect]
  	else
	  	user.password = params[:new_password] 
	  	if user.save 
	  		flash[:notice] = 'new password saved'
	  	end 
	  	redirect_to params[:redirect]
  	end
  	
  end

  def destroy
  	user = User.find_by_id(params[:id])
  	
  	usergroup = UserGroup.find_by_id(user.user_group_id)
  	if usergroup.title == 'admin'
  		flash[:error] = 'You can\'t delete this account. It is an admin.'
  	else
  		user.destroy
  	end
  	redirect_to params[:redirect] 
  end
  
  
end

