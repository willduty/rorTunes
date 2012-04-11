
class EmailValidator < ActiveModel::Validator
	def validate(record)
		validates = record[:email] =~ /^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/
		record.errors[:email] << 'BAD EMAIL' unless validates  
	end
end 


class User < ActiveRecord::Base
	belongs_to :user_groups

	has_many :items
	has_many :tunes, :through => :items, :source => :itemable, :source_type => 'Tune'
	has_many :tune_sets, :through => :items, :source => :itemable, :source_type => 'TuneSet'
	has_many :resources, :through => :items, :source => :itemable, :source_type => 'Resource'
	has_many :groups, :through => :items, :source => :itemable, :source_type => 'Group'
	
	attr_accessible :email, :password

	validates :email, :presence => true, :email => true
	validates :password, :presence => true

	def self.authenticate(email, password)
		user = self.find_by_email(email)
		return nil unless !user.nil?
		return nil unless user.password == password 
		return user
	end
end


