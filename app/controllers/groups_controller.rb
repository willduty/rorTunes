class GroupsController < ApplicationController
  def index
	
  end

  def add

  end

  def update
	params[:itemable_type]
	
	if params[:update_type] == 'delete_group_item'
	
		# why can't i just do: GroupItem.find(params[:group_item]) ?
		group_item = GroupItem.find_by_itemable_id( params[:group_item][:itemable_id],
								:conditions => {'itemable_type'=>params[:group_item][:itemable_type],
									'group_id'=>params[:group_item][:group_id]})
		group_item.delete
	else
		# should be able to: load group, 
		# add group item to group_items and have it save the group items no?
		GroupItem.create(params[:group_item])
	end
  	redirect_to params[:redirect]
  end

  def delete
  end
  
end
