class TunesController < ApplicationController

  def index
	@title = 'Tunes'
	@tunes = Tune.find(:all, :include => [:keys, :tune_types])
	@keys = Key.all
	@newTune = Tune.new
	
	@google_html = HTTParty.get("http://google.com")
  end

  def show
  	@tune = Tune.find_by_id(params[:id])
  end

  def add_multiple
  
  end

  def add
  	@params = params
  	if params[:tunes]
  		json = JSON.parse params[:tunes] 
  		json["tunes"].each do |tune|
  			create_tune tune
  		end	
  	else
  		create_tune params[:tune]		
  	end 
  	redirect_to '/tunes'
  end
  
  
  def create_tune(tune)
  	@newTune = Tune.create(tune)
  	@newTune.save 
  	@newItem = Item.create(:itemable_type => 'Tune', :user_id => session[:user_cookie], :itemable_id => @newTune.id) 
  end

  def delete
  	@tune = Tune.find_by_id(params[:id])
  	@item = Item.find_by_itemable_id(params[:id])
  	@tune.destroy
  	@item.destroy
  	redirect_to '/tunes'
  end
end
