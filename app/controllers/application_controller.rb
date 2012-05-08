class ApplicationController < ActionController::Base
  
  protect_from_forgery 
  
  
  def toggle_status_bit(model_obj, bit)  
    	ts = model_obj.find_by_id(params[:id])  
    	bit = bit.to_i 
  	ts.status & bit ? ts.status ^= bit : ts.status |= bit # flip bit
  	ts.save  
  end
  
end

