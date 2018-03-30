$nodes = { 
	'T1' : {'x' : -3, 'y' : 1, 'typ' : 1},
	'T2' : {'x' :  4, 'y' : 1, 'typ' : 1},
	
	'G1' : {'x' : -1, 'y' : 0, 'typ' : 1},
	'G2' : {'x' : -1, 'y' : 2, 'typ' : 1},
	'G3' : {'x' :  0, 'y' : 0, 'typ' : 1},
	'G4' : {'x' :  1, 'y' : 2, 'typ' : 1},
	
	'G1G2K': {'x' : -1, 'y' : 1, 'typ' : 1},
	'G3K': {'x' : 0, 'y' : 1, 'typ' : 1},
	'G4K': {'x' : 1, 'y' : 1, 'typ' : 1},
	
	'A1' : {'x' :  2, 'y' : 0, 'typ' : 1},
	'A2' : {'x' :  3, 'y' : 0, 'typ' : 1},
	'A3' : {'x' :  3.5, 'y' : 3, 'typ' : 1},
	'A4' : {'x' :  1.5, 'y' : 3, 'typ' : 1},
	'A1A2K': {'x' : 2.5, 'y' : 1, 'typ' : 1},
	
	'DeIce': {'x' : 0, 'y' : 3, 'typ' : 2,'holdings':3},
};

$edges = {
	'k1' : {'a':'T1','b':'G1G2K','direction':1,'hasObjects':false,'speed':[]},
	'k2' : {'a':'G1G2K','b':'G3K','direction':1,'hasObjects':false,'speed':[]},
	'k3' : {'a':'G3K','b':'G4K','direction':1,'hasObjects':false,'speed':[]},
	'k4' : {'a':'G4K','b':'A1A2K','direction':1,'hasObjects':false,'speed':[]},
	'k5' : {'a':'A1A2K','b':'T2','direction':1,'hasObjects':false,'speed':[]},
	
	'g1' : {'a':'G1','b':'G1G2K','direction':1,'hasObjects':false,'speed':[]},
	'g2' : {'a':'G2','b':'G1G2K','direction':1,'hasObjects':false,'speed':[]},
	'g3' : {'a':'G3','b':'G3K','direction':1,'hasObjects':false,'speed':[]},
	'g4' : {'a':'G4','b':'G4K','direction':1,'hasObjects':false,'speed':[]},
	
	's1' : {'a':'A1','b':'A1A2K','direction':1,'hasObjects':false,'speed':[]},
	's2' : {'a':'A2','b':'A1A2K','direction':1,'hasObjects':false,'speed':[]},
	's3' : {'a':'A3','b':'A1A2K','direction':1,'hasObjects':false,'speed':[]},
	's4' : {'a':'A4','b':'A1A2K','direction':1,'hasObjects':false,'speed':[]},
	
	'DeIce' : {'a':'G3K','b':'DeIce','direction':1,'hasObjects':false,'speed':[]}
};
