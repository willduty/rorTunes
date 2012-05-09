
class EmailValidator < ActiveModel::Validator
	def validate(record)
		validates = record[:email] =~ /^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/
		record.errors[:email] << 'BAD EMAIL' unless validates  
	end
end 


class User < ActiveRecord::Base
	belongs_to :user_groups
	
	has_many :items, :dependent=>:destroy
	has_many :tunes, :through => :items, :source => :itemable, :source_type => 'Tune', :dependent=>:destroy
	has_many :tune_sets, :through => :items, :source => :itemable, :source_type => 'TuneSet'
	has_many :resources, :through => :items, :source => :itemable, :source_type => 'Resource'
	has_many :groups, :through => :items, :source => :itemable, :source_type => 'Group'
	has_many :favorites, :through => :items, :source => :itemable, :source_type => 'Favorite'
	
	has_many :user_settings, :dependent=>:destroy
	accepts_nested_attributes_for :user_settings
	
	attr_accessible :email, :password

	validates :email, :presence => true, :email => true
	validates :password, :presence => true
	
	def self.authenticate(email, password)
		user = self.find_by_email_and_password(email, password)
		return nil unless !user.nil?
		pwd = user.password
		pwd.strip!
		return nil unless pwd == password 
		return user
	end
	
	before_save :init
	def init
		self.createDate ||= Date.today if new_record?
		self.lastUpdate ||= Date.today if new_record?
	end
	
end


