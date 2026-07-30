type SyntaxLanguage = "ts" | "tsx";

type TokenKind =
  | "comment"
  | "function"
  | "keyword"
  | "literal"
  | "number"
  | "operator"
  | "property"
  | "punctuation"
  | "string"
  | "type";

type Token = {
  kind?: TokenKind;
  start: number;
  value: string;
};

type SyntaxCodeProps = {
  code: string;
  language?: SyntaxLanguage;
};

const keywords = new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "of",
  "return",
  "satisfies",
  "switch",
  "throw",
  "try",
  "type",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

const literals = new Set(["false", "null", "true", "undefined"]);
const identifierPattern = /[A-Za-z_$][\w$]*/y;
const numberPattern =
  /(?:0[xX][\dA-Fa-f](?:_?[\dA-Fa-f])*|0[bB][01](?:_?[01])*|0[oO][0-7](?:_?[0-7])*|(?:\d(?:_?\d)*)?(?:\.(?:\d(?:_?\d)*)?)?(?:[Ee][+-]?\d(?:_?\d)*)?n?)/y;
const operatorPattern =
  /(?:===|!==|>>>|<<=|>>=|\*\*=|&&=|\|\|=|\?\?=|=>|==|!=|<=|>=|\+\+|--|\*\*|&&|\|\||\?\?|<<|>>|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|\?\.|[=+\-*/%<>!&|^~?.:])/y;
const punctuationPattern = /[()[\]{},;]/y;

const readQuotedValue = (code: string, start: number) => {
  const quote = code[start];
  let cursor = start + 1;

  while (cursor < code.length) {
    if (code[cursor] === "\\") {
      cursor += 2;
    } else if (code[cursor] === quote) {
      return cursor + 1;
    } else {
      cursor += 1;
    }
  }

  return cursor;
};

const previousSignificantCharacter = (code: string, start: number) => {
  let cursor = start - 1;

  while (cursor >= 0 && /\s/.test(code[cursor] ?? "")) {
    cursor -= 1;
  }

  return code[cursor];
};

const classifyIdentifier = (
  code: string,
  start: number,
  value: string,
): TokenKind | undefined => {
  if (keywords.has(value)) {
    return "keyword";
  }

  if (literals.has(value) || /^[A-Z][A-Z\d_]*$/.test(value)) {
    return "literal";
  }

  if (/^[A-Z]/.test(value)) {
    return "type";
  }

  const followingCode = code.slice(start + value.length);
  if (/^\s*(?:<[^>\n]+>)?\s*\(/.test(followingCode)) {
    return "function";
  }

  const previousCharacter = previousSignificantCharacter(code, start);
  if (previousCharacter === "." || /^\s*:/.test(followingCode)) {
    return "property";
  }

  return undefined;
};

const createToken = (
  code: string,
  start: number,
  end: number,
  kind?: TokenKind,
): Token => ({
  kind,
  start,
  value: code.slice(start, end),
});

const readWhitespaceToken = (code: string, start: number) => {
  if (!/\s/.test(code[start] ?? "")) {
    return null;
  }

  let end = start + 1;
  while (end < code.length && /\s/.test(code[end] ?? "")) {
    end += 1;
  }

  return createToken(code, start, end);
};

const readCommentToken = (code: string, start: number) => {
  if (code.startsWith("//", start)) {
    const lineEnd = code.indexOf("\n", start);
    const end = lineEnd === -1 ? code.length : lineEnd;
    return createToken(code, start, end, "comment");
  }

  if (code.startsWith("/*", start)) {
    const closingIndex = code.indexOf("*/", start + 2);
    const end = closingIndex === -1 ? code.length : closingIndex + 2;
    return createToken(code, start, end, "comment");
  }

  return null;
};

const readStringToken = (code: string, start: number) => {
  if (!['"', "'", "`"].includes(code[start] ?? "")) {
    return null;
  }

  return createToken(code, start, readQuotedValue(code, start), "string");
};

const readNumberToken = (code: string, start: number) => {
  const character = code[start] ?? "";
  const startsNumber =
    /\d/.test(character) ||
    (character === "." && /\d/.test(code[start + 1] ?? ""));

  if (!startsNumber) {
    return null;
  }

  numberPattern.lastIndex = start;
  const value = numberPattern.exec(code)?.[0];
  return value
    ? createToken(code, start, start + value.length, "number")
    : null;
};

const readIdentifierToken = (code: string, start: number) => {
  identifierPattern.lastIndex = start;
  const value = identifierPattern.exec(code)?.[0];

  return value
    ? createToken(
        code,
        start,
        start + value.length,
        classifyIdentifier(code, start, value),
      )
    : null;
};

const readPatternToken = (
  code: string,
  start: number,
  pattern: RegExp,
  kind: TokenKind,
) => {
  pattern.lastIndex = start;
  const value = pattern.exec(code)?.[0];

  return value ? createToken(code, start, start + value.length, kind) : null;
};

const readToken = (code: string, start: number): Token =>
  readWhitespaceToken(code, start) ??
  readCommentToken(code, start) ??
  readStringToken(code, start) ??
  readNumberToken(code, start) ??
  readIdentifierToken(code, start) ??
  readPatternToken(code, start, operatorPattern, "operator") ??
  readPatternToken(code, start, punctuationPattern, "punctuation") ??
  createToken(code, start, start + 1);

const tokenize = (code: string) => {
  const tokens: Token[] = [];
  let cursor = 0;

  while (cursor < code.length) {
    const token = readToken(code, cursor);
    tokens.push(token);
    cursor += token.value.length;
  }

  return tokens;
};

export const SyntaxCode = ({ code, language = "tsx" }: SyntaxCodeProps) => (
  <code className="mm-syntax-code" data-language={language}>
    {tokenize(code).map((token) =>
      token.kind ? (
        <span
          className={`mm-syntax-token mm-syntax-token-${token.kind}`}
          key={`${token.start}-${token.kind}`}
        >
          {token.value}
        </span>
      ) : (
        token.value
      ),
    )}
  </code>
);
