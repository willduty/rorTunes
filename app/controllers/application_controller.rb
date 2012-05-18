class ApplicationController < ActionController::Base
  
  protect_from_forgery 
  
  
  def toggle_status_bit(model_obj, bit)  
    	ts = model_obj.find_by_id(params[:id])  
    	bit = bit.to_i 
  	ts.status & bit ? ts.status ^= bit : ts.status |= bit # flip bit
  	ts.save  
  end
  
  
  def make_rand_token(length)
  	chars =  [('a'..'z'),('A'..'Z'),(0..9)].map{|i| i.to_a}.flatten
	return (0..length-1).map{ chars[rand(chars.length)]  }.join
  end
  
end

