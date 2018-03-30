var simStarted = false; 

var initAll = function(){
	initialize("theCanvasBox");
};

$('#startButton').on('click',function(){
	if(!simStarted){
		var source = $('#szenarioSelect option:selected').text()+'.js';
		loadScript(source, initAll);
		$('#startButton').css('display','none');
	}
});

function loadScript(url, callback){
	var nodes = document.createElement('script');  
  		nodes.setAttribute('type','text/javascript');  
  		nodes.setAttribute('src', url);  
  				
		nodes.onreadystatechange = callback;
    	nodes.onload = callback;
    	
    	document.getElementsByTagName('head')[0].appendChild(nodes); 
};

$('#showStoppPoints').change(function() {
        if($(this).is(":checked")) {
            if($('#showTriggerPoints').is(":checked"))
            	XC.canvasNodes.drawWithStoppAndTriggerLine();
            else
            	XC.canvasNodes.drawWithStoppLine();
        } else {
        	if($('#showTriggerPoints').is(":checked"))
            	XC.canvasNodes.drawWithTriggerLine();
            else
            	XC.canvasNodes.drawPoints();
        }
});

$('#speedRuler').on('change keyup input', function(){
	var val = 2 - $(this).val() + 0.0005;
		val = ''+val;
	var temp = val.split('.');	
	var valN = '';	
		if(temp.length > 1){
			valN += temp[0]+'.';
			
			if(temp[1].length > 4){
				valN += temp[1][0] + temp[1][1] + temp[1][2];
				if(temp[1][3] == 4)
					valN += '5';
				else
					valN += '0';
			} else {
				valN += temp[1];
				for(var i = 0; i < 4 - temp[1].length; i++)
					valN += '0';
			}
		} else {
			valN = val+'.0000';
		}
		valN = valN;
	var text = '1s = '+ (valN)+'s';
	$('#timeControlDiv span').text(text);
	XC.simulation[0].changeLoopSpeed(parseFloat(valN));
	$('#pauseButton').attr('data-speed',parseFloat(valN));
});

$('#pauseButton').click(function(){
	if($(this).attr('data-status') == 1){
		XC.simulation[0].changeLoopSpeed(500000);
		$(this).attr('data-status',-1);
		$('.rectPB').css('background-color','red');
	} else {
		XC.simulation[0].changeLoopSpeed($(this).attr('data-speed'));
		$(this).attr('data-status',1);
		$('.rectPB').css('background-color','#888');
	}
});

$(document).on('click','.clickableObj',function(){
	XC.simulation[0].surfaceField.status = true;
	if($(this).attr('data-type') == 'node'){
		XC.simulation[0].surfaceField.ID = $(this).attr('id');
		XC.simulation[0].surfaceField.type = 'node';
		XC.simulation[0].writeSurfaceInfo();
		// ändert sich über Simulation nicht
			$('#surfName span').text($(this).attr('id'));
	}
});
$(document).on('click','.airplane',function(){
	XC.simulation[0].planeField.status = true;
	XC.simulation[0].planeField.ID = $(this).attr('data-id');
	XC.simulation[0].writePlaneInfo();
});
