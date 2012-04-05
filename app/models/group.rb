class Group < ActiveRecord::Base
	has_many :group_items
	has_many :tunes, :source => :itemable, :through => :group_items, :source_type => 'Tune'
	has_many :tune_sets, :source => :itemable, :through => :group_items, :source_type => 'TuneSet'
end
