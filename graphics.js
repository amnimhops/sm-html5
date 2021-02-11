var resources = {
	'symbol_a':{src:'./assets/perrete_a.jpg',image:null},
	'symbol_b':{src:'./assets/perrete_b.jpg',image:null},
	'symbol_c':{src:'./assets/perrete_c.jpg',image:null},
	'symbol_d':{src:'./assets/perrete_d.jpg',image:null},
	'symbol_e':{src:'./assets/perrete_e.jpg',image:null},
	'symbol_f':{src:'./assets/perrete_f.jpg',image:null},
	'symbol_g':{src:'./assets/perrete_g.jpg',image:null},
	'symbol_h':{src:'./assets/perrete_h.png',image:null},
	'symbol_i':{src:'./assets/perrete_i.jpg',image:null},
	'symbol_w':{src:'./assets/perrete_w.jpg',image:null}
}

var gfxMachine = null;
var slotMachine = null;

function shuffleArray(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function traspose(array){
	var newArray = array[0].map(function(col, i) { 
  		return array.map(function(row) { 
    		return row[i] 
  		});
	});

	return newArray;
}

function gfxLoadResources(callback){
	var loadcount = 0;
	var resourcecount = 0;

	for(var resource in resources){
		resourcecount++;
		resources[resource].image = new Image();
		
		resources[resource].image.onload = function(){
			loadcount++;
			if(loadcount==resourcecount){
				callback();
			}
		};

		resources[resource].image.src = resources[resource].src;
	}
}


function GfxRenderList(){
	var next = 0;

	this.queue = {};

	this.add = function(callback){
		next++;
		this.queue[''+next] = callback;
		console.log('GfxRenderList: added function',next);
		return next;
	}

	this.schedule = function(callback,delay,duration){
		var self = this;
		setTimeout(function(){
			var id = self.add(callback);
			setTimeout(function(){
				self.remove(id);
			},duration);
		},delay);

	}

	this.remove = function(id){
		delete this.queue[id];
		console.log('GfxRenderList: removed function',next);
	}

	this.getList = function(){
		var list = [];
		for(var i in this.queue){
			list.push(this.queue[i]);
		}

		return list;
	}
}

function GfxMachine(config){
	var reels = [];
	var renderList = new GfxRenderList();
	var coins = 12345;

	/* Quitamos 10 a la configuracion para el panel */
	config.reelHeight = config.reelHeight - 10;
	for(var i=0;i<config.cols;i++){
		/* Creamos la configuracion inicial para este carrete */
		var reelConf = {
			width:config.reelWidth,
			height:config.reelHeight,
			rows:config.rows,
			symbolList:[].concat(config.symbolList),
			maxSpeed:config.maxSpeed,
			startList:shuffleArray([].concat(config.symbolList)).slice(0,config.rows)
		}
		console.log(reelConf);
		reels[i] = new GfxReel(reelConf);
	}
	/* Añadimos las funciones que dibujan los carretes */
	renderList.add(function(canvas){
		for(var i in reels){
			reels[i].render(canvas,i*canvas.width/config.cols,0);
		}
	});
	/* Añadimos la funcion que dibuja el panel */
	renderList.add(function(canvas){
		var yPos = config.reelHeight+10;
		canvas.rect(0,yPos-10,config.reelWidth*config.cols,10,'black',true);
		canvas.text('Coins: ',5,yPos-2,'green',10);
		canvas.text(coins,45,yPos-2,'yellow',10);
		canvas.text('Bet: ',105,yPos-2,'green',10);
		canvas.text(coins,130,yPos-2,'yellow',10);
		canvas.text('Lines: ',175,yPos-2,'green',10);
		canvas.text(coins,215,yPos-2,'yellow',10);
	});

	this.setCoins = function(amount){
		coins = amount;
	}

	this.addCoins = function(delta){
		var addCoinsInterval = null;
		var remaining = Math.abs(delta);
		var steps = 10;

		function _addCoins(){
			if(remaining<=steps){
				clearInterval(addCoinsInterval);
				coins+=(delta>0)?remaining:-remaining;
			}else{
				if(delta>0){
					coins+=steps;
				}else{
					coins-=steps;
				}
			}

			remaining-=steps;
		}

		addCoinsInterval = setInterval(_addCoins,10);
	}

	this.render = function(canvas){
		/*for(var i in reels){
			reels[i].render(canvas,i*canvas.width/5,0);
		}*/
		var renderers = renderList.getList();
		for(var i in renderers){
			if(renderers[i].render!==undefined){
				renderers[i].render(canvas);
			}else{
				renderers[i](canvas);
			}
			
		}
	}

	this.start = function(){
		var index = 0;
		function __start(number){
			if(index<config.cols){
				reels[index].start();
				index++;
				setTimeout(__start,500);
			}
		}
		__start();
	}

	this.stop = function(result){
		var index = 0;
		var self = this;
		/*var columns = [];

		for(var i=0;i<result.matrix[0].length;i++){
			columns.push([]);
		}		

		for(var y in result.matrix.length){
			for(var x in result.matrix[y].length){
				columns[x].push(result.matrix[y][x]);
			}
		}*/
		var columns = traspose(result.matrix);
		console.log(columns);

		function __stop(number){
			if(index<config.cols){
				reels[index].stop(columns[index]);
				index++;
				setTimeout(__stop,500);
			}else{
				// hemos terminado con los carretes, animamos los premios
				self.showPrizes(result.prizes);

				//Damos la pasta
				var money = parseInt($("#money").text());
				for(var i in result.prizes){
					money+=result.prizes[i].prize;
				}
				$("#money").text(money);
			}
		}
		__stop();
	}

	this.showPrizes = function(prizes){
		/*var renderfunc = function(canvas){
			canvas.line(0,0,300,300,'white');
		};
		renderFuncs.push(renderFunc);
		setTimeout(function(){for(var i in renderFuncs){if(render)}})*/
		console.log("muestro preimos!",prizes);

		for(var i in prizes){
			/* Lanzamos la animacion de las lineas */
			var lineAnimation = new AnimatePrizeLine(
				config.prizelines[prizes[i].line],
				config.reelWidth,
				config.reelHeight/config.rows,
				config.reelWidth*config.cols/2,
				config.reelHeight/2,
				'blue',
				'yellow',
				prizes[i].prize
			);
			renderList.schedule(lineAnimation, i*1000, 1000);

			var nextSymbolDelay = 0;
			/* Lanzamos la animacion de los simbolos premiados */
			config.prizelines[prizes[i].line].iterate(function(element){
				/* Animamos solo los premiados! */
				if(element.order<prizes[i].length){


					var sw = config.reelWidth;
					var sh = config.reelHeight/config.rows;
					var x = element.x*sw;
					var y = element.y*sh;
					var animation = new AnimateSymbol(x,y,config.reelWidth,config.reelHeight/config.rows,300,'red');
					renderList.schedule(animation, i*1000+nextSymbolDelay, 1000);

					nextSymbolDelay+=75;
				}
			});
			/* Animamos el panel de monedas */
			this.addCoins(prizes[i].prize);


			
			/*(function(shapenumber,coins,shape){
				var textY = config.reelHeight/config.rows/2+50;
				renderList.schedule(function(cnv){
					var points = [];
					var _h = config.reelHeight/config.rows;
					var _w = config.reelWidth;
					
					shape.iterate(function(element){
						points.push({x:element.x*_w+_w/2,y:element.y*_h+_h/2});
					})
					cnv.linePath(points,'blue',20);
					
					cnv.text('+'+coins,(_w*config.cols/2),textY,'yellow',30);
					textY-=.5;
				},shapenumber*1000,1000);
			})(i,prizes[i].prize,config.prizelines[prizes[i].line]);*/
		}

		/*for(var i=0;i<5;i++){
			// Esta pirula es para poder pasar 'i' como un indice distinto cada vez al intervalo
			(function(reelNumber){
				renderList.schedule(function(cnv){
					cnv.box(reelNumber*config.reelWidth,0,config.reelWidth,config.reelHeight/config.rows,'blue',5);
				},i*3000,3000);
			})(i);
		}*/
	}

	/*

	this.highlightLine = function(shape,duration){
		var points = [];
		shape.iterate(function(match){
			points.push({x:match.x*config.reelWidth/2,y:match.y*config.reelHeight/config.rows});
		});


	}*/
}
/*
config:{
	width:ancho en pixeles
	height:alto en pixeles
	rows:numero de elementos a mostrar
	spinList:lista de simbolos que mostrara el carrete al girar
	startList:lista de simbolos que mostrara el carrete antes de empezar
}
*/

function GfxReel(config,startList){
	this.width = config.width;
	this.height = config.height;

	/* calculamos el ancho y alto con el que se dibujaran los simbolos */
	var sWidth = this.width;
	var sHeight = this.height/config.rows;

	var symbols = [];

	/* Inicializamos la lista de simobolos disponibles */
	var symbolQueue = [].concat(config.symbolList);
	var firstSymbol = symbolQueue.pop();

	/* Añadimos el primr simbolo */
	symbols.push({x:0,y:-sHeight,symbol:firstSymbol});

	for(var i=0;i<config.rows;i++){
		symbols.push({
			x:0,y:i*sHeight,symbol:config.startList[i],highlight:true
		});
	}
	
	var reelInterval = null;
	var offset = 0;
	var speed = 0;

	this.start = function(){
		if(reelInterval===null){
			offset = 0;
			reelInterval = setInterval(function(){
				offset+=speed;
				if(speed<config.maxSpeed){
					speed+=2;
				}else{
					speed=config.maxSpeed;
				}
				if(offset>=sHeight){
					offset=0;//offset-sHeight;
					if(symbolQueue.length==0){
						symbolQueue = [].concat(config.symbolList);
					}

					var newSymbol = symbolQueue.pop();
					//console.log(symbolQueue,newSymbol);

					for(var i=symbols.length-1;i>0;i--){
						symbols[i].symbol=symbols[i-1].symbol;
					}
					symbols[0].symbol=newSymbol;

					if(newSymbol===null){
						clearInterval(reelInterval);
						reelInterval = null;
						symbolQueue = [].concat(config.symbolList);
						newSymbol = symbolQueue.pop();
						symbols[0].symbol=newSymbol;
						speed = 0;
					}

				}
			},25);
		}else{
			console.log('reel cannot start because is moving');
		}
	}
	this.stop = function(endList){
		if(reelInterval!==null){
			symbolQueue = [null].concat(endList);
			console.log('stopped with ',endList);
		}else{
			console.log('reel cannot stop because is stopped');
		}
		
		
	}
	this.render = function(canvas,x,y){
		for(var i in symbols){
			if(symbols[i].symbol!=null){
				canvas.drawImage(resources['symbol_'+symbols[i].symbol].image,x,y+symbols[i].y+offset,sWidth,sHeight);
			}

		}
	}

}
