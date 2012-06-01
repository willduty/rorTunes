RorTunes::Application.routes.draw do

resources :tunes
post "tunes/add_multiple"
put "tunes/dissassociate_resource/:tune_id/:resource_id", :to=>"tunes#dissassociate_resource"
delete "tunes/delete_other_title/:id", :to => "tunes#delete_other_title" # todo, should go in other_titles controller

get "resources/search_youtube"
get "resources/generic_search"
get "resources/new_sheetmusic"
get "resources/show_comhaltas_video"
get "resources/search_session_dot_org"
post "resources/download"
post "resources/upload"
resources :resources

put 'tune_sets/toggle_status/:id/:status_bit', :to=>'tune_sets#toggle_status'
post 'tune_sets/add_new_sets_to_group'
resources :tune_sets

resources :groups
put "groups/reorder", :to=>"groups#reorder"
put 'groups/toggle_status/:id/:status_bit', :to=>'groups#toggle_status'
put 'groups/unflag_items/:id/:itemable_type', :to=>'groups#unflag_items'

post "group_items/add"
put "group_items/update"
delete "group_items/delete/:id", :to =>"group_items#delete"
delete "group_items/delete/:group_id/:type", :to =>"group_items#delete"


post "users/add"
put "users/change_password"
put "users/update_user_settings"
delete "users/destroy/:id", :to => 'users#destroy'
match "home", :to=>"users#index"
match "register", :to=>"users#new"
match "activate/:token", :to=>"users#activate"

get 'session/login'
post 'session/create'
delete 'session/logout'

resources :favorites

put 'items/toggle_flag/:id/:type', :to=>'items#toggle_flag'

match '/tools' => 'pages#tools'
match '/get_abc' => 'pages#get_abc'
match '/admin' => 'pages#admin'


root :to => 'session#login'


  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
