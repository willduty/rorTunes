class ApplicationController < ActionController::Base
  protect_from_forgery
  
  
  # temporary crap get rid of soon
  @@userId = 1
  def userId
  	@@userId
  end
  def userId=(value)
  	@@userId=value
  end
  
end
