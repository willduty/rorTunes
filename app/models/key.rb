class Key < ActiveRecord::Base
	has_and_belongs_to_many :tunes
end
