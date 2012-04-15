# identity type... a favorite is itself a (virtual) item , 
# the "item_id" column of favorite refers back to an entry in the items table
# which itself points to some "real" item like a tune, resource etc

class Favorite < ActiveRecord::Base
	has_one :item
	
	before_save :init_data
	
	def init_data
		self.entryDate ||= Date.today if new_record?
	end
	
end



