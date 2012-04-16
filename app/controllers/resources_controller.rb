class ResourcesController < ApplicationController
  def index
	@title = 'Resources'
	@resources = Resource.all
  end

  def add
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
end
