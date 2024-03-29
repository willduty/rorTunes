class Tune < ActiveRecord::Base
	has_and_belongs_to_many :keys
	has_and_belongs_to_many :tune_types
	has_and_belongs_to_many :resources
	has_many :other_titles, :dependent=>:destroy
	
#	has_and_belongs_to_many :users, :join_table => :items, :foreign_key => 'itemable_id',
#			:conditions => proc { ["items.itemable_type = ?", "Tune"] }
	
	accepts_nested_attributes_for :keys, :tune_types
	
	before_save :init_data
	def init_data
		self.entryDate ||= Date.today if new_record?
		self.lastUpdate ||= Date.today if new_record?
	end


end
