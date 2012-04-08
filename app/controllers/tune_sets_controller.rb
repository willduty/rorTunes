class TuneSetsController < ApplicationController
  def index
	@title = 'Sets'
	@sets = TuneSet.all
  end

  def add
  	@newTuneSet = TuneSet.create(params[:tune_set])
  	@newTuneSet.save
  	@newItem = Item.create(:itemable_id=>@newTuneSet.id, :itemable_type=>'TuneSet', :user_id=>self.userId)
  	redirect_to "tune_sets"
  end

  def delete
  	@set = TuneSet.find_by_id(params[:id])
  	@item = Item.find_by_itemable_id(@set.id, :conditions => {:itemable_type => 'TuneSet'})
  	@set.destroy
  	@item.destroy
  	redirect_to "/tune_sets"
  end
end
