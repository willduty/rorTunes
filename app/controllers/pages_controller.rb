class PagesController < ApplicationController

	def tools
	
	end

	def get_abc
		t = Test.new
		render :json => t
	end

end



class Test
	def initialize
		@test = 7
	end
	def test=(val)
		@test = val
	end

	def test
		@test
	end	
	
	def new_abc
		g = Gruff::Line.new
		g.title = "My Graph" 

		g.data("Apples", [1, 2, 3, 4, 4, 3])
		g.data("Oranges", [4, 8, 7, 9, 8, 9])
		g.data("Watermelon", [2, 3, 1, 5, 6, 8])
		g.data("Peaches", [9, 9, 10, 8, 7, 9])

		g.labels = {0 => '2003', 2 => '2004', 4 => '2005'}

		g.write('my_fruity_graph.png')	
	end
	
end


