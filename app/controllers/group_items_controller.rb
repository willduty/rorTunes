class GroupItemsController < ApplicationController
  def index
  end

  def update
  ct = 0;
  	if params[:reorder_ids]
	  	ids = params[:reorder_ids]
	  	ids_arr = ids.split(',').map {|s| s.to_i}
	  	ctr = 1
	  	ids_arr.each do |id|
	  		gi = GroupItem.find_by_itemable_id(id)
	  		gi.priority = ctr
	  		gi.save
	  		ctr += 1
	  	end
	  	
  	elsif params[:to_group_id] # move group item to other group
  		gi = GroupItem.find(:first, :conditions=>params[:group_item])
  		gi.group_id = params[:to_group_id]
  		gi.save
  		
  
	elsif params[:new_group_title]
		new_group = Group.create(:title=>params[:new_group_title])
		new_item = Item.create(:itemable_id=>new_group.id, :itemable_type=>'Group', :user_id=>session[:user_cookie])
		gi = GroupItem.find(:first, :conditions=>params[:group_item])
  		gi.group_id = new_group.id
  		gi.save	  		
  	
	end	
  	redirect_to params[:redirect]
  
  end

  def add
  	# if group title specified, saving item to a new group. create it
  	if params.has_key?('group') && params['group'].has_key?('title')
  		group = Group.create(params['group'])	
  		Item.create(:itemable_id=>group.id, :itemable_type=>'Group', :user_id=>session[:user_cookie])
  		params['group_item']['group_id'] = group.id
  	end
  	
  	# create the group item
	GroupItem.create(params[:group_item])
  	redirect_to params[:redirect]
  end

  def delete
  
  	if params[:type] # delete all group items of :type
  		GroupItem.delete_all :itemable_type=>params[:type], :group_id=>params[:group_id]
	  else 
	  	# delete specific group item								
		group_item = GroupItem.find(:first, :conditions=>params[:group_item])					
		group_item.delete
	end
  	redirect_to params[:redirect]
  end
  
end
