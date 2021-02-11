/*
Funciones de renderizado
*/

/*
Esta funcion anima un simbolo con
un cuadradito de color que crece
y decrece en base a un factor
*/
function AnimateSymbol(x,y,w,h,factor,color){
	var decrease = true;
	var amount = 1;
	var x1 = x;
	var x2 = x+w-1;
	var y1 = y;
	var y2 = y+h-1;
	var currentFactor = 0;

	this.render = function(canvas){
		canvas.linePath([
			{x:x1,y:y1},
			{x:x2,y:y1},
			{x:x2,y:y2},
			{x:x1,y:y2},
			{x:x1,y:y1}
		],color,3);

		//incrementamos y decrementamos valores 
		if(currentFactor>=factor){
			factor=0;
			decrease=!decrease;
		}

		if(decrease===true){
			x1+=.1;x2-=.1;
			y1+=.1;y2-=.1;
		}else{
			x1-=.1;x2+=.1;
			y1-=.1;y2+=.1;
		}
	}
}

function AnimatePrizeLine(shape,sw,sh,tx,ty,lcolor,tcolor,coins){
	var points = [];
	shape.iterate(function(element){
		points.push({x:element.x*sw+sw/2,y:element.y*sh+sh/2});
	})

	this.render = function(canvas){
		canvas.linePath(points,lcolor,3);
		canvas.text('+'+coins,tx,ty,tcolor,30);
		ty-=.5;

		for(var i in points){
			canvas.circle(points[i].x,points[i].y,5,0,Math.PI*2,lcolor,true);
		}
		
	}
	
}
/*
function MachineCoinsRenderer(x,y,coins){
	var color = null;
	var total = coins;

	if(delta<0){
		color = 'red';
	}else{
		color = 'green';
	}

	this.render = function(canvas){
		canvas.text(coins)
	}
}*/