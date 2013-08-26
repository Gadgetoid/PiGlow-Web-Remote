#!/usr/bin/env python
from flask import Flask
import signal
import sys
import wiringpi2 as wpi
import colorsys

RED = 0
YELLOW = 1
ORANGE = 2
GREEN = 3
BLUE = 4
WHITE = 5

INTENSITY = 30
saved_hue = 0
saved_white = 0
last_hue = 0

wpi.wiringPiSetup()
wpi.piGlowSetup(1)

def signal_handler(signal, frame):
	piglow_all_off()
	sys.exit(0)

def piglow_all_off():
	wpi.piGlowRing(YELLOW,0)
	wpi.piGlowRing(RED,0)
	wpi.piGlowRing(ORANGE,0)
	wpi.piGlowRing(BLUE,0)
	wpi.piGlowRing(GREEN,0)
	wpi.piGlowRing(WHITE,0)

def piglow_change_hue(hue):
	rgb = colorsys.hsv_to_rgb(hue/360.00, 1.0, 1.0)
	wpi.piGlowRing(YELLOW,int(INTENSITY*rgb[0]))
	wpi.piGlowRing(RED,int(INTENSITY*rgb[0]))
	wpi.piGlowRing(ORANGE,int(INTENSITY*rgb[0]))
	wpi.piGlowRing(GREEN,int(INTENSITY*rgb[1]))
	wpi.piGlowRing(BLUE,int(INTENSITY*rgb[2]))

def piglow_set_hue(hue):
	global saved_hue
	delay = 1
	if(hue == saved_hue):
		piglow_change_hue(saved_hue)
	elif(hue > saved_hue):
		for i in range(saved_hue,hue):
			piglow_change_hue(i)
			#wpi.delay(delay)
	else:
		for i in reversed(range(hue,saved_hue)):
			piglow_change_hue(i)
			#wpi.delay(delay)
	
	saved_hue = hue

def piglow_set_brightness(b):
	global INTENSITY, saved_hue

	if(b > INTENSITY):
		for i in range(INTENSITY,b):
			INTENSITY = i
			piglow_change_hue(saved_hue)
	else:
		for i in reversed(range(b,INTENSITY)):
			INTENSITY = i
			piglow_change_hue(saved_hue)
		
	INTENSITY=b
	piglow_set_hue(saved_hue)

def piglow_set_white(b):
	#global INTENSITY, saved_hue
	global saved_white
	delay = 2 #500/abs(b-saved_white)
	#INTENSITY=b
	#piglow_set_hue(saved_hue)
	
	if(b > saved_white):
		for i in range(saved_white,b):
			wpi.piGlowRing(WHITE,i)
			wpi.delay(delay)
	else:
		for i in reversed(range(b,saved_white)):
			wpi.piGlowRing(WHITE,i)
			wpi.delay(delay)

	saved_white = b

signal.signal(signal.SIGINT, signal_handler)


saved_white = 0

app = Flask(__name__)

@app.route('/')
def hello():
	return "ohai"
@app.route('/hue')
def hue():
	return "hue"
@app.route('/off')
def off():
	piglow_all_off()
	return "off"
@app.route('/on')
def on():
	piglow_set_hue(saved_hue)
	return "on"

@app.route('/brightness/<brightness>')
def set_brightness(brightness):
	brightness = int(brightness)
	if brightness <= 255 and brightness >= 0:
		piglow_set_brightness(brightness)
		return "Brightness set to " + str(brightness)
	else:
		return "Brightness must be in range 0-255"

@app.route('/yellow/<intensity>')
def set_yellow(intensity):
	if intensity <= 255 and intensity >= 0:
		wpi.piGlowRing(YELLOW,intensity)

@app.route('/orange/<intensity>')
def set_orange(intensity):
	if intensity <= 255 and intensity >= 0:
		wpi.piGlowRing(ORANGE,intensity)

@app.route('/white/<white>')
def set_white(white):
	#global saved_white
	white = int(white)
	if white <= 255 and white >= 0:
		#saved_white = white	
		piglow_set_white(white)
		return "White set to " + str(white)
	else:
		return "White must be in range 0-255"


@app.route('/fasthue/<hue>')
def fast_hue(hue):
	hue = int(hue)
	piglow_change_hue(hue)
	return "1"

@app.route('/hue/<hue>')
def set_hue(hue):
	#global saved_hue
	hue = int(hue)
	if hue <= 360 and hue >= 0:
		#saved_hue = hue
		piglow_set_hue(hue)
		return "Hue set to " + str(hue)
	else:
		return "Hue must be in range 0-360"


if __name__ == "__main__":
	app.run(host='0.0.0.0',debug=True)

