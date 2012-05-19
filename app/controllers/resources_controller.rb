class ResourcesController < ApplicationController

layout '_no_navbar', :only => [:search_youtube, :generic_search, :upload_sheetmusic, :show_comhaltas_video]

respond_to :html, :json
 
  def index
	@title = 'Resources'
	@resources = Resource.all
  end

  def create
  	resource = Resource.new(params[:resource])
  	if resource.save
  		Item.create(:itemable_id=>resource.id, :itemable_type=>'Resource', :user_id=>session[:user_cookie])
  		if params.has_key?(:tune_id)
  			resource.tunes << Tune.find_by_id(params[:tune_id]) 
  		end
  	end
  	render :json => resource
  end


  def update
  	Resource.update(params[:resource][:id], params[:resource])
	redirect_to params[:redirect]
  end



  def destroy
  	res = Resource.find_by_id(params[:id])
  	item = Item.find_by_itemable_id_and_itemable_type(params[:id], 'Resource')
  	
  	# delete upload file if exists
  	localfile = res.local_file

  	begin
  		File.delete Rails.root.join('public', res.local_file)
  	rescue
  		#file not found	
  	end
  	
  	res.destroy
  	item.destroy unless item.nil? 
  		
	redirect_to params[:redirect]
  end
  
  
  def search_youtube
  	@resource = Resource.new
  end
  
  
  def new_sheetmusic
  	@resource = Resource.new
  	tune = Tune.find_by_id params[:tune_id]
  	@resource.tunes << tune	
	respond_with @resource do |format|
		format.html { render :layout => false}
	end
  end
  
  
  def upload_sheetmusic
  
  	@user_id = session[:user_cookie]
  	if @user_id.nil?
  		return
  	end
  	
  	@upload_file = params[:resource][:file]
  	@savename = make_rand_token(20) + '_'+ File.basename(@upload_file.original_filename)
  	
  	@resource = Resource.new
  	@resource.title = params[:resource][:title]
  	@resource.resource_type = Resource::RESOURCE_TYPE_SHEETMUSIC
  	@resource.url = '[user upload] ' + File.basename(@upload_file.original_filename)
  	
	  	
	#begin
	#	Dir::mkdir(Rails.root.join('public', 'uploads'))
	#	Dir::mkdir(Rails.root.join('public', 'uploads', @user_id.to_s))
	#rescue
	#
	#end 
	
	
  	#@resource.local_file = '/uploads/' + (@user_id.to_s) + '/' + @savename
  	@resource.local_file = 'http://www.google.com/images/srpr/logo3w.png'
  	
  	
  	@resource.tunes << Tune.find_by_id(params[:resource][:tune][:id])
  	
  	
  	#replace with write to amazon s3
  	#File.open Rails.root.join('public', 'uploads', @user_id.to_s, @savename), 'wb' do |file|
  	#	file.write(@upload_file.read)
  	#end
  	
  	begin
	  	if @resource.save
 			Item.create(:itemable_id=>@resource.id, :itemable_type=>'Resource', :user_id=>session[:user_cookie])
 			
	  	end
	  	
	rescue
		flash[:error] = 'problem here'
  	end
  
  	redirect_to params[:redirect]
  
  end
  
  
end


