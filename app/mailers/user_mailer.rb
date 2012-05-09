
class UserMailer < ActionMailer::Base
  def confirm_email(user)
   # recipients "#{user.username} <#{user.email}>"
    recipients "#{user.username} <willduty@yahoo.com>"
    from       "My Tunespage"
    subject    "Please activate your new account"
    sent_on    Time.now
    body       { :user => user, :url => 'Thanks for registering to mytunespage. You can login now.' }
  end
end


