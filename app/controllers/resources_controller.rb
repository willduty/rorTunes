class ResourcesController < ApplicationController
  def index
	@title = 'Resources'
	@resources = Resource.all
  end

  def add
  	resource = Resource.new(params[:resource])
  	if resource.save
  		resource.tunes << Tune.find_by_id(params[:tune_id])
  		Item.create(:itemable_id=>resource.id, :itemable_type=>'Resource', :user_id=>session[:user_cookie])
  	end
  	render :json => resource
  end

  def update
  	Resource.update(params[:resource][:id], params[:resource])
	redirect_to params[:redirect]
  end

  def delete
  	res = Resource.find_by_id(params[:id])
  	item = Item.find_by_itemable_id_and_itemable_type(params[:id], 'Resource')
  	res.delete
  	item.delete
  	redirect_to '/resources'
  end
  
  def search_youtube
  	@resource = Resource.new
  end
end
