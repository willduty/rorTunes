class GroupItem < ActiveRecord::Base
	belongs_to :group
	belongs_to :itemable, :polymorphic => true
end

