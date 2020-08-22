StrEsc	\\\\([\"\\\\/bfnrt]|\u[0-9a-fA-F]{4})
%%
\s+	/* Ignore */ // Spaces
\/\/.*\n?	/* Ignore */ // Line comments
\/\*.*?\*\/	/* Ignore */ // Block comments
"asm"	return 'asm';
"const"	return 'const';
"else"	return 'else';
"false"	return 'false';
"if"	return 'if';
"namespace"	return 'namespace';
"return"	return 'return';
"true"	return 'true';
"using"	return 'using';
"while"	return 'while';
<<EOF>>	return 'EOF';
0x[0-9a-f]{1,2}	return 'HexLit';
0b[0-1]{1,8}	return 'BinLit';
0o[0-1]{1,3}	return 'OctLit';
[0-9]{1,3}	return 'DecLit';
\"({StrEsc}|[^"\n])+?\"	return 'StringLit';
\'({StrEsc}|.)\'	return 'CharLit';
[a-zA-Z_$][a-zA-Z0-9_$]*	return 'Identifier';

","	return ',';
":"	return ':';
"?"	return '?';
";"	return ';';
"{"	return '{';
"["	return '[';
"("	return '(';
")"	return ')';
"]"	return ']';
"}"	return '}';
"*"	return '*';

"++"	return '++';
"--"	return '--';

"!"	return '!';
"&&"	return '&&';
"||"	return '||';

"+"	return '+';
"-"	return '-';
"~"	return '~';
"&"	return '&';
"^"	return '^';
"|"	return '|';
"<<"	return '<<';
">>"	return '>>';
">>>"	return '>>>';

"="	return '=';
"<<="	return '<<=';
">>="	return '>>=';
">>>="	return '>>>=';
"&="	return '&=';
"^="	return '^=';
"|="	return '|=';
"+="	return '+=';
"-="	return '-=';

"!="	return '!=';
"=="	return '==';
">"	return '>';
">="	return '>=';
"<"	return '<';
"<="	return '<=';
