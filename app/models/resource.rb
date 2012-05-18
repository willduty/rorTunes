class Resource < ActiveRecord::Base
	
	has_and_belongs_to_many :tunes
	
	before_save :init_data
	def init_data
		self.entryDate ||= Date.today if new_record?
	end
	
	RESOURCE_TYPE_SHEETMUSIC = 1
	RESOURCE_TYPE_VIDEO = 2
	RESOURCE_TYPE_AUDIO = 3
	RESOURCE_TYPE_LINK_VIDEO = 10
	RESOURCE_TYPE_LINK_YOUTUBE = 11
	RESOURCE_TYPE_LINK_AUDIO_FILE = 12
	RESOURCE_TYPE_LINK_COMHALTAS_FLV = 13

end
