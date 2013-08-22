import wiringpi2 as wiringpi
import signal
import sys
import colorsys
from math import floor
io = wiringpi.GPIO(wiringpi.GPIO.WPI_MODE_PINS)
wiringpi.piGlowSetup(1)

RED = 0
YELLOW = 1
ORANGE = 2
GREEN = 3
BLUE = 4
WHITE = 5

INTENSITY = 30

def signal_handler(signal, frame):
	wiringpi.piGlowRing(YELLOW,0)
	wiringpi.piGlowRing(RED,0)
	wiringpi.piGlowRing(ORANGE,0)
	wiringpi.piGlowRing(BLUE,0)
	wiringpi.piGlowRing(GREEN,0)
	wiringpi.piGlowRing(WHITE,0)
	sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

#wiringpi.piGlowRing(WHITE,255)

while True:
	for x in range(0,360):
		rgb = colorsys.hsv_to_rgb(x/360.00, 1.0, 1.0)
		wiringpi.piGlowRing(YELLOW,int(INTENSITY*rgb[0]))
		wiringpi.piGlowRing(RED,int(INTENSITY*rgb[0]))
		wiringpi.piGlowRing(ORANGE,int(INTENSITY*rgb[0]))
		wiringpi.piGlowRing(GREEN,int(INTENSITY*rgb[1]))
		wiringpi.piGlowRing(BLUE,int(INTENSITY*rgb[2]))
		wiringpi.delay(100)
	for x in reversed(range(0,360)):
		rgb = colorsys.hsv_to_rgb(x/360.00, 1.0, 1.0)
		wiringpi.piGlowRing(YELLOW,int(INTENSITY*rgb[0]))
		wiringpi.piGlowRing(RED,int(INTENSITY*rgb[0]))
		wiringpi.piGlowRing(ORANGE,int(INTENSITY*rgb[0]))
		wiringpi.piGlowRing(GREEN,int(INTENSITY*rgb[1]))
		wiringpi.piGlowRing(BLUE,int(INTENSITY*rgb[2]))
		wiringpi.delay(100)