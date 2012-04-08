RorTunes::Application.routes.draw do

get "tunes/index"
post "tunes/add"
delete "tunes/delete/:id", :to => "tunes#delete"
match "tunes/:id", :to=>'tunes#show'
match "tunes", :to =>"tunes#index"

get "resources/index"
post "resources/add"
delete "resources/delete"
match "resources", :to=>"resources#index"

get "tune_sets/index"
post "tune_sets/add"
delete "tune_sets/delete/:id", :to => "tune_sets#delete"
match "tune_sets", :to=>"tune_sets#index"

get "groups/index"
post "groups/add"
delete "groups/delete"
match "groups", :to=>"groups#index"

get "users/index"
get "users/add"
get "users/delete"
match "home", :to=>"users#index"

get 'session/login'
post 'session/create'
delete 'session/logout'



match 'user/index/:id' => 'user#index'

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
