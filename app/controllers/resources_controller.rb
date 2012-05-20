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

		#File.delete Rails.root.join('public', res.local_file)
		AWS.config(
			:access_key_id => ENV['AWS_ACCESS_KEY_ID'], 
			:secret_access_key => ENV['AWS_SECRET_ACCESS_KEY']
		)
		s3 = AWS::S3.new

		s3.buckets['rorTunes-assets'].objects[Pathname.new(localfile).basename].delete	
	
  	rescue
  		#file not found	
  		flash[:error] = 'resource file delete failed'
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
  
  
  # for resource with a file attachment
  def upload

  	@user_id = session[:user_cookie]
  	if @user_id.nil?
  		return
  	end
  	
  	@upload_file = params[:resource][:file]
  	@savename = make_rand_token(20) + '_'+ File.basename(@upload_file.original_filename)
  	
  	@resource = Resource.new
  	
	# todo, problem with saving incoming form value, unicode/ascii issue?
  	# @resource.title = params[:resource][:title] 
  	@resource.title = 'sheetmusic'
  	
  	@resource.resource_type = Resource::RESOURCE_TYPE_SHEETMUSIC
  	@resource.url = '[user upload] ' + File.basename(@upload_file.original_filename)
 
  	@resource.local_file = 'https://s3.amazonaws.com/rorTunes-assets/' + @savename 
  	
  	@resource.tunes << Tune.find_by_id(params[:resource][:tune][:id])
  	
  	
  	# write file to amazon s3 storage
  	AWS.config(
	  :access_key_id => ENV['AWS_ACCESS_KEY_ID'], 
	  :secret_access_key => ENV['AWS_SECRET_ACCESS_KEY']
	)
  	s3 = AWS::S3.new	
	s3.buckets['rorTunes-assets'].objects[@savename].write(@upload_file.tempfile, :acl=>:public_read) 	
	
	# save the resource and associated item
  	begin
	  	@resource.save
	rescue
		flash[:error] = "Could not save resource"
		
		if params.has_key? :redirect 
			redirect_to params[:redirect]
		end
		return
  	end

	begin  		 
		Item.create(:itemable_id=>@resource.id, :itemable_type=>'Resource', :user_id=>session[:user_cookie])
		flash[:notice] = 'new sheetmusic uploaded'
		
		params.has_key?(:redirect) ? (redirect_to params[:redirect]) : (render :json => @resource)
  		
  		return
  	rescue 
  		@resource.destroy
  		flash[:error] = "Could not complete resource save"
  	end
	  	
  
  end
  
  
end


