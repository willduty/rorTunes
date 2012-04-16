class TuneSetsController < ApplicationController
  def index
	@title = 'Sets'
	@sets = TuneSet.all
  end

  def add
  	newTuneSet = TuneSet.create(params[:tune_set])
  	newTuneSet.save
  	newItem = Item.create(:itemable_id=>newTuneSet.id, :itemable_type=>'TuneSet', :user_id=>session[:user_cookie])
  	redirect_to "/tune_sets"
  end

  def delete
  	set = TuneSet.find_by_id(params[:id])
  	item = Item.find_by_itemable_id(set.id, :conditions => {:itemable_type => 'TuneSet'})
  	group_item = GroupItem.find_by_itemable_id(set.id, :conditions => {:itemable_type => 'TuneSet'})
  	set.destroy
  	item.destroy
  	if !group_item.nil?
  		group_item.destroy
  	end
  	redirect_to "/tune_sets"
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
