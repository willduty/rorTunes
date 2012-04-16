class Group < ActiveRecord::Base
	has_many :group_items, :dependent => :destroy 
	has_many :tunes, :source => :itemable, :through => :group_items, :source_type => 'Tune'
	has_many :tune_sets, :source => :itemable, :through => :group_items, :source_type => 'TuneSet'
	
	belongs_to :user
	
	
	before_save :init_data
	def init_data
		self.entryDate ||= Date.today if new_record?  	
		self.priority ||= 1 if new_record?
		self.status ||= 1 if new_record?
	end
	
end
