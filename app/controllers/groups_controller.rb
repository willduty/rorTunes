class GroupsController < ApplicationController
  def index
	
  end

  def create
	group = Group.create(params[:group])
	Item.create(:itemable_id=>group.id, :itemable_type=>'Group', :user_id=>session[:user_cookie])
	redirect_to params[:redirect]
  end

  def reorder
  	# update the order of groups (for current user)
	ids = params[:group_ids].split(',').map{|s| s.to_i}
	ctr = 0
	ids.each do |id|
		group = Group.find_by_id(id)
		group.priority = ctr
		group.save
		ctr += 1
	end	
	redirect_to params[:redirect]
  end

  def update
  	Group.update(params[:group][:id], params[:group])
	redirect_to params[:redirect]
  end


  def destroy
  	id = params[:id]
  	item = Item.find_by_itemable_id_and_itemable_type(id, 'Group')
  	item.destroy
  	
  	group = Group.find_by_id(id)
  	group.destroy
  	
  	redirect_to params[:redirect]
  
  end
  
  def toggle_status
	toggle_status_bit(Group, params[:status_bit])
	redirect_to params[:redirect]
  end
  
  def unflag_items
  	group = Group.find_by_id(params[:id])
  	if params[:itemable_type] == 'TuneSet'
  		group.tune_sets.each do |ts|
  			if ts.status & 1 == 1 
  				ts.status ^= 1
  				ts.save
  			end		
  		end
  	end
  	redirect_to params[:redirect]
  end
  
end




