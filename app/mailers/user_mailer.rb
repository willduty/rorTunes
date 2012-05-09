
class UserMailer < ActionMailer::Base
	default :from => 'wduty2012@gmail.com'
	
	def registration_email(user)
		@user = user
		mail(:to => 'willduty@yahoo.com', :subject => "Thanks for registering to mytunespage.")	
	end
end

