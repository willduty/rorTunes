
class UserMailer < ActionMailer::Base
	default :from => 'wduty2012@gmail.com'
	
	def registration_email(user)
		@user = user
		#mail(:to => user.email, :subject => "Thanks for registering to mytunespage. You can login now")
		mail(:to => 'willduty@yahoo.com', :subject => "Thanks for registering to mytunespage. You can login now")
	
	end
end

=begin
class UserMailer < ActionMailer::Base
  def confirm_email(user)
    recipients "#{user.username} <#{user.email}>"
    from       "My Tunespage"
    subject    "Please activate your new account"
    sent_on    Time.now
    body       { :user => user, :url => 'Thanks for registering to mytunespage. You can login now.' }
  end
end

=end
