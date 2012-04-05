class TuneSetController < ApplicationController
  def index
	@title = 'Sets'
	@sets = TuneSet.all
  end

  def add
  end

  def delete
  end
end
