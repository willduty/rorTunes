# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
RorTunes::Application.initialize!


config.action_mailer.delivery_method = :smtp


ActionMailer::Base.smtp_settings = {
  :address  => "smtp.gmail.com",
  :port  => 25,
  :user_name  => "wduty_2012@gmail.com",
  :password  => "tester11",
  :authentication  => :login
}

config.action_mailer.raise_delivery_errors = true
