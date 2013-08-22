import cherrypy

class Hue(object):
	def __init__(self):
		pass
	def index(self):
		return "set hue"
	def GET(self,hue=None):
		return hue
	index.exposed = True
	GET.exposed = True

class API(object):
	hue = Hue()
	def index(self):
		return "ohai"
	index.exposed = True

cherrypy.config.update(
    {'server.socket_host': '0.0.0.0'} )   
cherrypy.quickstart(API())

