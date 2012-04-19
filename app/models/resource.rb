class Resource < ActiveRecord::Base
	
	has_and_belongs_to_many :tunes
	
	before_save :init_data
	def init_data
		self.entryDate ||= Date.today if new_record?
	end

end
