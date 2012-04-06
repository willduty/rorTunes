class Tune < ActiveRecord::Base
	has_and_belongs_to_many :keys
	has_and_belongs_to_many :tune_types
	belongs_to :user
	
	accepts_nested_attributes_for :keys, :tune_types
	
	before_save :init_data
	def init_data
		self.entryDate ||= Date.today if new_record?
		self.lastUpdate ||= Date.today if new_record?
	end


end
