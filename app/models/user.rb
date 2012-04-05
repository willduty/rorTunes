class User < ActiveRecord::Base
	has_many :items
	has_many :tunes, :through => :items, :source => :itemable, :source_type => 'Tune'
	has_many :tune_sets, :through => :items, :source => :itemable, :source_type => 'TuneSet'
	has_many :resources, :through => :items, :source => :itemable, :source_type => 'Resource'
	has_many :groups, :through => :items, :source => :itemable, :source_type => 'Group'
end
