/* eslint-disable no-undef */
import fs from "fs";

const INPUT = "./tokens/tokens.json";
const OUTPUT = "./src/styles/variables.css";

/** kebab-case 변환 */
const toKebab = (str) =>
  str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\./g, "-")
    .toLowerCase();

/** 피그마 tokens.json에서 global 풀기 */
function unwrapGlobal(tokens) {
  return tokens.global || tokens;
}

/** 객체인지 여부 */
const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);

/**
 * 재귀적으로 CSS 변수로 변환
 * prefix: key 경로
 */
function flattenTokens(obj, prefix = "") {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;

    // $value, $type 있는 경우 → 내부값 사용
    if (value && typeof value === "object" && "$value" in value) {
      const val = value.$value;

      if (isObject(val)) {
        // typography 같은 객체 구조
        Object.assign(result, flattenTokens(val, newKey));
      } else {
        result[newKey] = val;
      }
    } else if (isObject(value)) {
      Object.assign(result, flattenTokens(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/** CSS 변수 생성 */
function generateCSS(vars) {
  let css = ":root {\n";

  for (const [key, value] of Object.entries(vars)) {
    const kebab = toKebab(key);

    // 참조값 변경 {number-2} → var(--number-2)
    const formatted =
      typeof value === "string"
        ? value.replace(
            /\{(.+?)\}/g,
            (_, tokenRef) => `var(--${toKebab(tokenRef)})`
          )
        : value;

    css += `  --${kebab}: ${formatted};\n`;
  }

  css += "}\n";
  return css;
}

/** 실행 */
function build() {
  const data = JSON.parse(fs.readFileSync(INPUT, "utf-8"));

  const unwrapped = unwrapGlobal(data);
  const flatTokens = flattenTokens(unwrapped);
  const css = generateCSS(flatTokens);

  fs.writeFileSync(OUTPUT, css, "utf-8");
  console.log("🎨 tokens → CSS 변환 완료!");
}

build();
