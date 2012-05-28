class TuneSetsController < ApplicationController

  def index
	@title = 'Sets'
	@sets = TuneSet.all
  end


  def create
  	newTuneSet = TuneSet.create(params[:tune_set])
  	newTuneSet.save
  	newItem = Item.create(:itemable_id=>newTuneSet.id, :itemable_type=>'TuneSet', :user_id=>session[:user_cookie])
  	
  	if params.has_key?(:group_id)
  		GroupItem.create(:group_id=>params[:group_id], :itemable_id=>newTuneSet.id, :itemable_type=>'TuneSet', :priority =>0)	
  	end
  	
  	redirect_to "/tune_sets"
  end


  def add_new_sets_to_group
  
  	group = Group.find_by_id(params[:group][:id])
  	params[:set].each do |s|
  		#create each set, connect it to group and to items
  		set = TuneSet.create(s)
  		GroupItem.create(:group_id=>group.id, :itemable_id=>set.id, :itemable_type=>'TuneSet', :priority =>0)
  		Item.create(:user_id=>session[:user_cookie], :itemable_id=>set.id, :itemable_type=>'TuneSet')
  		
  	end
  	redirect_to "/groups"
	
  end


  def destroy
  	ids = params[:id].split(',').uniq.each {|id| destroy_set(id)}
  	redirect_to params[:redirect]
  end
  
  
  def destroy_set(id)
  	set = TuneSet.find_by_id(id)
  	item = Item.find_by_itemable_id(set.id, :conditions => {:itemable_type => 'TuneSet'})
  	group_item = GroupItem.find_by_itemable_id(set.id, :conditions => {:itemable_type => 'TuneSet'})
  	set.destroy
  	item.destroy
  	if !group_item.nil?
  		group_item.destroy
  	end  
  end
  
  
  
  
  def update
  	TuneSet.update(params[:id], params[:tune_set])
  	redirect_to params[:redirect]
  end
  
  def toggle_status
	toggle_status_bit(TuneSet, params[:status_bit])
	redirect_to params[:redirect]
  end
  
  
end
