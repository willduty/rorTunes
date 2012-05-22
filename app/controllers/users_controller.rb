class UsersController < ApplicationController

  layout '_no_navbar', :only => [:new, :activate]
  
  def index
	userId = session[:user_cookie];
	unless params[:id].nil?
		userId = params[:id];
	end
  	@user = User.find(userId)
	@title = @user.email
  end


  def new
  	@new_user = User.new
  end


  def add
  
	@params = params[:user]
	@email = params[:user][:email]

  	#validate user...
	if User.find_by_email @email
		flash[:error] = 'Email already exists. '+
			'If you have already registered you can get your password through the forgot password'
  		redirect_to '/register'
  		return	
	end

  	params[:user].delete(:password2)
	
	# set up new user with activation token and 
	# initial status unconfirmed
	@new_user = User.new(params[:user])
	@new_user.activation_token = make_rand_token(40)
	@new_user.user_group_id = 3
	@new_user.save
	
	if @new_user.valid?
		UserMailer.registration_email(@new_user).deliver
	  	redirect_to '/thankyou'
  	else
  		flash[:error] = @new_user.errors[:email]
  		redirect_to :action=>:new
  		return
  	end
  end
  
  
  def activate
  	user = User.find_by_activation_token params[:token]
  	@token = params[:token]
  	user.user_group_id = 2
  	@activated = user.save ? true : false
  	
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
  	
  	if usergroup.nil?
  		user.destroy
  	elsif usergroup.title == 'admin'
  		flash[:error] = 'You can\'t delete this account. It is an admin.'
  	else
  		user.destroy
  	end
  	redirect_to params[:redirect] 
  end
  
  
end


