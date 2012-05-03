class Item < ActiveRecord::Base

	has_many :favorites, :dependent => :destroy
	belongs_to :user
	belongs_to :itemable, :polymorphic => true
	
	
end

