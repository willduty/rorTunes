class ResourcesController < ApplicationController

layout '_no_navbar', :only => [:search_youtube, :generic_search, :upload_sheetmusic]

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
  	res.delete
  	item.delete
	redirect_to params[:redirect]
  end
  
  def search_youtube
  	@resource = Resource.new
  end
  
  def upload_sheetmusic
  
  	@resource = Resource.new

	respond_with @resources do |format|
		format.html { render :layout => false}
	end

  end
  
  
end


