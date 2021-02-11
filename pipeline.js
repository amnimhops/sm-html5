function Vector(){
	this.data = [];
}

function PipelineParam(name,type,desc){
	this.name = name;
	this.type = type;
	this.desc = desc;

	this.validateType = function(value){
		return value instanceof this.type;
	}
}
function PipelineFunction(name,input,output,handler){
	this.name = name;
	this.input = input;
	this.output = output;
	this.handler = handler;

	this.apply = function(input){
		return handler(input);
	}
}

/*
	Input(none)->{bet:int,lines:int,remainingSpins:int}
	Output(remainingSpins:int,prizes:[],matrix:Matrix)
	Spin(reelset:[],prized:bool)->{matrix:Matrix}
	GetPrizes(spin:Matrix)->{prizes:[]}
	Filter(data:[],filter)->{data:[]}
	Iterator(vector:[],handler:Any)->none
	Config(value:String)->Any

	Column(matrix:Matrixindex:int) -> []
	Row(matrix:Matrix,index:int) -> []

	Count(data:[],element:Any) -> int


	Spin(...,)


*/

