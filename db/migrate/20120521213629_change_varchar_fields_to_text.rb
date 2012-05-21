class ChangeVarcharFieldsToText < ActiveRecord::Migration
  def up
  	change_column :tunes, :title, :text
  end

  def down
  end
end
