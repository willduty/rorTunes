class TuneSetController < ApplicationController
  def index
	@title = 'Sets'
	@sets = TuneSet.all
  end

  def add
  end

  def delete
  	@set = TuneSet.find_by_id(params[:id])
  	@item = Item.find_by_itemable_id(@set.id, :conditions => {:itemable_type => 'TuneSet'})
  	@set.destroy
  	@item.destroy
  	redirect_to :action => :index
  end
end
