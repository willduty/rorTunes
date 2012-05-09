# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
RorTunes::Application.initialize!

ActionMailer::Base.delivery_method = :smtp

ActionMailer::Base.smtp_settings = {
  :address  => "smtp.gmail.com",
  :port  => 25,
  :domain => "gmail.com",
  :user_name  => "wduty2012@gmail.com",
  :password  => "tester11",
  :authentication  => :login
}

