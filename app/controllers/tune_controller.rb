class TuneController < ApplicationController
  def index
	@title = 'Tunes'
	@tunes = Tune.find(:all, :include => [:keys, :tune_types])
	@keys = Key.all
  end

  def show
  	@tune = Tune.find_by_id(params[:id])
  end

  def add
  end

  def delete
  end
end
