class UserMailer < ActionMailer::Base
	default :from => 'wduty2012@gmail.com'
	
	def confirm_email(user)
		@user = user
		mail(:to => user.email, :subject => "Thanks for registering to mytunespage. You can login now")
	
	end
end
