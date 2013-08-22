var PiGlow = function(_target){
    
    "use strict";
    
    var J,
        _w = 320,
        _h = 420,
        _r,
        _state = {},
        _time_start = 0,
        _time_delta = 0,
        _time_update = 0,
        _scroll_last = 0,
        _scroll_delta = 0,
        _scroll_timer = -1,
        _state = {},
		_author = "V3JpdHRlbiBieSBQaGlsaXAgSG93YXJkIC0gcGhpbEBnYWRnZXRvaWQuY29tCg==",
		_debug_log = [],
		_ie_version = getInternetExplorerVersion(),
        _ie_version,
        _loaded = 0,
        _loading_done = false,
        _fn_queue = [],
        _fn_queue_pending = [],
        _scripts = [],
		_host = (("https:" == document.location.protocol) ? "https:" : "http:"),
		_head = document.getElementsByTagName('head')[0],
        requestAnimFrame = (function(){
            return window.requestAnimationFrame       ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame    ||
                   function( callback ){
                       window.setTimeout(callback, 1000 / 60);
                   };
        })();
    
    _scripts.push( {src:'https://raw.github.com/brehaut/color-js/master/color.js' } )
	
    // Require jQuery if it's not available
	if (typeof jQuery == 'undefined')
        _scripts.push( {src:_host + '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js'} );
	// Require RaphaelJS if it's not available
	if (typeof window.Raphael == 'undefined')
        _scripts.push( {src:_host+'//cdn.jsdelivr.net/raphael/2.1.0/raphael-min.js'} );

	// ##### Core methods #####

	function getInternetExplorerVersion() {
		var ua,re,rv = -1; // Return value assumes failure.
		if (navigator.appName == 'Microsoft Internet Explorer') {
			ua = navigator.userAgent;
			re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
		}
		return rv;
	}
    
    function scroll(e){
        _scroll_delta = window.pageYOffset;

        if( _scroll_timer != -1 )
            window.clearTimeout(_scroll_timer);
        
        _scroll_timer = window.setTimeout(function(){
            do_scroll_update();
        },250);
    }

	function preload(){
		for(var idx = 0;idx < _scripts.length;idx++){
			_scripts[idx].script = document.createElement('script');
			_scripts[idx].script.src = _scripts[idx].src;
			_scripts[idx].script.onload = _scripts[idx].script.onreadystatechange = function() {
				if ((!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
					_script_load_complete();
					this.onload = this.onreadystatechange = null;
					_head.removeChild(this);
				};
			};
			_head.appendChild(_scripts[idx].script);
		}
	}

	function _script_load_complete(){
		_loaded++;
		if( _loaded >= _scripts.length ) init(jQuery);
	}
    
    function get_millis(){
        return new Date().getTime();   
    }

    function init(jq){
        J = jq;
        _loading_done = true;
        
        _target = J(_target);

        setup();
        
        //window.onscroll = scroll;
        //loop();
    }
    
    function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (h && s === undefined && v === undefined) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        Math.floor(r * 255),
        Math.floor(g * 255),
        Math.floor(b * 255)];
}
    
    function arc(props){
        return [props.x,props.y,props.r,props.w,props.deg,props.rot]
    }
    
    function setup(){
        var x,steps;
        
        _r = Raphael(_target[0],_w,_h);
        _r.customAttributes.filledArc = function(e,t,n,r,i,s){
            this.data('arc',[e,t,n,r,i,s]);var o=360;if(o==i){i-=.001}i+=s;var u=(90-s)*Math.PI/180,a=e+n*Math.cos(u),f=t-n*Math.sin(u),l=e+(n-r)*Math.cos(u),c=t-(n-r)*Math.sin(u);var h=(90-i)*Math.PI/180,p=e+n*Math.cos(h),d=t-n*Math.sin(h),v=e+(n-r)*Math.cos(h),m=t-(n-r)*Math.sin(h);return{path:[["M",l,c],["L",a,f],["A",n,n,0,+(i>180+s),1,p,d],["L",v,m],["A",n-r,n-r,1,+(i>180+s),0,l,c]]}}
        
        _r.path().attr({
            "fill":"#333333",
            "stroke":"none",
            "filledArc":arc({
                x:160,
                y:160,
                r:134,
                w:48,
                deg:360,
                rot:0
            })            
        });
        
        _state.hue = [];
        
        steps = 36;
        x = steps;
        
        _r.setStart();
        while(x--){
          var col = Math.ceil(255*(x/steps));
         _r.rect(((300/steps)*x)+11,360,(300/steps)-2,30)
         .attr({
             "stroke":"none",
             "fill":"rgb(" + [col,col,col].join() + ")"
         })
         .data({
             "intensity":col
         })
         .click(function(){
             var intensity = this.data("intensity"),
				obj = this;
             $.get('/brightness/' + intensity,function(){
                 _state.im.animate({
                     "stroke":"none"
                 });
                 obj.stop().animate({
                     "stroke":"#CC0000"
                 },500);
             });
         });   
        }
        _state.im = _r.setFinish();

        x = steps;
        
        _r.setStart();
        while(x--){
          var col = Math.ceil(255*(x/steps));
         _r.rect(((300/steps)*x)+11,320,(300/steps)-2,30)
         .attr({
             "stroke":"none",
             "fill":"rgb(" + [col,col,col].join() + ")"
         })
         .data({
             "intensity":col
         })
         .click(function(){
             var intensity = this.data("intensity"),
				obj = this;
             $.get('/white/' + intensity,function(){
                 _state.white.animate({
                     "stroke":"none"
                 });
                 obj.stop().animate({
                     "stroke":"#CC0000"
                 },500);
                 
                 _state.hues.forEach(function(e,i){
                         var hue = e.data('hue'),
                        color = HSVtoRGB({h: hue/360, s: 1-(intensity/355), v: 1.0});
                     e.animate({
                         "fill":"rgb(" + color.join(',') + ")"
                     },500);
                 });
                 //alert(intensity);
             });
         });   
        }
        _state.white = _r.setFinish();
               
        _r.circle(160,160,10).attr({
            "stroke":"none",
            "fill":"#333333"
        });
        
        _state.selected = _r.path().attr({
            "stroke":"none",
            "fill":"#333333",
            "filledArc":arc({
                x:160,
                y:160,
                r:140,
                w:140,
                deg:360/steps,
                rot:-360/steps/2
            })
        });

        x=steps;
        _r.setStart();
        while(x--){
            var step = x*(360/steps),
                color = HSVtoRGB({h: step/360, s: 1.0, v: 1.0}),
                hue = _r.path()
            .data({
                "hue":step
            })
                .attr({
                 "fill":"rgb(" + color.join(',') + ")",
                 "stroke":"none",
                "filledArc":arc({
                    x:160,
                    y:160,
                    r:130,
                    w:40,
                    deg:(360/steps)-1,
                    rot:step - ((360/steps)/2)
                })
                })
            .click(function(e){
                var hue = this.data('hue');
                $.get('/hue/' + hue,function(){
                _state.selected.stop().animate({"filledArc":arc({
                x:160,
                y:160,
                r:140,
                w:140,
                deg:360/steps,
                rot:hue-360/steps/2
                })},500);
                    });
            })
            /*.hover(function(e){
                    var arc = this.data('arc'),
                        step = this.data('hue'),
                        color = HSVtoRGB({h: step/360, s: 1.0, v: 0.8});
                    arc[3] = 44;
                    arc[2] = 132;
                    this.stop().animate({
                        "filledArc":arc,
                        "fill":"rgb(" + color.join(',') + ")"
                    },500);
                },function(e){
                    var arc = this.data('arc'),
                        step = this.data('hue'),
                        color = HSVtoRGB({h: step/360, s: 1.0, v: 1.0});
                    arc[3] = 40;
                    arc[2] = 130;
                    this.stop().animate({
                        "filledArc":arc,
                        "fill":"rgb(" + color.join(',') + ")"
                    },500);
                }
                )*/; 
        }
        _state.hues = _r.setFinish();
        
    }
    
    function loop(){
        var fn;
        
        _time_delta = get_millis() - _time_start;
        
		// Call any queued functions
        while( (fn = _fn_queue.pop()) != null ){
            fn.call();
        }
        // Push any pending functions onto the stack for the next cycle
        while( (fn = _fn_queue_pending.pop()) != null ){
            _fn_queue.push(fn);
        }
    
        requestAnimFrame(loop);
    }
    
	// ##### Private Methods #####
    
    function q(fn){
       _fn_queue_pending.push(fn);
    }
    
    // Looping update state function
    // Runs on every loop
    function update_state(){
        var t = (_time_delta - _time_update) / (1000/60); // Should be hitting 60fps, 16-17ms
        do_update(t);
        _time_update = _time_delta;
        _scroll_last = _scroll_delta;
         q(update_state);   
    }
    
    function do_scroll_update(){
        
    }
    
    function do_update(t){
        
    }
   
    
	// ##### Public Methods #####
    
    return {
        init: function(){
            preload();
            return this;
        },
        start: function(){
            _time_start = get_millis();
            _fn_queue.push(update_state);
            return this;
        }
    };
    
};

window.onload = function(){window.parent.pi_glow = new PiGlow("#canvas").init().start()};