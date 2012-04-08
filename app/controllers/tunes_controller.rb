class TunesController < ApplicationController
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
  	@newTune = Tune.create(params[:tune])
  	@newTune.save 
  	@newItem = Item.create(:itemable_type => 'Tune', :user_id => session[:user_cookie], :itemable_id => @newTune.id) 
  	redirect_to '/tunes'
  end

  def delete

  	redirect_to '/tunes'
  end
end
