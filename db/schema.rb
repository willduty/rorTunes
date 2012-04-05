# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 0) do

  create_table "abcs", :force => true do |t|
    t.binary "data"
  end

  create_table "config", :id => false, :force => true do |t|
    t.string "name"
    t.string "value"
  end

  create_table "favorites", :force => true do |t|
    t.string "fkItem",    :limit => 45
    t.string "itemType",  :limit => 45
    t.date   "entryDate"
  end

  create_table "group_items", :id => false, :force => true do |t|
    t.integer "group_id"
    t.integer "itemable_id"
    t.integer "itemable_typebackup",               :default => 1
    t.integer "priority",                          :default => 1
    t.string  "itemable_type",       :limit => 45,                :null => false
  end

  create_table "groups", :force => true do |t|
    t.string  "title"
    t.date    "entryDate"
    t.integer "priority",  :default => 1
    t.integer "status",    :default => 1
  end

  create_table "items", :force => true do |t|
    t.integer "user_id"
    t.string  "itemable_id",   :limit => 45
    t.string  "itemable_type", :limit => 45, :default => "Tune", :null => false
  end

  create_table "keys", :force => true do |t|
    t.string  "title"
    t.boolean "isCommon"
  end

  create_table "keys_tunes", :id => false, :force => true do |t|
    t.integer "tune_id"
    t.integer "key_id"
  end

  create_table "other_titles", :force => true do |t|
    t.string  "title",  :null => false
    t.integer "fkTune", :null => false
  end

  create_table "resources", :force => true do |t|
    t.integer "resourceType"
    t.string  "title"
    t.binary  "url"
    t.binary  "localFile"
    t.binary  "comments"
    t.date    "entryDate"
    t.integer "priority"
    t.integer "status",       :default => 1
    t.binary  "thumbnail"
  end

  create_table "resources_tunes", :id => false, :force => true do |t|
    t.integer "fkTune"
    t.integer "fkResource"
  end

  create_table "tune_sets", :force => true do |t|
    t.string  "tuneIds"
    t.integer "flagged",   :limit => 1
    t.date    "entryDate"
    t.integer "status",                 :default => 1
  end

  create_table "tune_types", :force => true do |t|
    t.string "title"
    t.string "color", :limit => 45
  end

  create_table "tune_types_tunes", :id => false, :force => true do |t|
    t.integer "tune_id"
    t.integer "tune_type_id"
  end

  create_table "tunes", :force => true do |t|
    t.string  "title"
    t.binary  "comments"
    t.integer "parts"
    t.boolean "isActive"
    t.date    "entryDate"
    t.date    "lastUpdate"
    t.integer "status",     :default => 0
  end

  create_table "users", :force => true do |t|
    t.string   "email",                       :null => false
    t.string   "username"
    t.string   "password"
    t.datetime "createDate"
    t.date     "lastUpdate"
    t.integer  "userType"
    t.string   "firstName"
    t.string   "lastName"
    t.datetime "lastLogin"
    t.integer  "status"
    t.integer  "fkUserGroup"
    t.string   "initialIPAddr", :limit => 45
  end

  create_table "usersettings", :force => true do |t|
    t.integer "fkUser",               :null => false
    t.string  "name",   :limit => 45, :null => false
    t.string  "page",   :limit => 45
    t.string  "value",                :null => false
  end

end
