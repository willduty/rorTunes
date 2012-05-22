class ChangePasswordFieldToText < ActiveRecord::Migration
  def up
  	change_column :users, :email, :text
  	change_column :users, :username, :text
  	change_column :users, :password, :text
  	change_column :users, :initialIPAddr, :text
  	change_column :users, :activation_token, :text
  	remove_column :users, :firstName
  	remove_column :users, :lastName
  	
  end

  def down
  end
end
