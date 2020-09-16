%start asm
%%

asm: InstructionLst EOF { return $1; };

Number
	: dec { $$ = parseInt($1, 10); }
	| hex { $$ = parseInt($1.replace('$', ''), 16); }
	| bin { $$ = parseInt($1.replace('%', ''), 2); }
	;

Imd
	: '#' Number { $$ = {type: 'imd', value: {type: 'abs', value: $2} }; }
	| '#' id { $$ = {type: 'imd', value: {type: 'lbl', value: [null, $2]}}; }
	| '#' Number ':' id { $$ = {type: 'imd', value: {type: 'lbl', value: [$2, $4]}}; }
	;

Ptr
	: Number { $$ = {type: 'ptr', value: {type: 'abs', value: $1}}; }
	| '+' Number { $$ = {type: 'ptr', value: {type: 'rel', value: $2}}; }
	| '-' Number { $$ = {type: 'ptr', value: {type: 'rel', value: -$2}}; }
	| id { $$ = {type: 'ptr', value: {type: 'lbl', value: [null, $1]}}; }
	| Number ':' id { $$ = {type: 'ptr', value: {type: 'lbl', value: [$1, $3]}}; }
	;

Any: Imd { $$ = $1; } | Ptr { $$ = $1; };

Char
	: charlit { $$ = JSON.parse($1.replace(/'/g, '"')); }
	| '#' Number { $$ = String.fromCharCode($2); }
	;

String: strlit { $$ = JSON.parse($1); };

JSONValue
	: JSONString { $$ = $1; }
	| JSONNumber { $$ = $1; }
	| JSONArray { $$ = $1; }
	| JSONObject { $$ = $1; }
	;

JSONString: String { $$ = $1; };
JSONNumber: dec { $$ = parseInt($1, 10); };
JSONArray: '[' JSONArrayItem ']' { $$ = $2; };
JSONArrayItem: JSONArrayItem ',' JSONValue { $1.push($2); $$ = $1; } | { $$ = []; };

JSONBoolean
	: true { $$ = true; }
	| false { $$ = false; }
	;

JSONObject: '{' JSONObjectItem '}' { $$ = $2; } | '{' '}' { $$ = Object.create(null); };

JSONObjectItem
	: JSONObjectItem ',' JSONString ':' JSONValue { $1[$3] = $5; $$ = $1; }
	| JSONString ':' JSONValue { $$ = Object.create(null); $$[$1] = $3; }
	;

Instruction
	: anyarg Any { $$ = {...$2, name: $1}; }
	| imdarg Imd { $$ = {...$2, name: $1}; }
	| ptrarg Ptr { $$ = {...$2, name: $1}; }
	| noarg { $$ = {name: $1, type: 'imp'}; }
	| bank Number ':' { $$ = {type: 'bnk', value: $2}; }
	| bank swap ':' { $$ = {type: 'bnk', value: 'swap'}; }
	| id ':' { $$ = {type: 'lbl', value: $1}; }
	| dchar Char { $$ = {type: 'str', value: $2}; }
	| dchar String { $$ = {type: 'str', value: $2}; }
	| dfill '#' Number Char { $$ = {type: 'flf', value: [$3, $4]}; }
	| dfill Number Char { $$ = {type: 'flt', value: [$2, $3]}; }
	| dinit String JSONValue { $$ = {type: 'int', value: [$2, $3]}; }
	;

InstructionLst: InstructionLst Instruction { $1.push($2); $$ = $1; } | { $$ = []; };
