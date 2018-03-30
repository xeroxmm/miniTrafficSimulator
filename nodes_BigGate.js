$nodes = { 
	'G1' : {'x':-1, 'y':-2, 'typ' : 1}, // typ == Gate
	'G2' : {'x':-1, 'y':-3, 'typ' : 1},// typ == Gate
	'G3' : {'x':-1, 'y':-4, 'typ' : 1},// typ == Gate
	'G4' : {'x':-1, 'y':-5, 'typ' : 1},// typ == Gate
	
	'G5' : {'x':1, 'y':-5, 'typ' : 1},// typ == Gate
	'G6' : {'x':1, 'y':-4, 'typ' : 1},// typ == Gate
	'G7' : {'x':1, 'y':-3, 'typ' : 1},// typ == Gate
	'G8' : {'x':1, 'y':-2, 'typ' : 1},// typ == Gate
	
	'tG18' : {'x':0, 'y':-2, 'typ' : 0}, // typ == normal
	'tG27' : {'x':0, 'y':-3, 'typ' : 0},
	'tG36' : {'x':0, 'y':-4, 'typ' : 0},
	'tG45' : {'x':0, 'y':-5, 'typ' : 0},
	
	'tG_0a' : {'x':0, 'y':0, 'typ' : 0},
	'tG_0b' : {'x':0, 'y':0.5, 'typ' : 0},
	'tG_0c' : {'x':0, 'y':1, 'typ' : 0},
	
	'taxi_1l' : {'x':-3, 'y':0, 'typ' : 0},
	'taxi_3l' : {'x':-3, 'y':0.5, 'typ' : 0},
	'taxi_5l' : {'x':-3, 'y':1, 'typ' : 0},
	'taxi_1r' : {'x':3, 'y':0, 'typ' : 0},
	'taxi_3r' : {'x':3, 'y':0.5, 'typ' : 0},
	'taxi_5r' : {'x':3, 'y':1, 'typ' : 0},
	
	'taxi_2l' : {'x':-1.5, 'y':2.5, 'typ' : 0},
	'taxi_4l' : {'x':-1.5, 'y':4, 'typ' : 0},
	'R1l' : {'x':-1.5, 'y':5.5, 'typ' : 2}, // typ == Runway
	'taxi_2r' : {'x':1.5, 'y':2.5, 'typ' : 0},
	'taxi_4r' : {'x':1.5, 'y':4, 'typ' : 0},
	'R1r' :  {'x':1.5, 'y':5.5, 'typ' : 2},// typ == Runway
	
	'R2l' : {'x':-6, 'y':0.5, 'typ' : 2}, // typ == Runway
	'R2r' : {'x':6, 'y':0.5, 'typ' : 2}, // typ == Runway
};

$edges = {
	'k1.1' : {'a':'G1','b':'tG18','direction':1,'hasObjects':false,'speed':[]},
	'k1.2' : {'a':'G2','b':'tG27','direction':1,'hasObjects':false,'speed':[]},
	'k1.3' : {'a':'G3','b':'tG36','direction':1,'hasObjects':false,'speed':[]},
	'k1.4' : {'a':'G4','b':'tG45','direction':1,'hasObjects':false,'speed':[]},
	'k1.5' : {'a':'G5','b':'tG45','direction':1,'hasObjects':false,'speed':[]},
	'k1.6' : {'a':'G6','b':'tG36','direction':1,'hasObjects':false,'speed':[]},
	'k1.7' : {'a':'G7','b':'tG27','direction':1,'hasObjects':false,'speed':[]},
	'k1.8' : {'a':'G8','b':'tG18','direction':1,'hasObjects':false,'speed':[]},
	
	'k2.1' : {'a':'tG18','b':'tG27','direction':1,'hasObjects':false,'speed':[]},
	'k2.2' : {'a':'tG18','b':'tG_0a','direction':1,'hasObjects':false,'speed':[]},
	'k2.3' : {'a':'tG27','b':'tG36','direction':1,'hasObjects':false,'speed':[]},
	'k2.4' : {'a':'tG36','b':'tG45','direction':1,'hasObjects':false,'speed':[]},
	
	't3.1' : {'a':'taxi_1l','b':'tG_0a','direction':1,'hasObjects':false,'speed':[]},
	't3.2' : {'a':'tG_0a','b':'taxi_1r','direction':1,'hasObjects':false,'speed':[]},
	't3.3' : {'a':'taxi_3l','b':'tG_0b','direction':1,'hasObjects':false,'speed':[]},
	't3.4' : {'a':'tG_0b','b':'taxi_3r','direction':1,'hasObjects':false,'speed':[]},
	't3.5' : {'a':'taxi_5l','b':'tG_0c','direction':1,'hasObjects':false,'speed':[]},
	't3.6' : {'a':'tG_0c','b':'taxi_5r','direction':1,'hasObjects':false,'speed':[]},
	't3.7' : {'a':'taxi_4l','b':'taxi_4r','direction':1,'hasObjects':false,'speed':[]},
	
	't3.8' : {'a':'tG_0a','b':'tG_0b','direction':1,'hasObjects':false,'speed':[]},
	't3.9' : {'a':'tG_0b','b':'tG_0c','direction':1,'hasObjects':false,'speed':[]},
	
	't4.1' : {'a':'taxi_1l','b':'taxi_3l','direction':1,'hasObjects':false,'speed':[]},
	't4.2' : {'a':'taxi_3l','b':'taxi_5l','direction':1,'hasObjects':false,'speed':[]},
	't4.3' : {'a':'taxi_1r','b':'taxi_3r','direction':1,'hasObjects':false,'speed':[]},
	't4.4' : {'a':'taxi_3r','b':'taxi_5r','direction':1,'hasObjects':false,'speed':[]},
	
	't4.5' : {'a':'taxi_5l','b':'taxi_2l','direction':1,'hasObjects':false,'speed':[]},
	't4.6' : {'a':'taxi_5r','b':'taxi_2r','direction':1,'hasObjects':false,'speed':[]},
	't4.7' : {'a':'tG_0c','b':'taxi_2l','direction':1,'hasObjects':false,'speed':[]},
	't4.8' : {'a':'tG_0c','b':'taxi_2r','direction':1,'hasObjects':false,'speed':[]},
	
	't4.9' : {'a':'taxi_2l','b':'taxi_4l','direction':1,'hasObjects':false,'speed':[]},
	't4.10' : {'a':'taxi_2r','b':'taxi_4r','direction':1,'hasObjects':false,'speed':[]},
	
	'r1.1' : {'a':'R2l','b':'taxi_3l','direction':1,'hasObjects':false,'speed':[]},
	'r1.2' : {'a':'R2r','b':'taxi_3r','direction':1,'hasObjects':false,'speed':[]},
	'r1.3' : {'a':'R1l','b':'taxi_4l','direction':1,'hasObjects':false,'speed':[]},
	'r1.4' : {'a':'R1r','b':'taxi_4r','direction':1,'hasObjects':false,'speed':[]},
};
