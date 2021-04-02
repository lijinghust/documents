

// 将模版转换成js代码
function buildSourceCode(tpl) {
	var source = "var __str='';\n  __str+='"; // \n是用来将生成的js代码换行，不是必要的
	var cursor = 0; // 用来记录模版语法中迭代代码对应的偏移量

    // 匹配出<%%>中的内容，进行js替换；要注意是否以=开头，来区分是变量值还是表达式。
	tpl.replace(/<%([\s\S]+?)%>/g, function(all, matched, offset){
		
		source += escapes( tpl.slice(cursor, offset) );
		
		if (matched.trim().startsWith('=')) {
			source += "'+" + matched.substr(1) + "+'";
		} else {
			source += "';\n" + matched + "\n  __str+='";
		}
		
		cursor = offset + all.length;
		
		return matched;
	})

	source += tpl.slice(cursor) + "';\n return __str;";
	
	return source;
}

// 将js语句包装成可以传参数的函数
function wrapFunc(source) {
    // with语句的特性，改变块中的this指向。效果就是var obj = {a: 1};with(obj){console.log(a)};可以直接在块中使用obj中的属性
	source =  'with(data||{}){\n ' + source + '}\n';
	return new Function('data', source);
}

function template(tpl, data) {
	var source = buildSourceCode(tpl);
	var fn = wrapfnunc(source);
	
	return fn(data);
}

// 将模版中的特殊自负进行转译
function escapes(text) {

	var keys = {
		"'": "\\'", // 单引号
		'\\': '\\\\', // \\
		'\r': '\\r', // 回车符
		'\n': '\\n', // 换行符
		'\u2028': '\\u2028', // 行分隔符
		'\u2029': '\\u2029' // 段落分隔符
	}
	
	var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;
	
	return text.replace( escapeRegExp, function(match) {
		return keys[match];
	} )
}