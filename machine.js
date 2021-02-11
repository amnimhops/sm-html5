/* data:{'SymbolLength':Multiplier,...} */

function PrizeTable(data){
	this.prizes = {};
	
	for(var i in data){
		var symbol = i.substr(0,1);
		var length = i.substr(1,i.length);
		
		if(this.prizes[symbol] === undefined){
			this.prizes[symbol] = [];
		}
		
		this.prizes[symbol][length] = data[i];
	}
	
	this.getPrize = function(symbol,length){
		if(this.prizes[symbol]!==undefined){
			if(this.prizes[symbol][length]===undefined){
				return 0;
			}else{
				return this.prizes[symbol][length];
			}
		}
	}
}

/* data:[String,String,String] */
function ReelSet(data){
	this.reels = data;
	
	this.spin = function(rows){
		
		var result = [];	
		
		for(var i = 0; i < this.reels.length; i++){
			var c = Math.ceil(Math.random()*5000);
			var offset = c % this.reels[i].length;
			var copied = 0;
			
			result.push([]);
			
			while(copied<rows){
				result[i].push(this.reels[i][(offset+copied)%this.reels[i].length]);
				copied++;
			}
		}
		
		return result;
	}
	
	
}

function ReelMap(config){
	this.getReelSet = function(name){
		var key = (config[name]!==undefined) ? name : 'default';

		if(config[key]===undefined){
			throw 'default reelset not found';
		}

		return config[key];
	}
}

function Shape(data){
	var maxRows = 0;
	this.matches = [];
	
	for(var y in data){
		var row = data[y];
		if(maxRows==0){
			maxRows = data[y].length;
			
		}else{
			if(maxRows != data[y].length){
				throw new Error('Matrix rows has different lengths');
			}
		}
		
		for(var x in data[y]){
			if(data[y][x]>0){
				this.matches.push({x:x,y:y,i:data[y][x]});
			}
		}
	}

	
	this.matches.sort(function(a,b){
		return a.i>=b.i;
	});

	this.filter = function(result){
		var filteredResult = [];
	
		for(var i in this.matches){
			var match = this.matches[i];
			filteredResult.push(result[match.y][match.x]);
		}
		
		return filteredResult;
	}

	this.iterate = function(callback){
		for(var i in this.matches){
			callback({x:this.matches[i].x,y:this.matches[i].y,order:i});
		}
	}
}

function LengthMatcher(wildlist){
	var wildcards = {};

	for(var i in wildlist){
		wildcards[wildlist[i]]=true;
	}

	this.getMatches = function(data){
		var matches = {};
		for(var i in data){
			var symbol = data[i];
			if(matches[symbol]===undefined){
				var maxLength = getMaxSymbolLength(symbol,data);
				if(maxLength>0){
					matches[symbol]=maxLength;
				}
			}
		}

		return matches;
	}

	function getMaxSymbolLength(symbol,data){
		var length = 0;

		for(var i=data.length-1;i>=0;i--){
			if(data[i]==symbol || wildcards[data[i]]===true){
				length++;
			}else{
				length=0;
			}
		}

		return length;
	}
}

/*
function FullRowMatcher(wildlist){
	var wildcards = {};

	for(var i in wildlist){
		wildcards[wildlist[i]]=true;
	}

	this.getMatches = function(data){

	}
}
*/

function Machine(config){
	this.play = function(bet,lines){
		/* validamos la entrada */
		if(config.bets.indexOf(bet)==-1){
			throw 'Bet error';
		}

		if(config.lines.length<lines){
			throw 'Line error';
		}
		/* obtenemos el resultado */

		var reelset = config.reelmap.getReelSet('R'+lines)

		var result = reelset.spin(config.rows);
		
		var prizes = this.getPrizes(bet,lines,result);

		return {matrix:result,prizes:prizes};
	}

	this.getPrizes = function(bet,lines,result){
		var prizes = [];
		
		for(var i=0;i<lines;i++){
			var line = config.lines[i];

			var shape = line.shape;
			var matcher = line.matcher;

			var matches = matcher.getMatches(shape.filter(result));

			for(var symbol in matches){
				var multiplier = config.prizes.getPrize(symbol,matches[symbol]);
				if(multiplier>0){
					prizes.push({line:i,symbol:symbol,length:matches[symbol],multiplier:multiplier,prize:multiplier*bet});
				}
			}
		}

		return prizes;

	}
}
/*

var shapes = [
	new Shape([
		[1,2,3,4,5],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	]),
	new Shape([
		[0,0,0,0,0],
		[1,2,3,4,5],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	]),
	new Shape([
		[0,0,0,0,0],
		[0,0,0,0,0],
		[1,2,3,4,5],
		[0,0,0,0,0],
		[0,0,0,0,0]
	]),
	new Shape([
		[1,0,0,0,0],
		[0,2,0,0,0],
		[0,0,3,0,0],
		[0,0,0,4,0],
		[0,0,0,0,5]
	]),
	new Shape([
		[1,0,0,0,5],
		[0,2,0,4,0],
		[0,0,3,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	]),
	new Shape([
		[0,2,0,0,0],
		[1,0,3,0,5],
		[0,0,0,4,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	])	
];

var machineconfig = {
	reelmap:new ReelMap({
		'default':new ReelSet([
			'wwbbacwebgwhacwehbwwwbbacwebgwhacwehbwwbbacwebgwhacwehbwwbbacwebgwhacwehb',
			'wwbbacwebgwhacwehbwwwbbacwebgwhacwehbwwbbacwebgwhacwehbwwbbacwebgwhacwehb',
			'acewbbacwebgwhacwehbgwcbahewgbcahwegbchwaegbwchagwebchhwcaebh',
			'acewbbacwebgwhacwehbgwcbahewgbcahwegbchwaegbwchagwebchhwcaebh',
			'acewbbacwebgwhacwehbgwcbahewgbcahwegbchwaegbwchagwebchhwcaebh'
		])
	}),
	lines:[
		{shape:shapes[0], matcher:new LengthMatcher(['w','s'])},
		{shape:shapes[1], matcher:new LengthMatcher(['w','s'])},
		{shape:shapes[2], matcher:new LengthMatcher(['w','s'])},
		{shape:shapes[3], matcher:new LengthMatcher(['w','s'])},
		{shape:shapes[4], matcher:new LengthMatcher(['w','s'])},
		{shape:shapes[5], matcher:new LengthMatcher(['w','s'])}
	],
	prizes:new PrizeTable({
		'a3':10,'a4':30,'a5':50,
		'b3':100,'b4':300,'b5':500,
		'c3':1000,'c4':3000,'c5':5000,
		'd3':1000,'c4':3000,'c5':5000,
		'e3':1000,'e4':3000,'e5':5000,
		'f3':1000,'f4':3000,'f5':5000,
		'g3':1000,'g4':3000,'g5':5000,
		'h3':1000,'h4':3000,'h5':5000
	}),
	bets:[1,5,10,15,20,50,100],
	rows:5
};

slotMachine = new Machine(machineconfig);
var result = [
	['a','b','c','d','e'],
	['a','b','c','d','e'],
	['b','b','w','h','h'],
	['a','a','w','h','h'],
	['a','a','w','h','h']
];
console.log(result);
console.log(slotMachine.getPrizes(1,6,result));
*/