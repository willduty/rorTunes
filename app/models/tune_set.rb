class TuneSet < ActiveRecord::Base

	before_save :init_data
	def init_data
		self.entryDate ||= Date.today if new_record?
		self.status = 1
	end

end
