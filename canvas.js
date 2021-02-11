function Canvas(htmlelement){
	this.width = htmlelement.width;
	this.height = htmlelement.height;


	var ctx = htmlelement.getContext('2d');

	this.getCtx = function(){
		return ctx;
	}
	
	this.line=function(x1,y1,x2,y2,color){
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
	}

	this.linePath = function(points,color,lineWidth){
		ctx.beginPath();
		ctx.lineWidth = lineWidth==undefined?1:lineWidth;
		ctx.strokeStyle = color;
		for(var i=0;i<points.length;i++){
			if(i==0){
				ctx.moveTo(points[i].x,points[i].y);
			}else{
				ctx.lineTo(points[i].x,points[i].y);
			}
		}
		
		ctx.stroke();
	}

	this.box = function(x,y,w,h,color,lineWidth){
		this.linePath([
			{x:x,y:y},
			{x:x+w,y:y},
			{x:x+w,y:y+h},
			{x:x,y:y+h}
		],color,lineWidth);
	}

	this.rect = function(x,y,w,h,color,filled){
		ctx.beginPath();
		ctx.rect(x,y,x+w,y+h);
		if(filled!==undefined && filled===true){
			ctx.fillStyle = color;
			ctx.fill();
		}else{
			ctx.lineWidth = 1;
			ctx.strokeStyle = color;
			ctx.stroke();
		}
	}

	this.text = function(text,x,y,color,size){
		ctx.font = size+'px verdana';
		ctx.fillStyle = color;
		ctx.fillText(text,x,y);
	}

	this.drawImage = function(image,x,y,w,h){
		/*if(w===undefined){
			w=image.width;
		}
		if(h==undefined){
			h=image.height;
		}*/
		try{
			ctx.drawImage(image,x,y,w,h);
		}catch(e){
			console.log(e,image,x,y,w,h);
		}
	}

	this.circle = function(x,y,radius,angleStart,angleEnd,color,filled,width){
		ctx.beginPath();
		ctx.arc(x,y,radius,angleStart,angleEnd);

		if(filled===true){
			ctx.fillStyle = color;
			ctx.fill();
		}else{
			ctx.lineWidth = width;
			ctx.strokeStyle = color;
			ctx.stroke();
		}
	}

	this.getImageData = function(){
		return ctx.getImageData(0,0,this.width,this.height);
	}

	this.putImageData = function(imagedata,x,y){
		ctx.putImageData(imagedata,x,y);
	}
}