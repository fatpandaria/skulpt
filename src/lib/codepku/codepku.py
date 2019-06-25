import math, sys

class codepku:
    def ellipse(self, x_position, y_position ,x_radius, y_radius, rads=360, steps=60):
        self.penup()
        self.goto(x_position, y_position - y_radius)
        self.pendown()
        # 弧度
        heading_radians = math.radians(self.heading())
        # 弧度π/ 2 等于角度90
        theta_radians = -math.pi / 2
        # 2π是一周的弧度
        extent_radians = 2 * math.pi
        # 每一步的弧度
        step_radians = extent_radians / steps

        extent_radians += theta_radians
        x_center, y_start = self.position()
        y_center = y_start + y_radius

        cos_heading, sin_heading = math.cos(heading_radians), math.sin(heading_radians)

        # 控制弧度，60为一个圆
        zcount = 0
        while True:
            # print('theta_radians={}, extent_radians={}, zcount={}'.format(theta_radians, extent_radians, zcount))
            x, y = x_center + math.cos(theta_radians) * x_radius, y_center + math.sin(theta_radians) * y_radius
            # readjust x & y to set the angle of the ellipse based on the original heading of the turtle
            x, y = x - x_center, y - y_start
            x, y = x * cos_heading - y * sin_heading, x * sin_heading + y * cos_heading
            x, y = x + x_center, y + y_start

            self.setheading(self.towards(x, y))  # turtle faces direction in which ellipse is drawn
            self.goto(x, y)

            # theta_radians 逼近 extent_radians
            if theta_radians == extent_radians:
                break
            # 控制弧度
            if zcount * 6 >= rads:
                break

            theta_radians = min(theta_radians + step_radians, extent_radians)  # don't overshoot our starting point

            zcount += 1

        self.setheading(self.towards(x_center, y_start)) 	 # set correct heading for the next thing we draw
