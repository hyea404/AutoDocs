const parser = require("babel-eslint");

/**
 * Mem-parse kode JavaScript untuk menemukan fungsi dan parameter.
 * @param {string} code - Kode JavaScript yang akan diparsing.
 * @returns {Object} Informasi fungsi yang ditemukan dalam kode.
 */
function parseFunction(code) {
    const ast = parser.parse(code);  // AST - Abstract Syntax Tree
    let functions = [];

    // Mencari deklarasi fungsi dalam kode
    ast.body.forEach(node => {
        if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
            const func = {
                name: node.id ? node.id.name : 'Anonymous Function',
                params: node.params.map(param => param.name)
            };
            functions.push(func);
        }
    });

    return functions;
}

module.exports = { parseFunction };
