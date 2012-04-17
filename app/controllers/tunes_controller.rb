class TunesController < ApplicationController

  def index
	@title = 'Tunes'
	@tunes = Tune.find(:all, :include => [:keys, :tune_types])
	@keys = Key.all
	@newTune = Tune.new
	
	@google_html = HTTParty.get("http://google.com") #testing
  end


  def show
  	@tune = Tune.find_by_id(params[:id])
  end
  

  def add
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
  	newTune = Tune.create(tune)
  	newTune.save 
  	Item.create(:itemable_type => 'Tune', :user_id => session[:user_cookie], :itemable_id => newTune.id) 
  end


  def update
  	id = params[:id]
  	if(params[:tune][:other_title])
  		params[:tune][:other_title][:tune_id] = id # just in case
  		other_title = OtherTitle.create(params[:tune][:other_title])
  	else	
  		tune = Tune.find_by_id(id)
  		tune.update_attributes(params[:tune])
  		tune.save
  	end
  	redirect_to '/tunes/' + id
  end


  def delete
  	tune = Tune.find_by_id(params[:id])
  	item = Item.find_by_itemable_id_and_itemable_type(params[:id], 'Tune')
  	tune.destroy
  	item.destroy
  	redirect_to '/tunes'
  end
  
  
  def delete_other_title
  	ot = OtherTitle.find_by_tune_id_and_title(params[:id], params[:title])
  	ot.destroy
  	redirect_to params[:redirect]
  end
  
  def dissassociate_resource
  	join = ResourceTune.find_by_tune_id_and_resource_id(params)
  	join.destroy
  	redirect_to params[:redirect]
  end
  
  
  
end
