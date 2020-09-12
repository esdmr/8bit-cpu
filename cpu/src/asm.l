StringEscape	\\\\([\"\\\\/bfnrt]|\u[0-9a-fA-F]{4})
%%
%option caseless
\s+	/* Ignore */
\;.*\n?	/* Ignore */
":"	return ':';
"["	return '[';
"]"	return ']';
"{"	return '{';
"}"	return '}';
","	return ',';
"#"	return '#';
"+"	return '+';
"-"	return '-';
"bank"	return 'bank';
".char"	return 'dchar';
".fill"	return 'dfill';
".init"	return 'dinit';
"true"	return 'true';
"false"	return 'false';
"swap"	return 'swap';
<<EOF>>	return 'EOF';

%[01]{8}	return 'bin';
[0-9]{1,3}	return 'dec';
\$[0-9a-f]{2}	return 'hex';
\'(.|{StringEscape})\'	return 'charlit';
\"({StringEscape}|[^"\n])+?\"	return 'strlit';

(bnk|cp[abxy])	return 'imdarg';
ld[abxy]	return 'anyarg';
(jmp|jsr|bpl|b[vc][cs]|beq|bmi|bnq|st[abxy])	return 'ptrarg';

(brk|nop|dbg|rts|adc|sbc|nt[xy]|ro[lr]|r[lr]c|sh[lr]|[ei]or|add|sub|jp[abxy]|and|tn[xy]|cl[nvcz]|se[nvcz]|in[abxy]|ph[abxy]|lz[abxy]|dc[abxy]|pl[abxy]|lo[abxy]|t[sp][ab]|t[ab][sp]|[tlcs][abxy]{2})	return 'noarg';

[\w_][\w_$0-9]*	return 'id';
