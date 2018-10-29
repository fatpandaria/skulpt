from turtle import *
class Pen(Turtle):
	
	# 绘制数码管间隔
	def draw_gap(self):
		self.penup()
		self.forward(5)

	# 绘制单段数码管
	def draw_line(self, draw):
		self.draw_gap()
		# 如果draw是True的话，画数码管
		if draw:
			self.pendown()
		else:
			self.penup()
		self.forward(30)
		self.draw_gap()
		# 每次画完一段数码管自动向右90度
		self.right(90)

	# 根据数字绘制七段数码管
	def draw_digit(self, d):
		# 画第一段
		if d in [2, 3, 4, 5, 6, 8, 9]:
			self.draw_line(True)
		else:
			self.draw_line(False)
		# 画第二段
		if d in [0, 1, 3, 4, 5, 6, 7, 8, 9]:
			self.draw_line(True)
		else:
			self.draw_line(False)
		# 画第三段
		if d in [0, 2, 3, 5, 6, 8, 9]:
			self.draw_line(True)
		else:
			self.draw_line(False)
		# 画第四段
		if d in [0, 2, 6, 8]:
			self.draw_line(True)
		else:
			self.draw_line(False)
		# 因为第四段和第五段是一个方向，因此需要平衡掉draw_line中的右转
		self.left(90)
		# 画第五段
		if d in [0, 4, 5, 6, 8, 9]:
			self.draw_line(True)
		else:
			self.draw_line(False)
		# 画第六段
		if d in [0, 2, 3, 5, 6, 7, 8, 9]:
			self.draw_line(True)
		else:
			self.draw_line(False)
		# 画第七段
		if d in [0, 1, 2, 3, 4, 7, 8, 9]:
			self.draw_line(True)
		else:
			self.draw_line(False)
		# 将画笔移到下个位置以便画出下个数字
		self.left(180)
		self.penup()
		self.forward(20)