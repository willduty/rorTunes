class ResourceController < ApplicationController
  def index
	@title = 'Resources'
	@resources = Resource.all
  end

  def add
  end

  def delete
  end
end
