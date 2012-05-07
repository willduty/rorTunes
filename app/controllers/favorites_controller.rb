class FavoritesController < ApplicationController
  
  def create
  	item = Item.find_by_itemable_id_and_itemable_type(params[:favorite][:itemable_id], params[:favorite][:itemable_type])
	favorite = Favorite.create(:item_id=>item.id)
  	
  	Item.create(:itemable_type => 'Favorite', :user_id => session[:user_cookie], :itemable_id => favorite.id) 
  	redirect_to params[:redirect]
  end

  def destroy
  	favorite = Favorite.find_by_id(params[:id])
	favorite.destroy
	item = Item.find_by_itemable_id_and_itemable_type(favorite.id, 'Favorite')
	item.destroy
  	redirect_to params[:redirect]
  end
  
end
