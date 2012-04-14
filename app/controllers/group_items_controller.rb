class GroupItemsController < ApplicationController
  def index
  end

  def update
  end

  def add
	GroupItem.create(params[:group_item])
  	redirect_to params[:redirect]
  end

  def delete
  	group_item = GroupItem.find_by_itemable_id(params[:group_item][:itemable_id],
						:conditions => {'itemable_type'=>params[:group_item][:itemable_type],
								'group_id'=>params[:group_item][:group_id]})
	group_item.delete
  	redirect_to params[:redirect]
  end
  
end
