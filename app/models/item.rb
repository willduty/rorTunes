class Item < ActiveRecord::Base
	belongs_to :user
	belongs_to :itemable, :polymorphic => true
	#has_one :tune
	
end

