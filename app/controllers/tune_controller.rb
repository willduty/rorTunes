class TuneController < ApplicationController
  def index
	@title = 'Tunes'
	@tunes = Tune.find(:all, :include => [:keys, :tune_types])
	@keys = Key.all
	@newTune = Tune.new
  end

  def show
  	@tune = Tune.find_by_id(params[:id])
  end

  def add
=begin  
=end  
  	@newTune = Tune.create(params[:tune])
  	@newTune.save 
  	@newItem = Item.create(:itemable_type => 'Tune', :user_id => 1, :itemable_id => @newTune.id) 
  	redirect_to :action=>'index'
  end

  def delete
  	@tune = Tune.find_by_id(params[:id])
  	@item = Item.find_by_itemable_id(params[:id])
  	@tune.destroy
  	@item.destroy
  	redirect_to :action=>'index'
  	
  end
end
