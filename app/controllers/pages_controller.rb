class PagesController < ApplicationController

	def tools	
	end

	def get_abc
	end
	
	def admin
		@users = User.find :all
	end

end



